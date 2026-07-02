import type { FrappeListQuery } from './types';

/**
 * Deterministically stringifies any JavaScript value with sorted object keys.
 * Used to construct consistent cache keys for list queries.
 *
 * @param value The value to serialize.
 * @returns A stable JSON-like string representation.
 */
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

/**
 * Generates a deterministic cache key for a queried resource list.
 *
 * @param doctype The Frappe DocType name.
 * @param query The list query options.
 * @returns Combined string key formatted as `doctype:stringify(query)`.
 */
export function getListKey(
	doctype: string,
	query: FrappeListQuery = {}
): string {
	return `${doctype}:${stableStringify(query)}`;
}

/**
 * Generates a deterministic cache key for a single resource document.
 *
 * @param doctype The Frappe DocType name.
 * @param name The unique document name/identifier.
 * @returns Combined string key formatted as `doctype:name`.
 */
export function getResourceKey(doctype: string, name: string): string {
	return `${doctype}:${name}`;
}

const KNOWN_QUERY_PARAMS = new Set([
	'fields',
	'filters',
	'orFilters',
	'orderBy',
	'limitStart',
	'limit',
	'groupBy',
	'distinct',
]);

/**
 * Serializes a typed `FrappeListQuery` object into flat string query parameters expected by Frappe REST endpoints.
 * Automatically ensures `name` is present in requested `fields`.
 *
 * @param query Typed query parameters.
 * @returns Record of string key-value pairs suitable for URL search parameters.
 */
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

	for (const [key, value] of Object.entries(query)) {
		if (!KNOWN_QUERY_PARAMS.has(key) && value !== undefined) {
			params[key] =
				typeof value === 'string' ? value : JSON.stringify(value);
		}
	}

	return params;
}

/**
 * Joins a base URL string and relative path without producing duplicate or missing forward slashes.
 *
 * @param baseUrl The base URL prefix.
 * @param path The path segment to append.
 * @returns Combined URL string.
 */
export function joinUrl(baseUrl: string, path: string): string {
	return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
