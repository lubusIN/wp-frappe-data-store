const TOKEN_KEY = 'wp-frappe-demo-token';

export function getAuthorizationHeader(): HeadersInit {
	const token = sessionStorage.getItem(TOKEN_KEY);
	return token ? { Authorization: `token ${token}` } : {};
}

export function hasApiToken(): boolean {
	return Boolean(sessionStorage.getItem(TOKEN_KEY));
}

export function saveApiToken(apiKey: string, apiSecret: string): void {
	if (!apiKey.trim() || !apiSecret.trim()) {
		throw new Error('Both API key and API secret are required.');
	}
	sessionStorage.setItem(TOKEN_KEY, `${apiKey.trim()}:${apiSecret.trim()}`);
}

export function clearApiToken(): void {
	sessionStorage.removeItem(TOKEN_KEY);
}

function getFrappeMessage(body: Record<string, unknown>): string {
	if (typeof body.message === 'string') return body.message;
	if (typeof body.exception === 'string') return body.exception;
	if (typeof body._server_messages === 'string') {
		try {
			const messages = JSON.parse(body._server_messages) as string[];
			const first = JSON.parse(messages[0] || '{}') as { message?: string };
			if (first.message) return first.message.replace(/<[^>]*>/g, '');
		} catch {
			// Fall through to the generic message.
		}
	}
	return 'Frappe rejected the request.';
}

export async function loginWithPassword(
	username: string,
	password: string
): Promise<void> {
	const response = await fetch('/frappe-api/api/method/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ usr: username, pwd: password }),
		credentials: 'include',
	});
	const body = (await response.json().catch(() => ({}))) as Record<
		string,
		unknown
	>;
	if (!response.ok || body.exc_type) throw new Error(getFrappeMessage(body));
}

export async function logoutSession(): Promise<void> {
	await fetch('/frappe-api/api/method/logout', {
		method: 'GET',
		credentials: 'include',
	});
}
