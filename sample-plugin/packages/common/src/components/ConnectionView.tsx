import { Button, Notice, Spinner, TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { Icon, wordpress } from '@wordpress/icons';
import {
	clearApiToken,
	getFrappeSiteUrl,
	hasApiToken,
	loginWithPassword,
	logoutSession,
	saveApiToken,
	saveFrappeSiteUrl,
	validateFrappeConnection,
} from '../auth';

type Props = {
	isChecking?: boolean;
	onAuthenticated?: () => Promise<void> | void;
	onDisconnected?: () => void;
};

export function ConnectionView({
	isChecking = false,
	onAuthenticated,
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
			await onAuthenticated?.();
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
		<div className="frappe-connection-screen">
			<section className="frappe-connection-card" aria-live="polite">
				<div className="frappe-connection-brand">
					<Icon icon={wordpress} size={40} />
					<div>
						<strong>WP Frappe DataStore</strong>
						<span>WordPress Plugin Integration</span>
					</div>
				</div>
				{isChecking ? (
					<div className="frappe-connection-checking">
						<Spinner />
						<p>Checking the Frappe CRM connection…</p>
					</div>
				) : (
					<>
						<h1>Connect to Frappe CRM</h1>
						<p className="frappe-modal-intro">
							Enter the Frappe CRM site URL and authenticate. Requests are proxied securely through the WordPress REST API without CORS restrictions.
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
									{disconnectButton}
								</div>
							</form>
						)}
					</>
				)}
			</section>
		</div>
	);
}
