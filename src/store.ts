import { createReduxStore, register } from '@wordpress/data';
import { createFrappeRequest } from './request';
import type {
	FrappeDataStore,
	FrappeListQuery,
	FrappeRequest,
	FrappeResource,
	FrappeStoreConfig,
} from './types';
import {
	getListKey,
	getResourceKey,
	toFrappeQuery,
} from './utils';

type State = {
	records: Record<string, Record<string, FrappeResource>>;
	lists: Record<string, string[]>;
	deleted: Record<string, boolean>;
	pending: Record<string, boolean>;
	errors: Record<string, unknown>;
	requestIds: Record<string, number>;
};

type Action = {
	type: string;
	requestKey?: string;
	doctype?: string;
	record?: FrappeResource;
	records?: FrappeResource[];
	listKey?: string;
	name?: string;
	error?: unknown;
	requestId?: number;
};

const DEFAULT_STATE: State = {
	records: {},
	lists: {},
	deleted: {},
	pending: {},
	errors: {},
	requestIds: {},
};

function isStaleRequest(state: State, action: Action): boolean {
	return (
		action.requestId !== undefined &&
		state.requestIds[action.requestKey!] !== action.requestId
	);
}

function reducer(state: State = DEFAULT_STATE, action: Action): State {
	switch (action.type) {
		case 'START_REQUEST':
			return {
				...state,
				pending: { ...state.pending, [action.requestKey!]: true },
				errors: { ...state.errors, [action.requestKey!]: undefined },
				requestIds: {
					...state.requestIds,
					[action.requestKey!]: action.requestId!,
				},
			};
		case 'FAIL_REQUEST':
			if (isStaleRequest(state, action)) return state;
			return {
				...state,
				pending: { ...state.pending, [action.requestKey!]: false },
				errors: { ...state.errors, [action.requestKey!]: action.error },
			};
		case 'RECEIVE_RECORD':
			if (isStaleRequest(state, action)) return state;
			return {
				...state,
				records: {
					...state.records,
					[action.doctype!]: {
						...state.records[action.doctype!],
						[action.record!.name]: action.record!,
					},
				},
				deleted: {
					...state.deleted,
					[getResourceKey(action.doctype!, action.record!.name)]: false,
				},
				pending: { ...state.pending, [action.requestKey!]: false },
			};
		case 'RECEIVE_LIST': {
			if (isStaleRequest(state, action)) return state;
			const doctypeRecords = { ...state.records[action.doctype!] };
			const deleted = { ...state.deleted };
			for (const record of action.records!) {
				doctypeRecords[record.name] = record;
				deleted[getResourceKey(action.doctype!, record.name)] = false;
			}
			return {
				...state,
				records: { ...state.records, [action.doctype!]: doctypeRecords },
				deleted,
				lists: {
					...state.lists,
					[action.listKey!]: action.records!.map(({ name }) => name),
				},
				pending: { ...state.pending, [action.requestKey!]: false },
			};
		}
		case 'REMOVE_RECORD': {
			if (isStaleRequest(state, action)) return state;
			const doctypeRecords = { ...state.records[action.doctype!] };
			delete doctypeRecords[action.name!];
			return {
				...state,
				records: { ...state.records, [action.doctype!]: doctypeRecords },
				deleted: {
					...state.deleted,
					[getResourceKey(action.doctype!, action.name!)]: true,
				},
				lists: Object.fromEntries(
					Object.entries(state.lists).map(([key, names]) => [
						key,
						key.startsWith(`${action.doctype}:`)
							? names.filter((name) => name !== action.name)
							: names,
					])
				),
				pending: { ...state.pending, [action.requestKey!]: false },
			};
		}
		case 'INVALIDATE_LISTS':
			return {
				...state,
				lists: Object.fromEntries(
					Object.entries(state.lists).filter(
						([key]) => !key.startsWith(`${action.doctype}:`)
					)
				),
			};
		default:
			return state;
	}
}

