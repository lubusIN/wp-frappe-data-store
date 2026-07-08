import { registerFrappeDataStore } from '@lubusin/wp-frappe-data-store';
import { getConnectionHeaders, getWpNonceHeader } from './auth';

export const frappeStore = registerFrappeDataStore( {
	storeName: 'frappe-sample-plugin/resources',
	baseUrl: '/wp-json/frappe-data-store/v1/proxy',
	apiPath: '/api/resource',
	credentials: 'include',
	headers: () => ( {
		...getConnectionHeaders(),
		...getWpNonceHeader(),
	} ),
} );
