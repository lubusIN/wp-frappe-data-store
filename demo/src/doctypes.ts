export type ResourceFieldDefinition = {
	id: string;
	label: string;
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

export type DocTypeDefinition = {
	name: string;
	label: string;
	description: string;
	titleField: string;
	icon: CrmIcon;
	fields: ResourceFieldDefinition[];
};

const systemFields: ResourceFieldDefinition[] = [
	{ id: 'name', label: 'ID', readOnly: true },
	{ id: 'owner', label: 'Owner', readOnly: true },
	{ id: 'modified', label: 'Last modified', type: 'datetime', readOnly: true },
];

// These names and fields mirror the DocTypes shipped by the Frappe CRM app.
export const DOC_TYPES: DocTypeDefinition[] = [
	{
		name: 'CRM Lead',
		label: 'Leads',
		description: 'People and companies entering your sales pipeline.',
		titleField: 'lead_name',
		icon: 'leads',
		fields: [
			{ id: 'lead_name', label: 'Lead name', readOnly: true },
			{ id: 'first_name', label: 'First name', required: true },
			{ id: 'middle_name', label: 'Middle name' },
			{ id: 'last_name', label: 'Last name' },
			{ id: 'status', label: 'Status', required: true },
			{ id: 'organization', label: 'Organization' },
			{ id: 'email', label: 'Email' },
			{ id: 'mobile_no', label: 'Mobile no.' },
			{ id: 'job_title', label: 'Job title' },
			{ id: 'lead_owner', label: 'Lead owner' },
			{ id: 'source', label: 'Source' },
			{ id: 'industry', label: 'Industry' },
			{ id: 'converted', label: 'Converted', type: 'checkbox', readOnly: true },
			...systemFields,
		],
	},
	{
		name: 'CRM Deal',
		label: 'Deals',
		description: 'Qualified opportunities, value, ownership, and next steps.',
		titleField: 'organization',
		icon: 'deals',
		fields: [
			{ id: 'organization', label: 'Organization' },
			{ id: 'status', label: 'Status', required: true },
			{ id: 'lead', label: 'Lead' },
			{ id: 'deal_owner', label: 'Deal owner' },
			{ id: 'deal_value', label: 'Deal value', type: 'number' },
			{ id: 'probability', label: 'Probability', type: 'number' },
			{ id: 'expected_closure_date', label: 'Expected closure', type: 'date' },
			{ id: 'next_step', label: 'Next step' },
			{ id: 'email', label: 'Primary email' },
			{ id: 'mobile_no', label: 'Primary mobile no.' },
			{ id: 'source', label: 'Source' },
			...systemFields,
		],
	},
	{
		name: 'Contact',
		label: 'Contacts',
		description: 'People connected to your leads, deals, and organizations.',
		titleField: 'full_name',
		icon: 'contacts',
		fields: [
			{ id: 'full_name', label: 'Full name', readOnly: true },
			{ id: 'first_name', label: 'First name', required: true },
			{ id: 'last_name', label: 'Last name' },
			{ id: 'email_id', label: 'Email', readOnly: true },
			{ id: 'mobile_no', label: 'Mobile no.', readOnly: true },
			{ id: 'company_name', label: 'Company' },
			{ id: 'designation', label: 'Designation' },
			{
				id: 'status',
				label: 'Status',
				type: 'select',
				options: ['Passive', 'Open', 'Replied'],
			},
			...systemFields,
		],
	},
	{
		name: 'CRM Organization',
		label: 'Organizations',
		description: 'Companies associated with contacts and opportunities.',
		titleField: 'organization_name',
		icon: 'organizations',
		fields: [
			{ id: 'organization_name', label: 'Organization name', required: true },
			{ id: 'website', label: 'Website' },
			{ id: 'industry', label: 'Industry' },
			{ id: 'territory', label: 'Territory' },
			{
				id: 'no_of_employees',
				label: 'No. of employees',
				type: 'select',
				options: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
			},
			{ id: 'annual_revenue', label: 'Annual revenue', type: 'number' },
			{ id: 'currency', label: 'Currency' },
			...systemFields,
		],
	},
	{
		name: 'FCRM Note',
		label: 'Notes',
		description: 'Context and follow-up notes attached to CRM records.',
		titleField: 'title',
		icon: 'notes',
		fields: [
			{ id: 'title', label: 'Title', required: true },
			{ id: 'content', label: 'Content', type: 'textarea' },
			{
				id: 'reference_doctype',
				label: 'Reference document type',
				type: 'select',
				options: ['CRM Lead', 'CRM Deal', 'Contact', 'CRM Organization'],
			},
			{ id: 'reference_docname', label: 'Reference record' },
			...systemFields,
		],
	},
	{
		name: 'CRM Task',
		label: 'Tasks',
		description: 'Sales follow-ups linked directly to leads and deals.',
		titleField: 'title',
		icon: 'tasks',
		fields: [
			{ id: 'title', label: 'Title', required: true },
			{
				id: 'status',
				label: 'Status',
				type: 'select',
				options: ['Backlog', 'Todo', 'In Progress', 'Done', 'Canceled'],
			},
			{
				id: 'priority',
				label: 'Priority',
				type: 'select',
				options: ['Low', 'Medium', 'High'],
			},
			{ id: 'assigned_to', label: 'Assigned to' },
			{ id: 'start_date', label: 'Start date', type: 'date' },
			{ id: 'due_date', label: 'Due date', type: 'datetime' },
			{
				id: 'reference_doctype',
				label: 'Reference document type',
				type: 'select',
				options: ['CRM Lead', 'CRM Deal', 'Contact', 'CRM Organization'],
			},
			{ id: 'reference_docname', label: 'Reference record' },
			{ id: 'description', label: 'Description', type: 'textarea' },
			...systemFields,
		],
	},
];
