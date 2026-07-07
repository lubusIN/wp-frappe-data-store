// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@wordpress/components', () => ({
	Button: ({ children, isBusy: _isBusy, isDestructive: _isDestructive, ...props }: any) => (
		<button {...props}>{children}</button>
	),
	Notice: ({ children }: any) => <div role="alert">{children}</div>,
	TextControl: ({ label, onChange, ...props }: any) => (
		<label>
			{label}
			<input {...props} onChange={(event) => onChange(event.target.value)} />
		</label>
	),
}));

const auth = vi.hoisted(() => ({
	clearApiToken: vi.fn(),
	getFrappeSiteUrl: vi.fn(() => 'https://frappe.test'),
	hasApiToken: vi.fn(() => false),
	loginWithPassword: vi.fn().mockResolvedValue(undefined),
	logoutSession: vi.fn().mockResolvedValue(undefined),
	saveApiToken: vi.fn(),
	saveFrappeSiteUrl: vi.fn(),
	validateFrappeConnection: vi.fn().mockResolvedValue('Administrator'),
}));

vi.mock('../src/auth', () => auth);

import { ConnectionForm } from '../src/ConnectionForm';

describe('ConnectionForm', () => {
	beforeEach(() => vi.clearAllMocks());
	afterEach(cleanup);

	it('saves the site, logs in, validates, and reports authentication', async () => {
		const onAuthenticated = vi.fn();
		render(<ConnectionForm onAuthenticated={onAuthenticated} />);

		await userEvent.clear(screen.getByLabelText('Username'));
		await userEvent.type(screen.getByLabelText('Username'), 'user@example.test');
		await userEvent.type(screen.getByLabelText('Password'), 'secret');
		await userEvent.click(screen.getByRole('button', { name: 'Connect' }));

		await waitFor(() => expect(onAuthenticated).toHaveBeenCalledOnce());
		expect(auth.saveFrappeSiteUrl).toHaveBeenCalledWith('https://frappe.test');
		expect(auth.clearApiToken).toHaveBeenCalledOnce();
		expect(auth.loginWithPassword).toHaveBeenCalledWith(
			'user@example.test',
			'secret'
		);
		expect(auth.validateFrappeConnection).toHaveBeenCalledOnce();
	});

	it('supports token authentication and displays validation errors', async () => {
		auth.validateFrappeConnection.mockRejectedValueOnce(new Error('Token denied'));
		render(<ConnectionForm onAuthenticated={vi.fn()} />);

		await userEvent.click(screen.getByRole('button', { name: 'API token' }));
		await userEvent.type(screen.getByLabelText('API key'), 'key');
		await userEvent.type(screen.getByLabelText('API secret'), 'secret');
		fireEvent.submit(screen.getByRole('button', { name: 'Connect' }).closest('form')!);

		await screen.findByRole('alert');
		expect(screen.getByRole('alert').textContent).toContain('Token denied');
		expect(auth.saveApiToken).toHaveBeenCalledWith('key', 'secret');
	});

	it('clears credentials and tolerates logout failures when disconnecting', async () => {
		auth.logoutSession.mockRejectedValueOnce(new Error('Already logged out'));
		const onDisconnected = vi.fn();
		render(
			<ConnectionForm
				onAuthenticated={vi.fn()}
				onDisconnected={onDisconnected}
			/>
		);

		await userEvent.click(screen.getByRole('button', { name: 'Disconnect' }));

		await waitFor(() => expect(onDisconnected).toHaveBeenCalledOnce());
		expect(auth.clearApiToken).toHaveBeenCalledOnce();
	});
});
