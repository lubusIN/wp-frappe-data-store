import { Modal } from '@wordpress/components';
import { ConnectionForm } from './ConnectionForm';

type Props = {
	onClose: () => void;
	onAuthenticated: () => Promise<void>;
	onDisconnected: () => void;
};

export function ConnectionModal({
	onClose,
	onAuthenticated,
	onDisconnected,
}: Props) {
	return (
		<Modal
			title="Frappe CRM connection"
			onRequestClose={onClose}
			className="frappe-connection-modal"
		>
			<ConnectionForm
				onAuthenticated={async () => {
					await onAuthenticated();
					onClose();
				}}
				onCancel={onClose}
				onDisconnected={() => {
					onDisconnected();
					onClose();
				}}
			/>
		</Modal>
	);
}
