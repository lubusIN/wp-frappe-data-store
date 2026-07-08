import { Button, Spinner } from '@wordpress/components';
import {
	DataForm,
	type Field,
	type Form,
} from '@wordpress/dataviews';
import { useMemo, useState } from '@wordpress/element';
import type { FormEvent } from 'react';
import type { FrappeResource } from '@lubusin/wp-frappe-data-store';
import type { DocTypeDefinition, ResourceFieldDefinition } from '../doctypes';
import {
	findMissingRequiredField,
	makeInitialValues,
	makeSubmitPayload,
} from '../resource-editor-utils';

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
		const missingField = findMissingRequiredField(definition, values);
		if (missingField) {
			setError(`${missingField.label} is required.`);
			return;
		}

		setSaving(true);
		setError(undefined);
		try {
			await onSubmit(makeSubmitPayload(definition, values, item));
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
					{item ? 'Save changes' : `Create ${definition?.name ?? 'Resource'}`}
				</Button>
				<Button variant="tertiary" onClick={onCancel} disabled={isSaving}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
