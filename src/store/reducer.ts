import { getResourceKey } from '../utils';
import type { Action, State } from './types';

export const DEFAULT_STATE: State = {
	records: {},
	lists: {},
	docTypeDefinitions: {},
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

export function reducer(state: State = DEFAULT_STATE, action: Action): State {
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
		case 'RECEIVE_DOCTYPE_DEFINITION':
			if (isStaleRequest(state, action)) return state;
			return {
				...state,
				docTypeDefinitions: {
					...state.docTypeDefinitions,
					[action.doctype!]: action.docTypeDefinition!,
				},
				pending: { ...state.pending, [action.requestKey!]: false },
			};
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
