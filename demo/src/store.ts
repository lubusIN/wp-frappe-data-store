import { registerFrappeDataStore } from '../../src';
import { getAuthorizationHeader } from './auth';

export const frappeStore = registerFrappeDataStore({
	storeName: 'frappe-demo/resources',
	baseUrl: '/frappe-api',
	apiPath: '/api/resource',
	credentials: 'include',
	headers: getAuthorizationHeader,
});
