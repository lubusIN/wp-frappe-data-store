import { createReduxStore, register } from '@wordpress/data';
import { createFrappeRequest } from '../request';
import type { FrappeDataStore, FrappeRequest, FrappeStoreConfig } from '../types';
import { createActions } from './actions';
import { reducer } from './reducer';
import { createResolvers } from './resolvers';
import { selectors } from './selectors';

export function createFrappeDataStore(
	config: FrappeStoreConfig = {}
): FrappeDataStore {
	const storeName = config.storeName ?? 'frappe/resources';
	const apiPath = config.apiPath ?? '/api/resource';
	const request: FrappeRequest = config.request ?? createFrappeRequest(config);
	let nextRequestId = 0;

	const actions = createActions(request, apiPath, () => ++nextRequestId);
	const resolvers = createResolvers(actions);

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
