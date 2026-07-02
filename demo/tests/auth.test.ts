import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	SITE_URL_HEADER,
	clearApiToken,
	getAuthorizationHeader,
	getConnectionHeaders,
	getFrappeSiteUrl,
	hasApiToken,
	loginWithPassword,
	logoutSession,
	normalizeFrappeSiteUrl,
	saveApiToken,
	saveFrappeSiteUrl,
	validateFrappeConnection,
} from '../src/auth';

function createStorage(): Storage {
	const values = new Map<string, string>();
	return {
		get length() {
			return values.size;
		},
		clear: () => values.clear(),
		getItem: (key) => values.get(key) ?? null,
		key: (index) => [...values.keys()][index] ?? null,
		removeItem: (key) => values.delete(key),
		setItem: (key, value) => values.set(key, String(value)),
	};
}

describe('demo Frappe site URL', () => {
	beforeEach(() => {
		vi.stubGlobal('sessionStorage', createStorage());
		vi.stubGlobal('window', {
			setTimeout: globalThis.setTimeout,
			clearTimeout: globalThis.clearTimeout,
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it('normalizes a valid site origin', () => {
		expect(normalizeFrappeSiteUrl(' https://crm.example.test/ ')).toBe(
			'https://crm.example.test'
		);
		expect(normalizeFrappeSiteUrl('http://localhost:8000')).toBe(
			'http://localhost:8000'
		);
	});

	it('rejects unsafe or non-origin values', () => {
		expect(() => normalizeFrappeSiteUrl('crm.example.test')).toThrow(
			'including http:// or https://'
		);
		expect(() => normalizeFrappeSiteUrl('ftp://crm.example.test')).toThrow(
			'must use http:// or https://'
		);
		expect(() => normalizeFrappeSiteUrl('https://user:pass@crm.test')).toThrow(
			'Do not include credentials'
		);
		expect(() => normalizeFrappeSiteUrl('https://crm.test/app')).toThrow(
			'without a path'
		);
	});

	it('stores normalized connection settings only for the browser session', () => {
		expect(getFrappeSiteUrl()).toBe('https://frappe.localhost');
		expect(saveFrappeSiteUrl(' https://crm.test/ ')).toBe('https://crm.test');
		expect(() => saveApiToken('', 'secret')).toThrow(
			'Both API key and API secret are required'
		);

		saveApiToken(' key ', ' secret ');
		expect(hasApiToken()).toBe(true);
		expect(getAuthorizationHeader()).toEqual({ Authorization: 'token key:secret' });
		expect(getConnectionHeaders()).toEqual({
			[SITE_URL_HEADER]: 'https://crm.test',
			Authorization: 'token key:secret',
		});

		clearApiToken();
		expect(hasApiToken()).toBe(false);
		expect(getAuthorizationHeader()).toEqual({});
	});

	it('logs in with a password and validates the authenticated user', async () => {
		saveFrappeSiteUrl('https://crm.test');
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Logged In' })))
			.mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Administrator' })));
		vi.stubGlobal('fetch', fetchMock);

		await loginWithPassword('Administrator', 'password');
		await expect(validateFrappeConnection()).resolves.toBe('Administrator');

		expect(fetchMock.mock.calls[0]?.[0]).toBe('/frappe-api/api/method/login');
		const loginOptions = fetchMock.mock.calls[0]?.[1] as RequestInit;
		expect(loginOptions.method).toBe('POST');
		expect(loginOptions.credentials).toBe('include');
		expect(String(loginOptions.body)).toBe('usr=Administrator&pwd=password');
		expect(new Headers(loginOptions.headers).get(SITE_URL_HEADER)).toBe(
			'https://crm.test'
		);
		expect(fetchMock.mock.calls[1]?.[0]).toBe(
			'/frappe-api/api/method/frappe.auth.get_logged_user'
		);
	});

	it.each([
		[{ message: 'Guest' }, 200, 'Connect with a valid Frappe account'],
		[{ exc_type: 'PermissionError', exception: 'Not permitted' }, 403, 'Not permitted'],
		[
			{
				_server_messages: JSON.stringify([
					JSON.stringify({ message: 'Invalid <strong>token</strong>' }),
				]),
			},
			403,
			'Invalid token',
		],
	])('reports connection failure %#', async (body, status, message) => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }))
		);

		await expect(validateFrappeConnection()).rejects.toThrow(message);
	});

	it('logs out through the selected site proxy', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
		vi.stubGlobal('fetch', fetchMock);
		saveFrappeSiteUrl('https://crm.test');

		await logoutSession();

		expect(fetchMock).toHaveBeenCalledWith(
			'/frappe-api/api/method/logout',
			expect.objectContaining({ method: 'GET', credentials: 'include' })
		);
	});

	it('turns an aborted connection attempt into a site-specific timeout error', async () => {
		vi.useFakeTimers();
		vi.stubGlobal('window', {
			setTimeout: globalThis.setTimeout,
			clearTimeout: globalThis.clearTimeout,
		});
		saveFrappeSiteUrl('https://slow.test');
		vi.stubGlobal(
			'fetch',
			vi.fn((_url: string, options: RequestInit) =>
				new Promise((_resolve, reject) => {
					options.signal?.addEventListener('abort', () =>
						reject(new DOMException('Aborted', 'AbortError'))
					);
				})
			)
		);

		const validation = validateFrappeConnection();
		const rejection = expect(validation).rejects.toThrow(
			'Could not reach https://slow.test. Check the site URL.'
		);
		await vi.advanceTimersByTimeAsync(8000);
		await rejection;
	});
});
