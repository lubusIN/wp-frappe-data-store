// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@wordpress/components', () => ({
	Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
	Spinner: () => <span>Saving</span>,
}));

vi.mock('@wordpress/dataviews', () => ({
	DataForm: ({ onChange }: any) => (
		<button
			type="button"
			onClick={() =>
				onChange({
					subject: 'Updated task',
					enabled: true,
					starts_at: '2026-07-02T10:30:00',
					owner: 'ignored',
				})
			}
		>
			Set form values
		</button>
	),
}));

import { ResourceEditor } from '../src/ResourceEditor';
import type { DocTypeDefinition } from '../src/doctypes';

const definition: DocTypeDefinition = {
	name: 'Task',
	titleField: 'subject',
	fields: [
		{ id: 'subject', label: 'Subject', type: 'text', required: true },
		{ id: 'enabled', label: 'Enabled', type: 'checkbox' },
		{ id: 'starts_at', label: 'Starts at', type: 'datetime' },
		{ id: 'owner', label: 'Owner', type: 'text', readOnly: true },
	],
};

describe('ResourceEditor', () => {
	afterEach(cleanup);

	it('validates required fields before submitting', async () => {
		const onSubmit = vi.fn();
		render(
			<ResourceEditor
				definition={definition}
				onSubmit={onSubmit}
				onCancel={vi.fn()}
			/>
		);

		await userEvent.click(screen.getByRole('button', { name: 'Create Task' }));

		expect(screen.getByText('Subject is required.')).toBeTruthy();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('normalizes and submits edited values', async () => {
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		render(
			<ResourceEditor
				definition={definition}
				item={{ name: 'TASK-1', subject: '' }}
				onSubmit={onSubmit}
				onCancel={vi.fn()}
			/>
		);

		await userEvent.click(screen.getByRole('button', { name: 'Set form values' }));
		await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

		await waitFor(() =>
			expect(onSubmit).toHaveBeenCalledWith({
				name: 'TASK-1',
				subject: 'Updated task',
				enabled: 1,
				starts_at: '2026-07-02 10:30:00',
			})
		);
	});

	it('shows submission errors and invokes cancel', async () => {
		const onCancel = vi.fn();
		const onSubmit = vi.fn().mockRejectedValue(new Error('Save failed'));
		render(
			<ResourceEditor
				definition={definition}
				item={{ name: 'TASK-1', subject: '' }}
				onSubmit={onSubmit}
				onCancel={onCancel}
			/>
		);

		await userEvent.click(screen.getByRole('button', { name: 'Set form values' }));
		await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		await screen.findByText('Save failed');
		await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(onCancel).toHaveBeenCalledOnce();
	});
});
