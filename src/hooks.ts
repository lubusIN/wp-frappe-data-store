import { useDispatch, useSelect } from '@wordpress/data';
import type {
	FrappeBoundSelectors,
	FrappeDataStore,
	FrappeListQuery,
	FrappeResource,
	FrappeResourceActions,
	DocTypeDefinition,
	RequestStatus,
} from './types';
import { getListKey, getResourceKey } from './utils';

/**
 * React hook to subscribe to a single Frappe document by DocType and name.
 * Automatically triggers background fetching via store resolvers if not already cached.
 *
 * @param store The registered Frappe `@wordpress/data` store descriptor.
 * @param doctype The Frappe DocType name (e.g., `'Task'`).
 * @param name The unique document identifier.
 * @returns Object containing the document `resource`, `isResolving` loading state, and any request `error`.
 */
export function useFrappeResource(
	store: FrappeDataStore,
	doctype: string,
	name: string
): { resource: FrappeResource | undefined } & RequestStatus {
	return useSelect(
		(select) => {
			const selectors = select(store) as unknown as FrappeBoundSelectors;
			const requestKey = getResourceKey(doctype, name);
			return {
				resource: selectors.getResource(doctype, name),
				isResolving: selectors.isRequestPending(requestKey),
				error: selectors.getRequestError(requestKey),
			};
		},
		[store, doctype, name]
	);
}

/**
 * React hook to subscribe to a queried list of Frappe documents.
 * Automatically triggers background fetching via store resolvers if not already cached.
 *
 * @param store The registered Frappe `@wordpress/data` store descriptor.
 * @param doctype The Frappe DocType name (e.g., `'Task'`).
 * @param query Optional query parameters (filters, order by, limit, fields).
 * @returns Object containing matching `resources` array, `isResolving` loading state, and any request `error`.
 */
export function useFrappeResourceList(
	store: FrappeDataStore,
	doctype: string,
	query: FrappeListQuery = {}
): { resources: FrappeResource[] | undefined } & RequestStatus {
	const queryKey = getListKey(doctype, query);
	return useSelect(
		(select) => {
			const selectors = select(store) as unknown as FrappeBoundSelectors;
			const requestKey = `list:${queryKey}`;
			return {
				resources: selectors.getResourceList(doctype, query),
				isResolving: selectors.isRequestPending(requestKey),
				error: selectors.getRequestError(requestKey),
			};
		},
		[store, doctype, queryKey]
	);
}

/**
 * React hook to retrieve bound action dispatchers (`saveResource`, `deleteResource`, etc.) for mutating Frappe data.
 *
 * @param store The registered Frappe `@wordpress/data` store descriptor.
 * @returns Bound action methods for creating, updating, or deleting resources.
 */
export function useFrappeResourceActions(
	store: FrappeDataStore
): FrappeResourceActions {
	return useDispatch(store) as unknown as FrappeResourceActions;
}

/**
 * React hook to retrieve normalized metadata definition (`fields`, `titleField`) for a Frappe DocType from the cache.
 *
 * @param store The registered Frappe `@wordpress/data` store descriptor.
 * @param doctype The Frappe DocType name.
 * @returns Object containing `docTypeDefinition` if previously loaded.
 */
export function useDocTypeDefinition(
	store: FrappeDataStore,
	doctype: string
): { docTypeDefinition: DocTypeDefinition | undefined } {
	return useSelect(
		(select) => {
			const selectors = select(store) as unknown as FrappeBoundSelectors;
			return {
				docTypeDefinition: selectors.getDocTypeDefinition(doctype),
			};
		},
		[store, doctype]
	);
}
