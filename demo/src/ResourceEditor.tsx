import {
	Button,
	CheckboxControl,
	SelectControl,
	Spinner,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import { useState } from 'react';
import type { FrappeResource } from '../../src';
import type { DocTypeDefinition, ResourceFieldDefinition } from './doctypes';

type Props = {
	definition: DocTypeDefinition;
	item?: FrappeResource;
	onSubmit: (values: Record<string, unknown>) => Promise<void>;
	onCancel: () => void;
};

function inputType(field: ResourceFieldDefinition) {
	if (field.type === 'date') return 'date';
	if (field.type === 'datetime') return 'datetime-local';
	if (field.type === 'number') return 'number';
	return 'text';
}

function inputValue(value: unknown, type: ResourceFieldDefinition['type']) {
	const stringValue = value === null || value === undefined ? '' : String(value);
	return type === 'datetime' ? stringValue.replace(' ', 'T').slice(0, 16) : stringValue;
}

export function ResourceEditor({
	definition,
	item,
	onSubmit,
	onCancel,
}: Props) {
	const [values, setValues] = useState<Record<string, unknown>>(item || {});
	const [isSaving, setSaving] = useState(false);
	const [error, setError] = useState<string>();
	const editableFields = definition.fields.filter((field) => !field.readOnly);

	function update(field: ResourceFieldDefinition, value: unknown) {
		setValues((current) => ({ ...current, [field.id]: value }));
	}

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		setSaving(true);
		setError(undefined);
		try {
			const payload = Object.fromEntries(
				Object.entries(values).map(([key, value]) => [
					key,
					typeForField(definition.fields, key) === 'datetime' &&
					typeof value === 'string'
						? value.replace('T', ' ')
						: value,
				])
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
			<div className="frappe-resource-fields">
				{editableFields.map((field) => {
					const value = values[field.id];
					if (field.type === 'textarea') {
						return (
							<TextareaControl
								key={field.id}
								label={field.label}
								value={inputValue(value, field.type)}
								onChange={(next) => update(field, next)}
								required={field.required}
								rows={5}
								__nextHasNoMarginBottom
							/>
						);
					}
					if (field.type === 'select') {
						return (
							<SelectControl
								key={field.id}
								label={field.label}
								value={inputValue(value, field.type)}
								options={[
									{ label: 'Select…', value: '' },
									...(field.options || []).map((option) => ({
										label: option,
										value: option,
									})),
								]}
								onChange={(next) => update(field, next)}
								required={field.required}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						);
					}
					if (field.type === 'checkbox') {
						return (
							<CheckboxControl
								key={field.id}
								label={field.label}
								checked={value === true || value === 1}
								onChange={(next) => update(field, next ? 1 : 0)}
								__nextHasNoMarginBottom
							/>
						);
					}
					return (
						<TextControl
							key={field.id}
							label={field.label}
							type={inputType(field)}
							value={inputValue(value, field.type)}
							onChange={(next) =>
								update(field, field.type === 'number' ? Number(next) : next)
							}
							required={field.required}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					);
				})}
			</div>
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

function typeForField(
	fields: ResourceFieldDefinition[],
	id: string
): ResourceFieldDefinition['type'] {
	return fields.find((field) => field.id === id)?.type;
}
