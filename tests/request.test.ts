import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFrappeRequest } from '../src';

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
});
