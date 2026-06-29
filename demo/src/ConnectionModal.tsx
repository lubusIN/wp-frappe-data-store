import {
	Button,
	Modal,
	Notice,
	TextControl,
} from '@wordpress/components';
import { useState } from 'react';
import {
	clearApiToken,
	hasApiToken,
	loginWithPassword,
	logoutSession,
	saveApiToken,
} from './auth';

type Props = {
	onClose: () => void;
	onAuthenticated: () => Promise<void>;
};

export function ConnectionModal({ onClose, onAuthenticated }: Props) {
	const [mode, setMode] = useState<'password' | 'token'>(
		hasApiToken() ? 'token' : 'password'
	);
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
			await onAuthenticated();
			onClose();
		} catch (error) {
			setMessage(error instanceof Error ? error.message : String(error));
		} finally {
			setBusy(false);
		}
	}

	return (
		<Modal
			title="Connect to Frappe"
			onRequestClose={onClose}
			className="frappe-connection-modal"
		>
			<p className="frappe-modal-intro">
				The development proxy sends requests to{' '}
				<code>https://frappe.localhost</code>. Credentials stay in this browser
				session.
			</p>
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
							clearApiToken();
							await loginWithPassword(username, password);
						});
					}}
				>
					<TextControl
						label="Username"
						value={username}
						onChange={setUsername}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<TextControl
						label="Password"
						type="password"
						value={password}
						onChange={setPassword}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<div className="frappe-modal-actions">
						<Button variant="primary" type="submit" isBusy={isBusy}>
							Sign in
						</Button>
						<Button variant="tertiary" onClick={onClose}>
							Cancel
						</Button>
					</div>
				</form>
			) : (
				<form
					onSubmit={(event) => {
						event.preventDefault();
						void run(async () => saveApiToken(apiKey, apiSecret));
					}}
				>
					<TextControl
						label="API key"
						value={apiKey}
						onChange={setApiKey}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<TextControl
						label="API secret"
						type="password"
						value={apiSecret}
						onChange={setApiSecret}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<div className="frappe-modal-actions">
						<Button variant="primary" type="submit" isBusy={isBusy}>
							Use token
						</Button>
						{hasApiToken() && (
							<Button
								variant="tertiary"
								isDestructive
								onClick={() =>
									void run(async () => {
										clearApiToken();
										await logoutSession();
									})
								}
							>
								Clear credentials
							</Button>
						)}
					</div>
				</form>
			)}
		</Modal>
	);
}
