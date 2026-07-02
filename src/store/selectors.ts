import { getCachedDocTypeDefinition } from '../doctype';
import type { FrappeListQuery, FrappeResource } from '../types';
import { getListKey } from '../utils';
import type { State } from './types';

export const selectors = {
	getResource(state: State, doctype: string, name: string) {
		return state.records[doctype]?.[name];
	},
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
	getDocTypeDefinition(_state: State, doctype: string) {
		return getCachedDocTypeDefinition(doctype);
	},
	isRequestPending(state: State, requestKey: string) {
		return state.pending[requestKey] ?? false;
	},
	getRequestError(state: State, requestKey: string) {
		return state.errors[requestKey];
	},
};
