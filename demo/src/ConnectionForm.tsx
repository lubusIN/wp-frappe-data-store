import { Button, Notice, TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import {
	clearApiToken,
	getFrappeSiteUrl,
	hasApiToken,
	loginWithPassword,
	logoutSession,
	saveApiToken,
	saveFrappeSiteUrl,
	validateFrappeConnection,
} from './auth';

type Props = {
	onAuthenticated: () => Promise<void> | void;
	onCancel?: () => void;
	onDisconnected?: () => void;
};

export function ConnectionForm({
	onAuthenticated,
	onCancel,
	onDisconnected,
}: Props) {
	const [mode, setMode] = useState<'password' | 'token'>(
		hasApiToken() ? 'token' : 'password'
	);
	const [siteUrl, setSiteUrl] = useState(getFrappeSiteUrl());
	const [username, setUsername] = useState('Administrator');
	const [password, setPassword] = useState('');
	const [apiKey, setApiKey] = useState('');
	const [apiSecret, setApiSecret] = useState('');
	const [isBusy, setBusy] = useState(false);
	const [message, setMessage] = useState<string>();

	async function run(action: () => Promise<void>) {
		setBusy(true);
		setMessage(undefined);
		try {
			await action();
			await validateFrappeConnection();
			await onAuthenticated();
		} catch (error) {
			setMessage(error instanceof Error ? error.message : String(error));
		} finally {
			setBusy(false);
		}
	}

	async function disconnect() {
		setBusy(true);
		setMessage(undefined);
		try {
			clearApiToken();
			await logoutSession().catch(() => undefined);
			onDisconnected?.();
		} finally {
			setBusy(false);
		}
	}

	const disconnectButton = onDisconnected ? (
		<Button
			variant="tertiary"
			isDestructive
			onClick={() => void disconnect()}
			disabled={isBusy}
		>
			Disconnect
		</Button>
	) : null;

	return (
		<>
			<p className="frappe-modal-intro">
				Enter the Frappe CRM site and authenticate. Credentials and the site URL
				stay in this browser session.
			</p>
			<TextControl
				label="Frappe site URL"
				type="url"
				value={siteUrl}
				onChange={setSiteUrl}
				placeholder="https://frappe.localhost"
				help="Enter the site origin without a path."
				required
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<div className="frappe-auth-switcher" role="group" aria-label="Authentication method">
				<Button
					variant={mode === 'password' ? 'primary' : 'secondary'}
					onClick={() => setMode('password')}
				>
					Password
				</Button>
				<Button
					variant={mode === 'token' ? 'primary' : 'secondary'}
					onClick={() => setMode('token')}
				>
					API token
				</Button>
			</div>

			{message && (
				<Notice status="error" isDismissible={false}>
					{message}
				</Notice>
			)}

			{mode === 'password' ? (
				<form
					onSubmit={(event) => {
						event.preventDefault();
						void run(async () => {
							saveFrappeSiteUrl(siteUrl);
							clearApiToken();
							await loginWithPassword(username, password);
						});
					}}
				>
					<TextControl
						label="Username"
						value={username}
						onChange={setUsername}
						required
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<TextControl
						label="Password"
						type="password"
						value={password}
						onChange={setPassword}
						required
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<div className="frappe-modal-actions">
						<Button variant="primary" type="submit" isBusy={isBusy}>
							Connect
						</Button>
						{onCancel && (
							<Button variant="tertiary" onClick={onCancel} disabled={isBusy}>
								Cancel
							</Button>
						)}
						{disconnectButton}
					</div>
				</form>
			) : (
				<form
					onSubmit={(event) => {
						event.preventDefault();
						void run(async () => {
							saveFrappeSiteUrl(siteUrl);
							saveApiToken(apiKey, apiSecret);
						});
					}}
				>
					<TextControl
						label="API key"
						value={apiKey}
						onChange={setApiKey}
						required
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<TextControl
						label="API secret"
						type="password"
						value={apiSecret}
						onChange={setApiSecret}
						required
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<div className="frappe-modal-actions">
						<Button variant="primary" type="submit" isBusy={isBusy}>
							Connect
						</Button>
						{onCancel && (
							<Button variant="tertiary" onClick={onCancel} disabled={isBusy}>
								Cancel
							</Button>
						)}
						{disconnectButton}
					</div>
				</form>
			)}
		</>
	);
}
