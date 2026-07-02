import { describe, expect, it, vi } from 'vitest';
import { loadDocTypeDefinition, type FrappeRequest } from '../src';

describe('DocType metadata', () => {
	it('normalizes fields and excludes hidden and layout-only controls', async () => {
		const request = vi.fn<FrappeRequest>().mockResolvedValue({
			data: {
				name: 'CRM Lead',
				fields: [
					{ fieldname: 'lead_name', fieldtype: 'Data' },
					{ fieldname: 'enabled', label: 'Enabled', fieldtype: 'Check', reqd: 1 },
					{ fieldname: 'status', fieldtype: 'Select', options: ' New\n\nOpen \nWon' },
					{ fieldname: 'amount', fieldtype: 'Currency', read_only: 1 },
					{ fieldname: 'notes', fieldtype: 'Long Text', field_description: 'Details' },
					{ fieldname: 'starts_on', fieldtype: 'Date' },
					{ fieldname: 'modified_at', fieldtype: 'Datetime', field_placeholder: 'Pick a time' },
					{ fieldname: 'secret', fieldtype: 'Data', hidden: 1 },
					{ fieldname: 'section', fieldtype: 'Section Break' },
					{ fieldname: '', fieldtype: 'Data' },
				],
			},
		});

		const definition = await loadDocTypeDefinition(request, 'CRM Lead');

		expect(definition.titleField).toBe('lead_name');
		expect(definition.fields).toEqual([
			{ id: 'lead_name', label: 'Lead Name', type: 'text', required: false, readOnly: false },
			{ id: 'enabled', label: 'Enabled', type: 'checkbox', required: true, readOnly: false },
			{ id: 'status', label: 'Status', type: 'select', options: ['New', 'Open', 'Won'], required: false, readOnly: false },
			{ id: 'amount', label: 'Amount', type: 'number', required: false, readOnly: true },
			{ id: 'notes', label: 'Notes', description: 'Details', type: 'textarea', required: false, readOnly: false },
			{ id: 'starts_on', label: 'Starts On', type: 'date', required: false, readOnly: false },
			{ id: 'modified_at', label: 'Modified At', placeholder: 'Pick a time', type: 'datetime', required: false, readOnly: false },
		]);
	});

	it('deduplicates concurrent loads per transport but isolates different transports', async () => {
		let resolveRequest!: (value: unknown) => void;
		const firstRequest = vi.fn<FrappeRequest>().mockReturnValue(
			new Promise((resolve) => {
				resolveRequest = resolve;
			})
		);
		const secondRequest = vi.fn<FrappeRequest>().mockResolvedValue({
			data: { name: 'Task', title_field: 'description', fields: [] },
		});

		const firstLoad = loadDocTypeDefinition(firstRequest, 'Task');
		const duplicateLoad = loadDocTypeDefinition(firstRequest, 'Task');
		expect(firstRequest).toHaveBeenCalledTimes(1);
		resolveRequest({ data: { name: 'Task', title_field: 'subject', fields: [] } });

		expect(await firstLoad).toBe(await duplicateLoad);
		expect((await loadDocTypeDefinition(secondRequest, 'Task')).titleField).toBe(
			'description'
		);
		expect(secondRequest).toHaveBeenCalledTimes(1);
	});

	it('does not cache failed loads', async () => {
		const request = vi
			.fn<FrappeRequest>()
			.mockRejectedValueOnce(new Error('temporary failure'))
			.mockResolvedValueOnce({ data: { name: 'Retryable', fields: [] } });

		await expect(loadDocTypeDefinition(request, 'Retryable')).rejects.toThrow(
			'temporary failure'
		);
		await expect(loadDocTypeDefinition(request, 'Retryable')).resolves.toMatchObject({
			name: 'Retryable',
			titleField: 'name',
		});
		expect(request).toHaveBeenCalledTimes(2);
	});
});
