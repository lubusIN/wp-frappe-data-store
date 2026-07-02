import type { FrappeListQuery } from '../types';
import { getListKey, getResourceKey } from '../utils';
import type { Actions } from './actions';
import type { Action, State } from './types';

export function createResolvers(actions: Actions) {
	const getDocTypeDefinitionResolver = (doctype: string) =>
		async ({ dispatch }: { dispatch: Actions }) =>
			dispatch.fetchDocTypeDefinition(doctype);
	getDocTypeDefinitionResolver.isFulfilled = (state: State, doctype: string) =>
		state.docTypeDefinitions[doctype] !== undefined;

	const getResourceResolver = (doctype: string, name: string) =>
		async ({ dispatch }: { dispatch: Actions }) =>
			dispatch.fetchResource(doctype, name);
	getResourceResolver.isFulfilled = (
		state: State,
		doctype: string,
		name: string
	) =>
		state.records[doctype]?.[name] !== undefined ||
		state.deleted[getResourceKey(doctype, name)] === true;

	const getResourceListResolver = (
		doctype: string,
		query: FrappeListQuery = {}
	) =>
		async ({ dispatch }: { dispatch: Actions }) =>
			dispatch.fetchResourceList(doctype, query);
	getResourceListResolver.shouldInvalidate = (
		action: Action,
		doctype: string
	) =>
		action.type === 'INVALIDATE_LISTS' && action.doctype === doctype;
	getResourceListResolver.isFulfilled = (
		state: State,
		doctype: string,
		query: FrappeListQuery = {}
	) => state.lists[getListKey(doctype, query)] !== undefined;

	return {
		getDocTypeDefinition: getDocTypeDefinitionResolver,
		getResource: getResourceResolver,
		getResourceList: getResourceListResolver,
	};
}
