import { describe, expect, it } from 'vitest';
import type { DocTypeDefinition } from '../src/doctypes';
import {
	findMissingRequiredField,
	makeInitialValues,
	makeSubmitPayload,
} from '../src/resource-editor-utils';

const definition: DocTypeDefinition = {
	name: 'Task',
	titleField: 'subject',
	fields: [
		{ id: 'subject', label: 'Subject', type: 'text', required: true },
		{ id: 'enabled', label: 'Enabled', type: 'checkbox' },
		{ id: 'starts_at', label: 'Starts at', type: 'datetime' },
		{ id: 'due_date', label: 'Due date', type: 'date' },
		{ id: 'progress', label: 'Progress', type: 'number' },
		{ id: 'owner', label: 'Owner', type: 'text', readOnly: true, required: true },
	],
};

describe('resource editor transformations', () => {
	it('normalizes Frappe values for form controls', () => {
		expect(
			makeInitialValues(definition, {
				name: 'TASK-1',
				subject: 'Follow up',
				enabled: 1,
				starts_at: '2026-07-02 10:30:00',
				due_date: '2026-07-03 00:00:00',
				progress: '42.5',
				ignored: 'not a field',
			})
		).toEqual({
			subject: 'Follow up',
			enabled: true,
			starts_at: '2026-07-02T10:30:00',
			due_date: '2026-07-03',
			progress: 42.5,
		});
	});

	it('preserves empty, invalid numeric, and false checkbox values', () => {
		expect(makeInitialValues(definition)).toEqual({});
		expect(
			makeInitialValues(definition, {
				name: 'TASK-2',
				enabled: '0',
				progress: 'not-a-number',
				due_date: null,
			})
		).toEqual({ enabled: false, progress: 'not-a-number', due_date: null });
	});

	it('finds editable required fields but ignores read-only requirements', () => {
		expect(findMissingRequiredField(definition, {})).toMatchObject({ id: 'subject' });
		expect(findMissingRequiredField(definition, { subject: 'Ready' })).toBeUndefined();
	});

	it('creates a Frappe payload and excludes read-only fields', () => {
		expect(
			makeSubmitPayload(
				definition,
				{
					subject: 'Changed',
					enabled: false,
					starts_at: '2026-07-02T10:30:00',
					owner: 'should-not-be-sent',
				},
				{ name: 'TASK-1' }
			)
		).toEqual({
			name: 'TASK-1',
			subject: 'Changed',
			enabled: 0,
			starts_at: '2026-07-02 10:30:00',
		});
	});

	it('keeps an explicitly supplied name when editing', () => {
		expect(
			makeSubmitPayload(definition, { name: 'TASK-NEW', enabled: true }, {
				name: 'TASK-OLD',
			})
		).toEqual({ name: 'TASK-NEW', enabled: 1 });
	});
});
