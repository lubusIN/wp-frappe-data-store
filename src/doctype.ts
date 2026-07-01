import type { FrappeRequest, DocTypeDefinition } from './types';

type FrappeDocTypeFieldMeta = {
	fieldname: string;
	label?: string;
	fieldtype?: string;
	options?: string;
	reqd?: number;
	read_only?: number;
	hidden?: number;
	description?: string;
	field_description?: string;
	placeholder?: string;
	field_placeholder?: string;
};

type FrappeDocTypeMeta = {
	name: string;
	title_field?: string;
	fields?: FrappeDocTypeFieldMeta[];
};

type ResourceFieldDefinition = DocTypeDefinition['fields'][number];

function humanizeFieldName(fieldname: string) {
	return fieldname
		.replace(/_/g, ' ')
		.replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
}

function mapFieldType(fieldtype?: string): ResourceFieldDefinition['type'] {
	switch (fieldtype) {
		case 'Check':
		case 'Currency':
		case 'Int':
		case 'Float':
		case 'Percent':
		case 'Rating':
		case 'Duration':
			return 'number';
		case 'Date':
			return 'date';
		case 'Datetime':
		case 'Time':
			return 'datetime';
		case 'Text':
		case 'Long Text':
		case 'Small Text':
		case 'Code':
		case 'Markdown':
			return 'textarea';
		case 'Select':
			return 'select';
		case 'Link':
		case 'Dynamic Link':
			return 'text';
		default:
			return 'text';
	}
}

function parseFieldOptions(fieldtype?: string, options?: string): string[] | undefined {
	if (fieldtype !== 'Select' || !options) {
		return undefined;
	}

	return options
		.split('\n')
		.map((option) => option.trim())
		.filter(Boolean);
}

function isDisplayableField(field: FrappeDocTypeFieldMeta) {
	const hidden = Boolean(field.hidden);
	const fieldtype = field.fieldtype;
	const layoutOnly = new Set([
		'Section Break',
		'Column Break',
		'HTML',
		'Button',
		'Fold',
		'Table',
		'Table MultiSelect',
		'Button',
	]);

	return (
		Boolean(field.fieldname) &&
		!hidden &&
		fieldtype !== undefined &&
		!layoutOnly.has(fieldtype)
	);
}

function normalizeField(field: FrappeDocTypeFieldMeta): ResourceFieldDefinition {
	const type = mapFieldType(field.fieldtype);
	return {
		id: field.fieldname,
		label: field.label || humanizeFieldName(field.fieldname),
		description: field.description || field.field_description,
		placeholder: field.placeholder || field.field_placeholder,
		type,
		options: parseFieldOptions(field.fieldtype, field.options),
		required: Boolean(field.reqd),
		readOnly: Boolean(field.read_only),
	};
}

const definitionCache: Record<string, DocTypeDefinition> = {};

export function getCachedDocTypeDefinition(
doctype: string
): DocTypeDefinition | undefined {
	return definitionCache[doctype];
}

export async function loadDocTypeDefinition(
	request: FrappeRequest,
	doctype: string
): Promise<DocTypeDefinition> {
	const cachedDefinition = definitionCache[doctype];
	if (cachedDefinition) {
		return cachedDefinition;
	}

	const response = (await request({
		method: 'GET',
		path: `/api/resource/DocType/${encodeURIComponent(doctype)}`,
		query: {
			fields: JSON.stringify(['name', 'title_field', 'fields']),
		},
	})) as { data: FrappeDocTypeMeta };

	const fields = (response.data.fields ?? [])
		.filter(isDisplayableField)
		.map(normalizeField);

	const titleField = response.data.title_field || fields[0]?.id || 'name';

	const definition: DocTypeDefinition = {
		name: doctype,
		titleField,
		fields,
	};

	definitionCache[doctype] = definition;
	return definition;
}
