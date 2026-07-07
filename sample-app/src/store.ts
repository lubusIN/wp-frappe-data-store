import { registerFrappeDataStore } from '@lubusin/wp-frappe-data-store';
import { getConnectionHeaders } from './auth';

export const frappeStore = registerFrappeDataStore({
	storeName: 'frappe-sample-app/resources',
	baseUrl: '/frappe-api',
	apiPath: '/api/resource',
	credentials: 'include',
	headers: getConnectionHeaders,
});
