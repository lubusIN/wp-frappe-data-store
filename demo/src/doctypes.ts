import {
	createFrappeRequest,
	loadDocTypeDefinition as loadCoreDocTypeDefinition,
} from '@lubusin/wp-frappe-data-store';
import type {
	DocTypeDefinition,
	ResourceFieldDefinition,
} from '@lubusin/wp-frappe-data-store';
import { getConnectionHeaders } from './auth';

export type DocTypeShell = {
	name: string;
	label: string;
	description: string;
	icon?: string;
};

export type {
	DocTypeDefinition,
	ResourceFieldDefinition,
};

const request = createFrappeRequest({
	baseUrl: '/frappe-api',
	headers: getConnectionHeaders,
	credentials: 'include',
});

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

export function loadDocTypeDefinition(
	doctype: string
): Promise<DocTypeDefinition> {
	return loadCoreDocTypeDefinition(request, doctype);
}
