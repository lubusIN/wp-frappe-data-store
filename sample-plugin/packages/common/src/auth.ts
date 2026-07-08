const TOKEN_KEY = 'wp-frappe-sample-plugin-token';
const SITE_URL_KEY = 'wp-frappe-sample-plugin-site-url';
const DEFAULT_SITE_URL = 'https://frappe.localhost';
export const SITE_URL_HEADER = 'X-Frappe-Site-URL';
const CONNECTION_TIMEOUT_MS = 12000;

export function getWpNonceHeader(): HeadersInit {
	const nonce = (
		window as unknown as { wpApiSettings?: { nonce?: string } }
	)?.wpApiSettings?.nonce;
	return nonce ? { 'X-WP-Nonce': nonce } : {};
}

async function fetchFrappe(
	path: string,
	options: RequestInit
): Promise<Response> {
	const controller = new AbortController();
	const timeout = window.setTimeout(
		() => controller.abort(),
		CONNECTION_TIMEOUT_MS
	);
	try {
		return await fetch(`/wp-json/frappe-data-store/v1/proxy${ path }`, {
			...options,
			headers: {
				...getWpNonceHeader(),
				...( options.headers || {} ),
			},
			signal: controller.signal,
		});
	} catch ( error ) {
		if ( controller.signal.aborted ) {
			throw new Error(
				`Could not reach ${ getFrappeSiteUrl() }. Check the site URL.`
			);
		}
		throw error;
	} finally {
		window.clearTimeout( timeout );
	}
}

export function normalizeFrappeSiteUrl( value: string ): string {
	let url: URL;
	try {
		url = new URL( value.trim() );
	} catch {
		throw new Error(
			'Enter a valid Frappe site URL, including http:// or https://.'
		);
	}
	if ( ! [ 'http:', 'https:' ].includes( url.protocol ) ) {
		throw new Error( 'The Frappe site URL must use http:// or https://.' );
	}
	if ( url.username || url.password ) {
		throw new Error( 'Do not include credentials in the Frappe site URL.' );
	}
	if ( url.pathname !== '/' || url.search || url.hash ) {
		throw new Error(
			'Enter the Frappe site origin without a path, query, or hash.'
		);
	}
	return url.origin;
}

export function getFrappeSiteUrl(): string {
	return sessionStorage.getItem( SITE_URL_KEY ) || DEFAULT_SITE_URL;
}

export function saveFrappeSiteUrl( value: string ): string {
	const siteUrl = normalizeFrappeSiteUrl( value );
	sessionStorage.setItem( SITE_URL_KEY, siteUrl );
	return siteUrl;
}

function getSiteUrlHeader(): HeadersInit {
	return { [ SITE_URL_HEADER ]: getFrappeSiteUrl() };
}

export function getAuthorizationHeader(): HeadersInit {
	const token = sessionStorage.getItem( TOKEN_KEY );
	return token ? { Authorization: `token ${ token }` } : {};
}

export function getConnectionHeaders(): HeadersInit {
	return {
		...getSiteUrlHeader(),
		...getAuthorizationHeader(),
	};
}

export function hasApiToken(): boolean {
	return Boolean( sessionStorage.getItem( TOKEN_KEY ) );
}

export function saveApiToken( apiKey: string, apiSecret: string ): void {
	if ( ! apiKey.trim() || ! apiSecret.trim() ) {
		throw new Error( 'Both API key and API secret are required.' );
	}
	sessionStorage.setItem(
		TOKEN_KEY,
		`${ apiKey.trim() }:${ apiSecret.trim() }`
	);
}

export function clearApiToken(): void {
	sessionStorage.removeItem( TOKEN_KEY );
}

function getFrappeMessage( body: Record< string, unknown > ): string {
	if ( typeof body.message === 'string' ) {
		return body.message;
	}
	if ( typeof body.exception === 'string' ) {
		return body.exception;
	}
	if ( typeof body._server_messages === 'string' ) {
		try {
			const messages = JSON.parse( body._server_messages ) as string[];
			const first = JSON.parse( messages[ 0 ] || '{}' ) as {
				message?: string;
			};
			if ( first.message ) {
				return first.message.replace( /<[^>]*>/g, '' );
			}
		} catch {
			// Fall through to generic message.
		}
	}
	return 'Frappe rejected the request.';
}

export async function loginWithPassword(
	username: string,
	password: string
): Promise< void > {
	const response = await fetchFrappe( '/api/method/login', {
		method: 'POST',
		headers: {
			...getSiteUrlHeader(),
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams( { usr: username, pwd: password } ),
		credentials: 'include',
	} );
	const body = ( await response.json().catch( () => ( {} ) ) ) as Record<
		string,
		unknown
	>;
	if ( ! response.ok || body.exc_type ) {
		throw new Error( getFrappeMessage( body ) );
	}
}

export async function validateFrappeConnection(): Promise< string > {
	const response = await fetchFrappe(
		'/api/method/frappe.auth.get_logged_user',
		{
			method: 'GET',
			headers: getConnectionHeaders(),
			credentials: 'include',
		}
	);
	const body = ( await response.json().catch( () => ( {} ) ) ) as Record<
		string,
		unknown
	>;
	if ( ! response.ok || body.exc_type ) {
		throw new Error( getFrappeMessage( body ) );
	}
	if ( typeof body.message !== 'string' || body.message === 'Guest' ) {
		throw new Error( 'Connect with a valid Frappe account to continue.' );
	}
	return body.message;
}

export async function logoutSession(): Promise< void > {
	await fetchFrappe( '/api/method/logout', {
		method: 'GET',
		headers: getSiteUrlHeader(),
		credentials: 'include',
	} );
}
