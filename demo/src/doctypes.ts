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

export type DocTypeDefinition = {
	name: string;
	label: string;
	description: string;
	titleField: string;
	fields: ResourceFieldDefinition[];
};

const systemFields: ResourceFieldDefinition[] = [
	{ id: 'name', label: 'ID', readOnly: true },
	{ id: 'owner', label: 'Owner', readOnly: true },
	{ id: 'modified', label: 'Modified', type: 'datetime', readOnly: true },
];

export const DOC_TYPES: DocTypeDefinition[] = [
	{
		name: 'Task',
		label: 'Tasks',
		description: 'Plan work, ownership, priority, and progress.',
		titleField: 'subject',
		fields: [
			{ id: 'subject', label: 'Subject', required: true },
			{
				id: 'status',
				label: 'Status',
				type: 'select',
				options: [
					'Open',
					'Working',
					'Pending Review',
					'Overdue',
					'Completed',
					'Cancelled',
				],
			},
			{
				id: 'priority',
				label: 'Priority',
				type: 'select',
				options: ['Low', 'Medium', 'High', 'Urgent'],
			},
			{ id: 'project', label: 'Project' },
			{ id: 'exp_start_date', label: 'Expected start', type: 'date' },
			{ id: 'exp_end_date', label: 'Expected end', type: 'date' },
			{ id: 'description', label: 'Description', type: 'textarea' },
			...systemFields,
		],
	},
	{
		name: 'ToDo',
		label: 'To-dos',
		description: 'Personal and assigned work queues.',
		titleField: 'description',
		fields: [
			{
				id: 'description',
				label: 'Description',
				type: 'textarea',
				required: true,
			},
			{
				id: 'status',
				label: 'Status',
				type: 'select',
				options: ['Open', 'Closed', 'Cancelled'],
			},
			{
				id: 'priority',
				label: 'Priority',
				type: 'select',
				options: ['Low', 'Medium', 'High'],
			},
			{ id: 'date', label: 'Due date', type: 'date' },
			{ id: 'allocated_to', label: 'Assigned to' },
			{ id: 'reference_type', label: 'Reference type' },
			{ id: 'reference_name', label: 'Reference name' },
			...systemFields,
		],
	},
	{
		name: 'Note',
		label: 'Notes',
		description: 'Team notes and lightweight documentation.',
		titleField: 'title',
		fields: [
			{ id: 'title', label: 'Title', required: true },
			{ id: 'content', label: 'Content', type: 'textarea', required: true },
			{ id: 'public', label: 'Public', type: 'checkbox' },
			...systemFields,
		],
	},
	{
		name: 'Contact',
		label: 'Contacts',
		description: 'People and their primary contact details.',
		titleField: 'full_name',
		fields: [
			{ id: 'first_name', label: 'First name', required: true },
			{ id: 'last_name', label: 'Last name' },
			{ id: 'full_name', label: 'Full name', readOnly: true },
			{ id: 'email_id', label: 'Email' },
			{ id: 'mobile_no', label: 'Mobile' },
			{ id: 'company_name', label: 'Company' },
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
		name: 'Customer',
		label: 'Customers',
		description: 'Customer accounts and market information.',
		titleField: 'customer_name',
		fields: [
			{ id: 'customer_name', label: 'Customer name', required: true },
			{
				id: 'customer_type',
				label: 'Type',
				type: 'select',
				options: ['Company', 'Individual', 'Partnership'],
			},
			{ id: 'customer_group', label: 'Customer group' },
			{ id: 'territory', label: 'Territory' },
			{ id: 'disabled', label: 'Disabled', type: 'checkbox' },
			...systemFields,
		],
	},
	{
		name: 'Issue',
		label: 'Issues',
		description: 'Support requests, ownership, and resolution state.',
		titleField: 'subject',
		fields: [
			{ id: 'subject', label: 'Subject', required: true },
			{
				id: 'status',
				label: 'Status',
				type: 'select',
				options: ['Open', 'Replied', 'Hold', 'Resolved', 'Closed'],
			},
			{
				id: 'priority',
				label: 'Priority',
				type: 'select',
				options: ['Low', 'Medium', 'High'],
			},
			{ id: 'issue_type', label: 'Issue type' },
			{ id: 'customer', label: 'Customer' },
			{ id: 'description', label: 'Description', type: 'textarea' },
			...systemFields,
		],
	},
];
