import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFrappeRequest, FrappeRequestError } from '../src';

describe('default Frappe request', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('resolves relative proxy URLs against the WordPress origin', async () => {
		vi.stubGlobal('location', { origin: 'https://wordpress.test' });
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ data: [] }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		);
		vi.stubGlobal('fetch', fetchMock);
		const request = createFrappeRequest({
			baseUrl: '/wp-json/my-plugin/v1/frappe',
		});

		await request({
			method: 'GET',
			path: '/resource/Task',
			query: { limit_page_length: '10' },
		});

		expect(fetchMock.mock.calls[0]?.[0].toString()).toBe(
			'https://wordpress.test/wp-json/my-plugin/v1/frappe/resource/Task?limit_page_length=10'
		);
	});

	it('extracts the human-readable message from a Frappe error', async () => {
		vi.stubGlobal('location', { origin: 'https://wordpress.test' });
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(
					JSON.stringify({
						exc_type: 'PermissionError',
						_server_messages: JSON.stringify([
							JSON.stringify({
								message: 'Insufficient Permission for <strong>Task</strong>',
							}),
						]),
					}),
					{ status: 403, headers: { 'Content-Type': 'application/json' } }
				)
			)
		);
		const request = createFrappeRequest({});

		await expect(
			request({ method: 'GET', path: '/api/resource/Task' })
		).rejects.toMatchObject({
			message: 'Insufficient Permission for Task',
			status: 403,
		});
	});

	it('evaluates dynamic headers for every request and sends JSON mutations', async () => {
		vi.stubGlobal('location', { origin: 'https://wordpress.test' });
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ data: { name: 'TASK-1' } }), { status: 200 })
		);
		vi.stubGlobal('fetch', fetchMock);
		let token = 'first';
		const headers = vi.fn(() => ({ Authorization: `token ${token}` }));
		const request = createFrappeRequest({
			baseUrl: 'https://frappe.test/',
			headers,
			credentials: 'include',
		});

		await request({ method: 'POST', path: '/api/resource/Task', data: { subject: 'New' } });
		token = 'second';
		await request({ method: 'GET', path: '/api/resource/Task/TASK-1' });

		expect(headers).toHaveBeenCalledTimes(2);
		const firstInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
		const secondInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
		expect(new Headers(firstInit.headers).get('Authorization')).toBe('token first');
		expect(new Headers(firstInit.headers).get('Content-Type')).toBe('application/json');
		expect(firstInit.body).toBe(JSON.stringify({ subject: 'New' }));
		expect(firstInit.credentials).toBe('include');
		expect(new Headers(secondInit.headers).get('Authorization')).toBe('token second');
		expect(new Headers(secondInit.headers).has('Content-Type')).toBe(false);
	});

	it.each([
		[{ message: 'Direct message' }, 'Direct message'],
		[{ exception: 'ValidationError: bad value' }, 'ValidationError: bad value'],
		[{ exc_type: 'PermissionError' }, 'PermissionError'],
		[{ _server_messages: 'not-json' }, 'Frappe request failed with status 500'],
		[{}, 'Frappe request failed with status 500'],
	])('normalizes error body %j', async (body, message) => {
		vi.stubGlobal('location', { origin: 'https://wordpress.test' });
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 500 }))
		);

		const error = await createFrappeRequest({})({
			method: 'GET',
			path: '/api/resource/Task',
		}).catch((caught) => caught);
		expect(error).toBeInstanceOf(FrappeRequestError);
		expect(error).toMatchObject({ message, status: 500, body });
	});

	it('handles a non-JSON error response', async () => {
		vi.stubGlobal('location', { origin: 'https://wordpress.test' });
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(new Response('gateway failure', { status: 502 }))
		);

		await expect(
			createFrappeRequest({})({ method: 'GET', path: '/api/resource/Task' })
		).rejects.toMatchObject({
			message: 'Frappe request failed with status 502',
			status: 502,
			body: {},
		});
	});
});
