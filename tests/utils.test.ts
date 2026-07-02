import { describe, expect, it } from 'vitest';
import { getListKey, getResourceKey, toFrappeQuery } from '../src';

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

	it('serializes every supported option and preserves an existing name field', () => {
		expect(
			toFrappeQuery({
				fields: ['name', 'subject'],
				orFilters: [['status', '=', 'Open']],
				orderBy: 'modified desc',
				groupBy: 'status',
				distinct: false,
				custom_string: 'value',
				custom_object: { enabled: true },
				ignored: undefined,
			})
		).toEqual({
			fields: JSON.stringify(['name', 'subject']),
			or_filters: JSON.stringify([['status', '=', 'Open']]),
			order_by: 'modified desc',
			group_by: 'status',
			distinct: '0',
			custom_string: 'value',
			custom_object: JSON.stringify({ enabled: true }),
		});
	});

	it('creates stable nested keys and resource keys', () => {
		expect(
			getListKey('Task', {
				filters: { owner: undefined, status: ['Open', 'Closed'] },
			})
		).toBe('Task:{"filters":{"status":["Open","Closed"]}}');
		expect(getResourceKey('CRM Task', 'TASK/001')).toBe('CRM Task:TASK/001');
	});
});
