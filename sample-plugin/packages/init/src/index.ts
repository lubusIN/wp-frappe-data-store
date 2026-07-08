import './router-compat';
import { dispatch } from '@wordpress/data';
import { store as bootStore } from '@wordpress/boot';
import { __ } from '@wordpress/i18n';
import {
	people,
	currencyDollar,
	postAuthor,
	store,
	pencil,
	check,
	cog,
} from '@wordpress/icons';

/**
 * Initialize page - this function is mandatory.
 * All init modules must export an 'init' function.
 */
export async function init() {
	dispatch( bootStore ).registerMenuItem( 'leads', {
		id: 'leads',
		label: __( 'Leads', 'wp-frappe-data-store-sample' ),
		to: '/',
		icon: people,
	} );
	dispatch( bootStore ).registerMenuItem( 'deals', {
		id: 'deals',
		label: __( 'Deals', 'wp-frappe-data-store-sample' ),
		to: '/deals',
		icon: currencyDollar,
	} );
	dispatch( bootStore ).registerMenuItem( 'contacts', {
		id: 'contacts',
		label: __( 'Contacts', 'wp-frappe-data-store-sample' ),
		to: '/contacts',
		icon: postAuthor,
	} );
	dispatch( bootStore ).registerMenuItem( 'organizations', {
		id: 'organizations',
		label: __( 'Organizations', 'wp-frappe-data-store-sample' ),
		to: '/organizations',
		icon: store,
	} );
	dispatch( bootStore ).registerMenuItem( 'notes', {
		id: 'notes',
		label: __( 'Notes', 'wp-frappe-data-store-sample' ),
		to: '/notes',
		icon: pencil,
	} );
	dispatch( bootStore ).registerMenuItem( 'tasks', {
		id: 'tasks',
		label: __( 'Tasks', 'wp-frappe-data-store-sample' ),
		to: '/tasks',
		icon: check,
	} );
	dispatch( bootStore ).registerMenuItem( 'settings', {
		id: 'settings',
		label: __( 'Connection', 'wp-frappe-data-store-sample' ),
		to: '/settings',
		icon: cog,
	} );
}
