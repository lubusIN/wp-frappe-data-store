import { createRegistry } from '@wordpress/data';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	createFrappeDataStore,
	getListKey,
	type FrappeRequest,
} from '../src';

describe('Frappe data store', () => {
	const request = vi.fn<FrappeRequest>();

	beforeEach(() => request.mockReset());

	function setup() {
		const store = createFrappeDataStore({
			storeName: `test/frappe-${Math.random()}`,
			request,
		});
		const registry = createRegistry();
		registry.register(store);
		return { store, registry };
	}

	it('resolves and caches a resource', async () => {
		request.mockResolvedValueOnce({ data: { name: 'TASK-1', subject: 'Test' } });
		const { store, registry } = setup();

		const resource = await registry
			.resolveSelect(store)
			.getResource('Task', 'TASK-1');

		expect(resource).toEqual({ name: 'TASK-1', subject: 'Test' });
		expect(request).toHaveBeenCalledWith({
			method: 'GET',
			path: '/api/resource/Task/TASK-1',
		});
		expect(registry.select(store).getResource('Task', 'TASK-1')).toEqual(
			resource
		);
	});

	it('resolves a list and normalizes its records', async () => {
		request.mockResolvedValueOnce({
			data: [
				{ name: 'TASK-1', status: 'Open' },
				{ name: 'TASK-2', status: 'Open' },
			],
		});
		const { store, registry } = setup();
		const query = {
			filters: [['status', '=', 'Open']] as [string, string, unknown][],
		};

		const resources = await registry
			.resolveSelect(store)
			.getResourceList('Task', query);

		expect(resources).toHaveLength(2);
		expect(registry.select(store).getResource('Task', 'TASK-2')).toEqual({
			name: 'TASK-2',
			status: 'Open',
		});
		expect(request.mock.calls[0]?.[0].query?.filters).toBe(
			JSON.stringify(query.filters)
		);
	});

	it('creates, updates, and deletes resources', async () => {
		request
			.mockResolvedValueOnce({ data: { name: 'TASK-3', subject: 'New' } })
			.mockResolvedValueOnce({ data: { name: 'TASK-3', subject: 'Changed' } })
			.mockResolvedValueOnce({ message: 'ok' });
		const { store, registry } = setup();
		const actions = registry.dispatch(store);

		await actions.saveResource('Task', { subject: 'New' });
		await actions.saveResource('Task', { name: 'TASK-3', subject: 'Changed' });
		expect(registry.select(store).getResource('Task', 'TASK-3')).toMatchObject({
			subject: 'Changed',
		});

		await actions.deleteResource('Task', 'TASK-3');
		expect(registry.select(store).getResource('Task', 'TASK-3')).toBeUndefined();
		expect(request.mock.calls.map(([options]) => options.method)).toEqual([
			'POST',
			'PUT',
			'DELETE',
		]);
	});

	it('exposes request errors without losing the rejection', async () => {
		const error = new Error('Permission denied');
		request.mockRejectedValueOnce(error);
		const { store, registry } = setup();

		await expect(
			registry.dispatch(store).fetchResource('Task', 'TASK-4')
		).rejects.toThrow('Permission denied');
		expect(registry.select(store).getRequestError('Task:TASK-4')).toBe(error);
		expect(registry.select(store).isRequestPending('Task:TASK-4')).toBe(false);
	});

	it('ignores a stale list response after a newer refresh completes', async () => {
		let rejectGuestRequest!: (error: Error) => void;
		let resolveAuthenticatedRequest!: (value: unknown) => void;
		request
			.mockReturnValueOnce(
				new Promise((_, reject) => {
					rejectGuestRequest = reject;
				})
			)
			.mockReturnValueOnce(
				new Promise((resolve) => {
					resolveAuthenticatedRequest = resolve;
				})
			);
		const { store, registry } = setup();
		const query = { limit: 10 };
		const actions = registry.dispatch(store);

		const guestRequest = actions.fetchResourceList('Task', query);
		const authenticatedRequest = actions.fetchResourceList('Task', query);
		resolveAuthenticatedRequest({ data: [{ name: 'TASK-AUTHENTICATED' }] });
		await authenticatedRequest;

		const permissionError = new Error('Insufficient Permission');
		rejectGuestRequest(permissionError);
		await expect(guestRequest).rejects.toBe(permissionError);

		expect(registry.select(store).getResourceList('Task', query)).toEqual([
			{ name: 'TASK-AUTHENTICATED' },
		]);
		expect(
			registry.select(store).getRequestError(`list:${getListKey('Task', query)}`)
		).toBeUndefined();
	});

	it('invalidates cached lists after a mutation', async () => {
		request
			.mockResolvedValueOnce({ data: [{ name: 'TASK-1' }] })
			.mockResolvedValueOnce({ data: { name: 'TASK-2' } })
			.mockResolvedValueOnce({
				data: [{ name: 'TASK-1' }, { name: 'TASK-2' }],
			});
		const { store, registry } = setup();
		const query = { limit: 10 };
		await registry.resolveSelect(store).getResourceList('Task', query);
		expect(registry.select(store).getResourceList('Task', query)).toHaveLength(1);

		await registry.dispatch(store).saveResource('Task', {});
		await expect(
			registry.resolveSelect(store).getResourceList('Task', query)
		).resolves.toHaveLength(2);
		expect(request).toHaveBeenCalledTimes(3);
	});

	it('resolves and caches a DocType definition', async () => {
		request.mockResolvedValueOnce({
			data: {
				name: 'Task',
				title_field: 'subject',
				fields: [
					{
						fieldname: 'subject',
						label: 'Subject',
						fieldtype: 'Data',
					},
				],
			},
		});
		const { store, registry } = setup();

		const definition = await registry
			.resolveSelect(store)
			.getDocTypeDefinition('Task');

		expect(definition).toEqual({
			name: 'Task',
			titleField: 'subject',
			fields: [
				{
					id: 'subject',
					label: 'Subject',
					type: 'text',
					required: false,
					readOnly: false,
				},
			],
		});

		expect(request).toHaveBeenCalledTimes(1);
		expect(request).toHaveBeenCalledWith({
			method: 'GET',
			path: '/api/resource/DocType/Task',
			query: {
				fields: JSON.stringify(['name', 'title_field', 'fields']),
			},
		});

		expect(registry.select(store).getDocTypeDefinition('Task')).toBe(definition);
		const cachedDefinition = await registry
			.resolveSelect(store)
			.getDocTypeDefinition('Task');
		expect(cachedDefinition).toBe(definition);
		expect(request).toHaveBeenCalledTimes(1);
	});
});