function resourcePath(apiPath: string, doctype: string, name?: string): string {
	const root = `${apiPath.replace(/\/$/, '')}/${encodeURIComponent(doctype)}`;
	return name ? `${root}/${encodeURIComponent(name)}` : root;
}

export function createFrappeDataStore(
	config: FrappeStoreConfig = {}
): FrappeDataStore {
	const storeName = config.storeName ?? 'frappe/resources';
	const apiPath = config.apiPath ?? '/api/resource';
	const request: FrappeRequest = config.request ?? createFrappeRequest(config);
	let nextRequestId = 0;

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
		fetchResource(doctype: string, name: string) {
			return async ({ dispatch }: { dispatch: typeof actions }) => {
				const requestKey = getResourceKey(doctype, name);
				const requestId = ++nextRequestId;
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
		fetchResourceList(doctype: string, query: FrappeListQuery = {}) {
			return async ({ dispatch }: { dispatch: typeof actions }) => {
				const listKey = getListKey(doctype, query);
				const requestKey = `list:${listKey}`;
				const requestId = ++nextRequestId;
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
		saveResource(
			doctype: string,
			values: Partial<FrappeResource> & Record<string, unknown>
		) {
			return async ({ dispatch }: { dispatch: typeof actions }) => {
				const name = values.name;
				const requestKey = `save:${doctype}:${name ?? 'new'}`;
				const requestId = ++nextRequestId;
				dispatch.startRequest(requestKey, requestId);
				try {
					const response = (await request({
						method: name ? 'PUT' : 'POST',
						path: resourcePath(apiPath, doctype, name),
						data: values,
					})) as { data: FrappeResource };
					dispatch.receiveRecord(doctype, response.data, requestKey, requestId);
					await dispatch.invalidateResourceLists(doctype);
					await (
						dispatch as typeof dispatch & {
							invalidateResolutionForStoreSelector: (
								selectorName: string
							) => Promise<void>;
						}
					).invalidateResolutionForStoreSelector('getResourceList');
					return response.data;
				} catch (error) {
					dispatch.failRequest(requestKey, error, requestId);
					throw error;
				}
			};
		},
		deleteResource(doctype: string, name: string) {
			return async ({ dispatch }: { dispatch: typeof actions }) => {
				const requestKey = `delete:${doctype}:${name}`;
				const requestId = ++nextRequestId;
				dispatch.startRequest(requestKey, requestId);
				try {
					await request({
						method: 'DELETE',
						path: resourcePath(apiPath, doctype, name),
					});
					dispatch.removeResource(doctype, name, requestKey, requestId);
					await dispatch.invalidateResourceLists(doctype);
					await (
						dispatch as typeof dispatch & {
							invalidateResolutionForStoreSelector: (
								selectorName: string
							) => Promise<void>;
						}
					).invalidateResolutionForStoreSelector('getResourceList');
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
		invalidateResourceLists(doctype: string) {
			return { type: 'INVALIDATE_LISTS', doctype };
		},
	};

	const selectors = {
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
		isRequestPending(state: State, requestKey: string) {
			return state.pending[requestKey] ?? false;
		},
		getRequestError(state: State, requestKey: string) {
			return state.errors[requestKey];
		},
	};

	const getResourceResolver = (doctype: string, name: string) =>
		async ({ dispatch }: { dispatch: typeof actions }) =>
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
		async ({ dispatch }: { dispatch: typeof actions }) =>
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

	const resolvers = {
		getResource: getResourceResolver,
		getResourceList: getResourceListResolver,
	};

	return createReduxStore(storeName, {
		reducer,
		actions,
		selectors,
		resolvers,
	}) as unknown as FrappeDataStore;
}

export function registerFrappeDataStore(
	config: FrappeStoreConfig = {}
): FrappeDataStore {
	const store = createFrappeDataStore(config);
	register(store);
	return store;
}
