import type { FrappeListQuery } from './types';

export function stableStringify(value: unknown): string {
	if (value === undefined) {
		return 'null';
	}

	if (Array.isArray(value)) {
		return `[${value.map(stableStringify).join(',')}]`;
	}

	if (value && typeof value === 'object') {
		return `{${Object.entries(value)
			.filter(([, child]) => child !== undefined)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(
				([key, child]) =>
					`${JSON.stringify(key)}:${stableStringify(child)}`
			)
			.join(',')}}`;
	}

	return JSON.stringify(value);
}

export function getListKey(
	doctype: string,
	query: FrappeListQuery = {}
): string {
	return `${doctype}:${stableStringify(query)}`;
}

export function getResourceKey(doctype: string, name: string): string {
	return `${doctype}:${name}`;
}

export function toFrappeQuery(
	query: FrappeListQuery = {}
): Record<string, string> {
	const params: Record<string, string> = {};
	const fields = query.fields?.includes('name')
		? query.fields
		: query.fields
			? ['name', ...query.fields]
			: undefined;

	if (fields) params.fields = JSON.stringify(fields);
	if (query.filters) params.filters = JSON.stringify(query.filters);
	if (query.orFilters) params.or_filters = JSON.stringify(query.orFilters);
	if (query.orderBy) params.order_by = query.orderBy;
	if (query.limitStart !== undefined)
		params.limit_start = String(query.limitStart);
	if (query.limit !== undefined) params.limit_page_length = String(query.limit);
	if (query.groupBy) params.group_by = query.groupBy;
	if (query.distinct !== undefined) params.distinct = query.distinct ? '1' : '0';

	const known = new Set([
		'fields',
		'filters',
		'orFilters',
		'orderBy',
		'limitStart',
		'limit',
		'groupBy',
		'distinct',
	]);
	for (const [key, value] of Object.entries(query)) {
		if (!known.has(key) && value !== undefined) {
			params[key] =
				typeof value === 'string' ? value : JSON.stringify(value);
		}
	}

	return params;
}

export function joinUrl(baseUrl: string, path: string): string {
	return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
