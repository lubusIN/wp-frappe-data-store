import type { DocTypeDefinition, FrappeResource } from '../types';

export type State = {
	records: Record<string, Record<string, FrappeResource>>;
	lists: Record<string, string[]>;
	docTypeDefinitions: Record<string, DocTypeDefinition>;
	deleted: Record<string, boolean>;
	pending: Record<string, boolean>;
	errors: Record<string, unknown>;
	requestIds: Record<string, number>;
};

export type Action = {
	type: string;
	requestKey?: string;
	doctype?: string;
	record?: FrappeResource;
	records?: FrappeResource[];
	docTypeDefinition?: DocTypeDefinition;
	listKey?: string;
	name?: string;
	error?: unknown;
	requestId?: number;
};
