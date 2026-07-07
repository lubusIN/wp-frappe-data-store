/**
 * Rewrites HTTPS-only Frappe cookies for the sample-app's local HTTP origin.
 * This is development-only; production proxies should preserve secure cookies.
 */
export function rewriteCookieForLocalHttp(cookie: string): string {
	return cookie
		.replace(/;\s*Secure\b/gi, '')
		.replace(/;\s*SameSite=None\b/gi, '; SameSite=Lax');
}
