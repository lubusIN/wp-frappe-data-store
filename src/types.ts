import type { ReduxStoreConfig, StoreDescriptor } from '@wordpress/data';

export type FrappeResource = {
	name: string;
	[key: string]: unknown;
};

export type ResourceFieldDefinition = {
	id: string;
	label: string;
	description?: string;
	placeholder?: string;
	type?:
		| 'text'
		| 'textarea'
		| 'select'
		| 'checkbox'
		| 'date'
		| 'datetime'
		| 'number';
	options?: string[];
	required?: boolean;
	readOnly?: boolean;
};

export type DocTypeDefinition = {
	name: string;
	titleField: string;
	fields: ResourceFieldDefinition[];
};

export type FrappeFilter =
	| [field: string, operator: string, value: unknown]
	| [doctype: string, field: string, operator: string, value: unknown];

export type FrappeListQuery = {
	fields?: string[];
	filters?: FrappeFilter[] | Record<string, unknown>;
	orFilters?: FrappeFilter[];
	orderBy?: string;
	limitStart?: number;
	limit?: number;
	groupBy?: string;
	distinct?: boolean;
	[key: string]: unknown;
};

export type FrappeRequestOptions = {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	path: string;
	query?: Record<string, string>;
	data?: Record<string, unknown>;
	signal?: AbortSignal;
};

export type FrappeRequest = (options: FrappeRequestOptions) => Promise<unknown>;

export type FrappeStoreConfig = {
	storeName?: string;
	baseUrl?: string;
	apiPath?: string;
	request?: FrappeRequest;
	headers?: HeadersInit | (() => HeadersInit);
	credentials?: RequestCredentials;
};

type FrappeActionCreators = {
	fetchResource: (
		doctype: string,
		name: string
	) => (context: unknown) => Promise<FrappeResource>;
	fetchResourceList: (
		doctype: string,
		query?: FrappeListQuery
	) => (context: unknown) => Promise<FrappeResource[]>;
	saveResource: (
		doctype: string,
		values: Partial<FrappeResource> & Record<string, unknown>
	) => (context: unknown) => Promise<FrappeResource>;
	deleteResource: (
		doctype: string,
		name: string
	) => (context: unknown) => Promise<void>;
	invalidateResourceLists: (doctype: string) => { type: string; doctype: string };
};

export type FrappeBoundSelectors = {
	getResource: (doctype: string, name: string) => FrappeResource | undefined;
	getResourceList: (
		doctype: string,
		query?: FrappeListQuery
	) => FrappeResource[] | undefined;
	getDocTypeDefinition: (
		doctype: string
	) => DocTypeDefinition | undefined;
	isRequestPending: (requestKey: string) => boolean;
	getRequestError: (requestKey: string) => unknown;
};

type FrappeSelectors = {
	[K in keyof FrappeBoundSelectors]: (
		state: unknown,
		...args: Parameters<FrappeBoundSelectors[K]>
	) => ReturnType<FrappeBoundSelectors[K]>;
};

export type FrappeDataStore = StoreDescriptor<
	ReduxStoreConfig<unknown, FrappeActionCreators, FrappeSelectors>
>;

export type FrappeResourceActions = {
	fetchResource: (doctype: string, name: string) => Promise<FrappeResource>;
	fetchResourceList: (
		doctype: string,
		query?: FrappeListQuery
	) => Promise<FrappeResource[]>;
	saveResource: (
		doctype: string,
		values: Partial<FrappeResource> & Record<string, unknown>
	) => Promise<FrappeResource>;
	deleteResource: (doctype: string, name: string) => Promise<void>;
	invalidateResourceLists: (doctype: string) => void;
};

export type RequestStatus = {
	isResolving: boolean;
	error: unknown;
};
