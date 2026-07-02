import type { FrappeResource } from '@lubusin/wp-frappe-data-store';
import type { DocTypeDefinition, ResourceFieldDefinition } from './doctypes';

export function normalizeInitialValue(
	field: ResourceFieldDefinition,
	value: unknown
): unknown {
	if (value === undefined || value === null) return value;
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

export function makeInitialValues(
	definition: DocTypeDefinition,
	item?: FrappeResource
): Record<string, unknown> {
	if (!item) return {};
	return definition.fields.reduce<Record<string, unknown>>((values, field) => {
		if (item[field.id] !== undefined) {
			values[field.id] = normalizeInitialValue(field, item[field.id]);
		}
		return values;
	}, {});
}

export function findMissingRequiredField(
	definition: DocTypeDefinition,
	values: Record<string, unknown>
): ResourceFieldDefinition | undefined {
	return definition.fields.find(
		(field) =>
			field.required &&
			!field.readOnly &&
			(values[field.id] === undefined || values[field.id] === '')
	);
}

export function makeSubmitPayload(
	definition: DocTypeDefinition,
	values: Record<string, unknown>,
	item?: FrappeResource
): Record<string, unknown> {
	const baseValues = item?.name && values.name === undefined ? { name: item.name } : {};
	const entries = Object.entries({ ...baseValues, ...values }).filter(
		([key]) => !definition.fields.find((field) => field.id === key)?.readOnly
	);
	return Object.fromEntries(
		entries.map(([key, value]) => {
			const field = definition.fields.find((candidate) => candidate.id === key);
			if (field?.type === 'datetime' && typeof value === 'string') {
				return [key, value.replace('T', ' ')];
			}
			if (field?.type === 'checkbox') return [key, value ? 1 : 0];
			return [key, value];
		})
	);
}
