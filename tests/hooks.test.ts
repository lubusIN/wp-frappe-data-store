import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useSelect, useDispatch } = vi.hoisted(() => ({
	useSelect: vi.fn(),
	useDispatch: vi.fn(),
}));

vi.mock('@wordpress/data', () => ({ useSelect, useDispatch }));

import {
	useDocTypeDefinition,
	useFrappeResource,
	useFrappeResourceActions,
	useFrappeResourceList,
} from '../src/hooks';
import type { FrappeDataStore } from '../src/types';

describe('React hooks', () => {
	const store = { name: 'test/hooks' } as unknown as FrappeDataStore;
	const selectors = {
		getResource: vi.fn(),
		getResourceList: vi.fn(),
		getDocTypeDefinition: vi.fn(),
		isRequestPending: vi.fn(),
		getRequestError: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		useSelect.mockImplementation(
			(callback: (select: () => typeof selectors) => unknown) =>
				callback(() => selectors)
		);
	});

	it('selects a resource and its request state', () => {
		selectors.getResource.mockReturnValue({ name: 'TASK-1' });
		selectors.isRequestPending.mockReturnValue(true);
		selectors.getRequestError.mockReturnValue(undefined);

		expect(useFrappeResource(store, 'Task', 'TASK-1')).toEqual({
			resource: { name: 'TASK-1' },
			isResolving: true,
			error: undefined,
		});
		expect(selectors.isRequestPending).toHaveBeenCalledWith('Task:TASK-1');
		expect(useSelect.mock.calls[0]?.[1]).toEqual([store, 'Task', 'TASK-1']);
	});

	it('selects a list using a stable query key', () => {
		const query = { limit: 10, orderBy: 'modified desc' };
		selectors.getResourceList.mockReturnValue([{ name: 'TASK-1' }]);
		selectors.isRequestPending.mockReturnValue(false);

		expect(useFrappeResourceList(store, 'Task', query)).toMatchObject({
			resources: [{ name: 'TASK-1' }],
			isResolving: false,
		});
		expect(selectors.isRequestPending).toHaveBeenCalledWith(
			'list:Task:{"limit":10,"orderBy":"modified desc"}'
		);
	});

	it('selects DocType metadata and its request state', () => {
		const definition = { name: 'Task', titleField: 'subject', fields: [] };
		selectors.getDocTypeDefinition.mockReturnValue(definition);
		selectors.getRequestError.mockReturnValue(new Error('stale error'));

		expect(useDocTypeDefinition(store, 'Task')).toMatchObject({
			docTypeDefinition: definition,
			error: expect.objectContaining({ message: 'stale error' }),
		});
		expect(selectors.isRequestPending).toHaveBeenCalledWith('doctype:Task');
		expect(selectors.getRequestError).toHaveBeenCalledWith('doctype:Task');
	});

	it('returns bound resource actions', () => {
		const actions = { saveResource: vi.fn(), deleteResource: vi.fn() };
		useDispatch.mockReturnValue(actions);

		expect(useFrappeResourceActions(store)).toBe(actions);
		expect(useDispatch).toHaveBeenCalledWith(store);
	});
});
