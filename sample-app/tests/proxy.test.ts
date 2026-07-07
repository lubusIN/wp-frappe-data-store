import { describe, expect, it } from 'vitest';
import { rewriteCookieForLocalHttp } from '../proxy';

describe('development proxy cookies', () => {
	it('makes secure cross-site cookies usable on the local HTTP origin', () => {
		expect(
			rewriteCookieForLocalHttp(
				'sid=abc123; Path=/; HttpOnly; Secure; SameSite=None'
			)
		).toBe('sid=abc123; Path=/; HttpOnly; SameSite=Lax');
	});

	it('preserves unrelated cookie attributes', () => {
		expect(rewriteCookieForLocalHttp('sid=abc123; Path=/; HttpOnly; SameSite=Lax')).toBe(
			'sid=abc123; Path=/; HttpOnly; SameSite=Lax'
		);
	});
});
