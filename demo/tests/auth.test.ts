import { describe, expect, it } from 'vitest';
import { normalizeFrappeSiteUrl } from '../src/auth';

describe('demo Frappe site URL', () => {
	it('normalizes a valid site origin', () => {
		expect(normalizeFrappeSiteUrl(' https://crm.example.test/ ')).toBe(
			'https://crm.example.test'
		);
		expect(normalizeFrappeSiteUrl('http://localhost:8000')).toBe(
			'http://localhost:8000'
		);
	});

	it('rejects unsafe or non-origin values', () => {
		expect(() => normalizeFrappeSiteUrl('crm.example.test')).toThrow(
			'including http:// or https://'
		);
		expect(() => normalizeFrappeSiteUrl('ftp://crm.example.test')).toThrow(
			'must use http:// or https://'
		);
		expect(() => normalizeFrappeSiteUrl('https://user:pass@crm.test')).toThrow(
			'Do not include credentials'
		);
		expect(() => normalizeFrappeSiteUrl('https://crm.test/app')).toThrow(
			'without a path'
		);
	});
});
