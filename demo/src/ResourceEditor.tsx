import { Button, Spinner } from '@wordpress/components';
import {
	DataForm,
	type Field,
	type Form,
} from '@wordpress/dataviews';
import { useMemo, useState } from '@wordpress/element';
import type { FormEvent } from 'react';
import type { FrappeResource } from '../../src';
import type { DocTypeDefinition, ResourceFieldDefinition } from './doctypes';

type Props = {
	definition: DocTypeDefinition;
	item?: FrappeResource;
	onSubmit: (values: Record<string, unknown>) => Promise<void>;
	onCancel: () => void;
};

function dataFormType(
	field: ResourceFieldDefinition
): Field<Record<string, unknown>>['type'] {
	if (field.type === 'checkbox') return 'boolean';
	if (field.type === 'date') return 'date';
	if (field.type === 'datetime') return 'datetime';
	if (field.type === 'number') return 'number';
	return 'text';
}

function normalizeInitialValue(
	field: ResourceFieldDefinition,
	value: unknown
): unknown {
	if (value === undefined || value === null) {
		return value;
	}
	if (field.type === 'checkbox') {
		return value === true || value === '1' || value === 1 || value === 'yes';
	}
	if (field.type === 'datetime' && typeof value === 'string') {
		return value.replace(' ', 'T');
	}
	if (field.type === 'date' && typeof value === 'string') {
		return value.split(' ')[0];
	}
	if (field.type === 'number' && typeof value === 'string') {
		const parsed = Number(value);
		return Number.isNaN(parsed) ? value : parsed;
	}
	return value;
}

function makeInitialValues(
	definition: DocTypeDefinition,
	item?: FrappeResource
): Record<string, unknown> {
	if (!item) {
		return {};
	}
	return definition.fields.reduce<Record<string, unknown>>((acc, field) => {
		if (item[field.id] === undefined) {
			return acc;
		}
		acc[field.id] = normalizeInitialValue(field, item[field.id]);
		return acc;
	}, {});
}

function makeDataFormFields(
	definition: DocTypeDefinition
): Field<Record<string, unknown>>[] {
	return definition.fields.map((field) => ({
		id: field.id,
		label: field.label,
		description: field.description,
		placeholder: field.placeholder,
		type: dataFormType(field),
		Edit: field.type === 'textarea' ? { control: 'textarea', rows: 5 } : undefined,
		elements: field.options?.map((option) => ({
			value: option,
			label: option,
		})),
		isValid: field.required ? { required: true } : undefined,
		readOnly: field.readOnly,
	}));
}

export function ResourceEditor({
	definition,
	item,
	onSubmit,
	onCancel,
}: Props) {
	const [values, setValues] = useState<Record<string, unknown>>(
		() => makeInitialValues(definition, item)
	);
	const [isSaving, setSaving] = useState(false);
	const [error, setError] = useState<string>();
	const fields = useMemo(() => makeDataFormFields(definition), [definition]);
	const form = useMemo<Form>(
		() => ({
			layout: { type: 'regular', labelPosition: 'top' },
			fields: fields.map((field) => field.id),
		}),
		[fields]
	);

	async function submit(event: FormEvent) {
		event.preventDefault();
		const missingField = definition.fields.find(
			(field) =>
				field.required &&
				!field.readOnly &&
				(values[field.id] === undefined || values[field.id] === '')
		);
		if (missingField) {
			setError(`${missingField.label} is required.`);
			return;
		}

		setSaving(true);
		setError(undefined);
		try {
			const baseValues = item?.name && values.name === undefined ? { name: item.name } : {};
			const entries = Object.entries({ ...baseValues, ...values }).filter(
				([key]) => !definition.fields.find((f) => f.id === key)?.readOnly
			);
			const payload = Object.fromEntries(
				entries.map(([key, value]) => {
					const field = definition.fields.find((candidate) => candidate.id === key);
					if (field?.type === 'datetime' && typeof value === 'string') {
						return [key, value.replace('T', ' ')];
					}
					if (field?.type === 'checkbox') {
						return [key, value ? 1 : 0];
					}
					return [key, value];
				})
			);
			await onSubmit(payload);
		} catch (submitError) {
			setError(
				submitError instanceof Error ? submitError.message : String(submitError)
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<form className="frappe-resource-form" onSubmit={submit}>
			<DataForm<Record<string, unknown>>
				data={values}
				fields={fields}
				form={form}
				onChange={(edits) =>
					setValues((current) => ({ ...current, ...edits }))
				}
			/>
			{error && <p className="frappe-form-error">{error}</p>}
			<div className="frappe-modal-actions">
				<Button variant="primary" type="submit" disabled={isSaving}>
					{isSaving && <Spinner />}
					{item ? 'Save changes' : `Create ${definition.name}`}
				</Button>
				<Button variant="tertiary" onClick={onCancel} disabled={isSaving}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
