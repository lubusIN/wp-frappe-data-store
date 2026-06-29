import { registerFrappeDataStore } from '../../src';
import { getConnectionHeaders } from './auth';

export const frappeStore = registerFrappeDataStore({
	storeName: 'frappe-demo/resources',
	baseUrl: '/frappe-api',
	apiPath: '/api/resource',
	credentials: 'include',
	headers: getConnectionHeaders,
});
