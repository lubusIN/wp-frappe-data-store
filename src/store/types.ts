import type { FrappeResource } from '../types';

export type State = {
	records: Record<string, Record<string, FrappeResource>>;
	lists: Record<string, string[]>;
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
	listKey?: string;
	name?: string;
	error?: unknown;
	requestId?: number;
};
