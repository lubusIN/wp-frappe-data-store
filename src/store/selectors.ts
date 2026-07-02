import { getCachedDocTypeDefinition } from '../doctype';
import type { FrappeListQuery, FrappeResource } from '../types';
import { getListKey } from '../utils';
import type { State } from './types';

export const selectors = {
	/**
	 * Returns a single cached Frappe document resource by DocType and name identifier.
	 */
	getResource(state: State, doctype: string, name: string) {
		return state.records[doctype]?.[name];
	},
	/**
	 * Returns an array of cached Frappe resources matching a specific list query.
	 */
	getResourceList(
		state: State,
		doctype: string,
		query: FrappeListQuery = {}
	) {
		const names = state.lists[getListKey(doctype, query)];
		return names
			?.map((name) => state.records[doctype]?.[name])
			.filter((record): record is FrappeResource => Boolean(record));
	},
	/**
	 * Returns normalized metadata (`fields`, `titleField`) for a given DocType if loaded.
	 */
	getDocTypeDefinition(_state: State, doctype: string) {
		return getCachedDocTypeDefinition(doctype);
	},
	/**
	 * Checks whether an asynchronous fetch or mutation request is currently in progress.
	 */
	isRequestPending(state: State, requestKey: string) {
		return state.pending[requestKey] ?? false;
	},
	/**
	 * Retrieves any error object thrown during an asynchronous request.
	 */
	getRequestError(state: State, requestKey: string) {
		return state.errors[requestKey];
	},
};
