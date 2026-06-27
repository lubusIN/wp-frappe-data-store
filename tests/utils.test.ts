import { describe, expect, it } from 'vitest';
import { getListKey, toFrappeQuery } from '../src';

describe('query utilities', () => {
	it('creates the same cache key regardless of object key order', () => {
		expect(getListKey('Task', { limit: 10, orderBy: 'modified desc' })).toBe(
			getListKey('Task', { orderBy: 'modified desc', limit: 10 })
		);
	});

	it('maps list options to Frappe query parameters and includes name', () => {
		expect(
			toFrappeQuery({
				fields: ['subject'],
				filters: [['status', '=', 'Open']],
				limit: 20,
				limitStart: 10,
			})
		).toEqual({
			fields: JSON.stringify(['name', 'subject']),
			filters: JSON.stringify([['status', '=', 'Open']]),
			limit_page_length: '20',
			limit_start: '10',
		});
	});
});
