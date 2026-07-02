import type {
	FrappeRequest,
	FrappeRequestOptions,
	FrappeStoreConfig,
} from './types';
import { joinUrl } from './utils';

type FrappeErrorBody = {
	exception?: string;
	exc_type?: string;
	message?: string;
	_server_messages?: string;
};

/**
 * Custom error class thrown when a Frappe HTTP API request fails or returns a non-2xx status code.
 * Extracts user-readable error messages from Frappe `_server_messages` or `exception` payloads when available.
 */
export class FrappeRequestError extends Error {
	status: number;
	body: unknown;

	constructor(message: string, status: number, body: unknown) {
		super(message);
		this.name = 'FrappeRequestError';
		this.status = status;
		this.body = body;
	}
}

function errorMessage(body: FrappeErrorBody, status: number): string {
	if (body.message) return body.message;
	if (body._server_messages) {
		try {
			const messages = JSON.parse(body._server_messages) as string[];
			const first = JSON.parse(messages[0] || '{}') as { message?: string };
			if (first.message) return first.message.replace(/<[^>]*>/g, '');
		} catch {
			// Ignore malformed server messages and use the normal fallback.
		}
	}
	if (body.exception) return body.exception;
	if (body.exc_type) return body.exc_type;
	return `Frappe request failed with status ${status}`;
}

/**
 * Creates a default transport function (`FrappeRequest`) using native `fetch` based on store configuration.
 *
 * @param config Store configuration providing `baseUrl`, `headers`, and `credentials`.
 * @returns A transport function accepting request options and returning parsed JSON response bodies.
 */
export function createFrappeRequest(config: FrappeStoreConfig): FrappeRequest {
	const baseUrl = config.baseUrl ?? '';
	return async (options: FrappeRequestOptions): Promise<unknown> => {
		const url = new URL(
			joinUrl(baseUrl, options.path),
			globalThis.location?.origin
		);
		for (const [key, value] of Object.entries(options.query ?? {})) {
			url.searchParams.set(key, value);
		}

		const configuredHeaders =
			typeof config.headers === 'function'
				? config.headers()
				: config.headers;
		const headers = new Headers(configuredHeaders);
		if (options.data) headers.set('Content-Type', 'application/json');

		const response = await fetch(url, {
			method: options.method,
			headers,
			credentials: config.credentials ?? 'same-origin',
			body: options.data ? JSON.stringify(options.data) : undefined,
			signal: options.signal,
		});
		const body = (await response.json().catch(() => ({}))) as FrappeErrorBody;
		if (!response.ok) {
			throw new FrappeRequestError(
				errorMessage(body, response.status),
				response.status,
				body
			);
		}
		return body;
	};
}
