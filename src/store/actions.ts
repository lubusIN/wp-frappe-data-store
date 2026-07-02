import type {
	FrappeListQuery,
	FrappeRequest,
	FrappeResource,
} from '../types';
import { getListKey, getResourceKey, toFrappeQuery } from '../utils';

function resourcePath(apiPath: string, doctype: string, name?: string): string {
	const root = `${apiPath.replace(/\/$/, '')}/${encodeURIComponent(doctype)}`;
	return name ? `${root}/${encodeURIComponent(name)}` : root;
}

async function invalidateResourceListResolution(dispatch: unknown): Promise<void> {
	await (
		dispatch as {
			invalidateResolutionForStoreSelector: (
				selectorName: string
			) => Promise<void>;
		}
	).invalidateResolutionForStoreSelector('getResourceList');
}

export function createActions(
	request: FrappeRequest,
	apiPath: string,
	nextRequestId: () => number
) {
	const actions = {
		startRequest(requestKey: string, requestId: number) {
			return { type: 'START_REQUEST', requestKey, requestId };
		},
		failRequest(requestKey: string, error: unknown, requestId: number) {
			return { type: 'FAIL_REQUEST', requestKey, error, requestId };
		},
		receiveRecord(
			doctype: string,
			record: FrappeResource,
			requestKey: string,
			requestId: number
		) {
			return { type: 'RECEIVE_RECORD', doctype, record, requestKey, requestId };
		},
		receiveList(
			doctype: string,
			records: FrappeResource[],
			listKey: string,
			requestKey: string,
			requestId: number
		) {
			return {
				type: 'RECEIVE_LIST',
				doctype,
				records,
				listKey,
				requestKey,
				requestId,
			};
		},
		/**
		 * Thunk action to asynchronously fetch and store a single document resource by DocType and name.
		 */
		fetchResource(doctype: string, name: string) {
			return async ({ dispatch }: { dispatch: typeof actions }) => {
				const requestKey = getResourceKey(doctype, name);
				const requestId = nextRequestId();
				dispatch.startRequest(requestKey, requestId);
				try {
					const response = (await request({
						method: 'GET',
						path: resourcePath(apiPath, doctype, name),
					})) as { data: FrappeResource };
					dispatch.receiveRecord(doctype, response.data, requestKey, requestId);
					return response.data;
				} catch (error) {
					dispatch.failRequest(requestKey, error, requestId);
					throw error;
				}
			};
		},
		/**
		 * Thunk action to asynchronously fetch and store a list of document resources matching a query.
		 */
		fetchResourceList(doctype: string, query: FrappeListQuery = {}) {
			return async ({ dispatch }: { dispatch: typeof actions }) => {
				const listKey = getListKey(doctype, query);
				const requestKey = `list:${listKey}`;
				const requestId = nextRequestId();
				dispatch.startRequest(requestKey, requestId);
				try {
					const response = (await request({
						method: 'GET',
						path: resourcePath(apiPath, doctype),
						query: toFrappeQuery(query),
					})) as { data: FrappeResource[] };
					dispatch.receiveList(
						doctype,
						response.data,
						listKey,
						requestKey,
						requestId
					);
					return response.data;
				} catch (error) {
					dispatch.failRequest(requestKey, error, requestId);
					throw error;
				}
			};
		},
		/**
		 * Thunk action to create (POST) or update (PUT) a Frappe document resource.
		 * Automatically invalidates cached lists for that DocType upon success.
		 */
		saveResource(
			doctype: string,
			values: Partial<FrappeResource> & Record<string, unknown>
		) {
			return async ({ dispatch }: { dispatch: typeof actions }) => {
				const name = values.name;
				const requestKey = `save:${doctype}:${name ?? 'new'}`;
				const requestId = nextRequestId();
				dispatch.startRequest(requestKey, requestId);
				try {
					const response = (await request({
						method: name ? 'PUT' : 'POST',
						path: resourcePath(apiPath, doctype, name),
						data: values,
					})) as { data: FrappeResource };
					dispatch.receiveRecord(doctype, response.data, requestKey, requestId);
					await dispatch.invalidateResourceLists(doctype);
					await invalidateResourceListResolution(dispatch);
					return response.data;
				} catch (error) {
					dispatch.failRequest(requestKey, error, requestId);
					throw error;
				}
			};
		},
		/**
		 * Thunk action to permanently delete (DELETE) a Frappe document resource by name.
		 * Automatically removes the record from store state and invalidates cached lists.
		 */
		deleteResource(doctype: string, name: string) {
			return async ({ dispatch }: { dispatch: typeof actions }) => {
				const requestKey = `delete:${doctype}:${name}`;
				const requestId = nextRequestId();
				dispatch.startRequest(requestKey, requestId);
				try {
					await request({
						method: 'DELETE',
						path: resourcePath(apiPath, doctype, name),
					});
					dispatch.removeResource(doctype, name, requestKey, requestId);
					await dispatch.invalidateResourceLists(doctype);
					await invalidateResourceListResolution(dispatch);
				} catch (error) {
					dispatch.failRequest(requestKey, error, requestId);
					throw error;
				}
			};
		},
		removeResource(
			doctype: string,
			name: string,
			requestKey: string,
			requestId: number
		) {
			return { type: 'REMOVE_RECORD', doctype, name, requestKey, requestId };
		},
		/**
		 * Action creator to invalidate all cached list results for a specific DocType.
		 */
		invalidateResourceLists(doctype: string) {
			return { type: 'INVALIDATE_LISTS', doctype };
		},
	};

	return actions;
}

export type Actions = ReturnType<typeof createActions>;
