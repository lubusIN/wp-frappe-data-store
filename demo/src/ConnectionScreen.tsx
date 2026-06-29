import { Spinner } from '@wordpress/components';
import { Icon, wordpress } from '@wordpress/icons';
import { ConnectionForm } from './ConnectionForm';

type Props =
	| { isChecking: true; onAuthenticated?: never }
	| { isChecking: false; onAuthenticated: () => void };

export function ConnectionScreen(props: Props) {
	return (
		<main className="frappe-connection-screen">
			<section className="frappe-connection-card" aria-live="polite">
				<div className="frappe-connection-brand">
					<Icon icon={wordpress} size={40} />
					<div>
						<strong>WP Frappe</strong>
						<span>CRM DataViews demo</span>
					</div>
				</div>
				{props.isChecking ? (
					<div className="frappe-connection-checking">
						<Spinner />
						<p>Checking the Frappe CRM connection…</p>
					</div>
				) : (
					<>
						<h1>Connect to Frappe CRM</h1>
						<ConnectionForm onAuthenticated={props.onAuthenticated} />
					</>
				)}
			</section>
		</main>
	);
}
