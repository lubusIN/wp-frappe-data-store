import { createFrappeRequest } from '../../src';
import { getConnectionHeaders } from './auth';

export type ResourceFieldDefinition = {
	id: string;
	label: string;
	description?: string;
	placeholder?: string;
	type?:
		| 'text'
		| 'textarea'
		| 'select'
		| 'checkbox'
		| 'date'
		| 'datetime'
		| 'number';
	options?: string[];
	required?: boolean;
	readOnly?: boolean;
};

export type CrmIcon =
	| 'leads'
	| 'deals'
	| 'contacts'
	| 'organizations'
	| 'notes'
	| 'tasks';

export type DocTypeShell = {
	name: string;
	label: string;
	description: string;
	icon: CrmIcon;
};

export type DocTypeDefinition = DocTypeShell & {
	titleField: string;
	fields: ResourceFieldDefinition[];
};

const request = createFrappeRequest({
	baseUrl: '/frappe-api',
	headers: getConnectionHeaders,
	credentials: 'include',
});

const definitionCache: Record<string, DocTypeDefinition> = {};

export const DOC_TYPE_SHELLS: DocTypeShell[] = [
	{
		name: 'CRM Lead',
		label: 'Leads',
		description: 'People and companies entering your sales pipeline.',
		icon: 'leads',
	},
	{
		name: 'CRM Deal',
		label: 'Deals',
		description: 'Qualified opportunities, value, ownership, and next steps.',
		icon: 'deals',
	},
	{
		name: 'Contact',
		label: 'Contacts',
		description: 'People connected to your leads, deals, and organizations.',
		icon: 'contacts',
	},
	{
		name: 'CRM Organization',
		label: 'Organizations',
		description: 'Companies associated with contacts and opportunities.',
		icon: 'organizations',
	},
	{
		name: 'FCRM Note',
		label: 'Notes',
		description: 'Context and follow-up notes attached to CRM records.',
		icon: 'notes',
	},
	{
		name: 'CRM Task',
		label: 'Tasks',
		description: 'Sales follow-ups linked directly to leads and deals.',
		icon: 'tasks',
	},
];

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

export async function loadDocTypeDefinition(
	shell: DocTypeShell
): Promise<DocTypeDefinition> {
	const cachedDefinition = definitionCache[shell.name];
	if (cachedDefinition) {
		return cachedDefinition;
	}

	const response = (await request({
		method: 'GET',
		path: `/api/resource/DocType/${encodeURIComponent(shell.name)}`,
		query: {
			fields: JSON.stringify([
				'name',
				'title_field',
				'fields',
			]),
		},
	})) as { data: FrappeDocTypeMeta };

	const fields = (response.data.fields ?? [])
		.filter(isDisplayableField)
		.map(normalizeField);

	const titleField =
		response.data.title_field || fields[0]?.id || 'name';

	const definition: DocTypeDefinition = {
		...shell,
		titleField,
		fields,
	};

	definitionCache[shell.name] = definition;
	return definition;
}
