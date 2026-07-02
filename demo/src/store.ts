import { registerFrappeDataStore } from 'wp-frappe-data-store';
import { getConnectionHeaders } from './auth';

export const frappeStore = registerFrappeDataStore({
	storeName: 'frappe-demo/resources',
	baseUrl: '/frappe-api',
	apiPath: '/api/resource',
	credentials: 'include',
	headers: getConnectionHeaders,
});
