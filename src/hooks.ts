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

export function useFrappeResourceActions(
	store: FrappeDataStore
): FrappeResourceActions {
	return useDispatch(store) as unknown as FrappeResourceActions;
}

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
