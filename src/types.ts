import type { ReduxStoreConfig, StoreDescriptor } from '@wordpress/data';

/**
 * Represents a single Frappe document resource.
 * Must include the unique `name` identifier field.
 */
export type FrappeResource = {
	name: string;
	[key: string]: unknown;
};

/**
 * Normalized metadata definition for a single field within a Frappe DocType.
 */
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

/**
 * Normalized metadata definition for a Frappe DocType.
 */
export type DocTypeDefinition = {
	name: string;
	titleField: string;
	fields: ResourceFieldDefinition[];
};

/**
 * Filter tuple used when querying Frappe resource lists.
 * E.g., `['status', '=', 'Open']`.
 */
export type FrappeFilter =
	| [field: string, operator: string, value: unknown]
	| [doctype: string, field: string, operator: string, value: unknown];

/**
 * Parameters for querying a list of Frappe resources.
 */
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

/**
 * Request options passed to a `FrappeRequest` transport function.
 */
export type FrappeRequestOptions = {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	path: string;
	query?: Record<string, string>;
	data?: Record<string, unknown>;
	signal?: AbortSignal;
};

/**
 * Transport function responsible for making HTTP calls to the Frappe API.
 */
export type FrappeRequest = (options: FrappeRequestOptions) => Promise<unknown>;

/**
 * Configuration options for creating or registering a Frappe data store.
 */
export type FrappeStoreConfig = {
	storeName?: string;
	baseUrl?: string;
	apiPath?: string;
	request?: FrappeRequest;
	headers?: HeadersInit | (() => HeadersInit);
	credentials?: RequestCredentials;
};

type FrappeActionCreators = {
	fetchDocTypeDefinition: (
		doctype: string
	) => (context: unknown) => Promise<DocTypeDefinition>;
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

/**
 * Bound store selectors as exposed inside React component hooks or registry selections.
 */
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

/**
 * Descriptor type for the registered Frappe `@wordpress/data` store.
 */
export type FrappeDataStore = StoreDescriptor<
	ReduxStoreConfig<unknown, FrappeActionCreators, FrappeSelectors>
>;

/**
 * Bound actions exposed by `useFrappeResourceActions` or registry dispatchers.
 */
export type FrappeResourceActions = {
	fetchDocTypeDefinition: (doctype: string) => Promise<DocTypeDefinition>;
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

/**
 * Resolution state indicating if a query is loading or encountered an error.
 */
export type RequestStatus = {
	isResolving: boolean;
	error: unknown;
};
