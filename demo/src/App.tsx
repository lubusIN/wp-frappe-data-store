import {
	Button,
	Flex,
	FlexBlock,
	FlexItem,
	Modal,
	Notice,
	Spinner,
	Tooltip,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import {
	DataViews,
	filterSortAndPaginate,
	type Action,
	type Field,
	type View,
} from '@wordpress/dataviews';
import {
	Icon,
	check,
	group,
	home,
	page,
	pencil,
	people,
	plus,
	settings,
	starFilled,
	trash,
	wordpress,
} from '@wordpress/icons';
import { useEffect, useMemo, useState } from '@wordpress/element';
import type { FrappeListQuery, FrappeResource } from 'wp-frappe-data-store';
import {
	createFrappeRequest,
	getListKey,
	loadDocTypeDefinition,
	useDocTypeDefinition,
	useFrappeResourceActions,
	useFrappeResourceList,
} from 'wp-frappe-data-store';
import {
	getConnectionHeaders,
	getFrappeSiteUrl,
	validateFrappeConnection,
} from './auth';
import { ConnectionScreen } from './ConnectionScreen';
import { ConnectionModal } from './ConnectionModal';
import {
	DOC_TYPE_SHELLS,
	type DocTypeDefinition,
	type DocTypeShell,
	type ResourceFieldDefinition,
} from './doctypes';
import { ResourceEditor } from './ResourceEditor';
import { frappeStore } from './store';

function initialView(definition?: DocTypeDefinition): View {
	const visibleFields = definition
		? definition.fields
			.filter((field) => field.id !== definition.titleField && field.id !== 'owner')
			.slice(0, 5)
			.map((field) => field.id)
		: [];
	return {
		type: 'table',
		page: 1,
		perPage: 10,
		fields: visibleFields,
		titleField: definition?.titleField ?? 'name',
		showTitle: true,
		layout: { density: 'balanced', enableMoving: true },
	};
}

function fieldType(field: ResourceFieldDefinition): Field<FrappeResource>['type'] {
	if (field.type === 'checkbox') return 'boolean';
	if (field.type === 'date') return 'date';
	if (field.type === 'datetime') return 'datetime';
	if (field.type === 'number') return 'number';
	return 'text';
}

function makeFields(definition: DocTypeDefinition): Field<FrappeResource>[] {
	return definition.fields.map((field) => ({
		id: field.id,
		label: field.label,
		type: fieldType(field),
		readOnly: field.readOnly,
		enableSorting: true,
		enableGlobalSearch: field.type !== 'textarea',
		enableHiding: field.id !== definition.titleField,
		filterBy: field.type === 'textarea' ? false : {},
		elements: field.options?.map((option) => ({
			value: option,
			label: option,
		})),
		getValue: ({ item }) => item[field.id],
	}));
}

function errorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	return typeof error === 'string' ? error : 'The request could not be completed.';
}

const SIDEBAR_ICONS = {
	leads: group,
	deals: starFilled,
	contacts: people,
	organizations: home,
	notes: page,
	tasks: check,
};

function ResourceDesk({ onDisconnected }: { onDisconnected: () => void }) {
	const [selectedShell, setSelectedShell] = useState<DocTypeShell>(
		DOC_TYPE_SHELLS[0]!
	);
	const { docTypeDefinition: definition } = useDocTypeDefinition(
		frappeStore,
		selectedShell.name
	);
	const [isDefinitionResolving, setDefinitionResolving] = useState(false);
	const [definitionError, setDefinitionError] = useState<unknown>();
	const [view, setView] = useState<View>(() => initialView());
	const [selection, setSelection] = useState<string[]>([]);
	const [showConnection, setShowConnection] = useState(false);
	const [showCreate, setShowCreate] = useState(false);
	const [notice, setNotice] = useState<string>();
	const [actionError, setActionError] = useState<string>();
	const [isDeleting, setDeleting] = useState(false);
	const [visibleResources, setVisibleResources] = useState<FrappeResource[] | undefined>();
	const metadataRequest = useMemo(
		() =>
			createFrappeRequest({
				baseUrl: '/frappe-api',
				headers: getConnectionHeaders,
				credentials: 'include',
			}),
		[]
	);
	const [pendingDeletion, setPendingDeletion] = useState<{
		items: FrappeResource[];
		doctype: string;
		onActionPerformed?: (items: FrappeResource[]) => void;
	}>();

	useEffect(() => {
		let isMounted = true;
		setDefinitionResolving(true);
		setDefinitionError(undefined);

		loadDocTypeDefinition(metadataRequest, selectedShell.name)
			.catch((error) => {
				if (isMounted) {
					setDefinitionError(error);
				}
			})
			.finally(() => {
				if (isMounted) {
					setDefinitionResolving(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [metadataRequest, selectedShell.name]);

	useEffect(() => {
		if (definition) {
			setView(initialView(definition));
		} else {
			setView(initialView());
		}
		setSelection([]);
		setNotice(undefined);
		setActionError(undefined);
	}, [definition]);

	const fields = useMemo(
		() => (definition ? makeFields(definition) : []),
		[definition]
	);

	const listQuery = useMemo<FrappeListQuery>(() => {
		const fields = definition?.fields.map((field) => field.id) ?? ['name'];
		return {
			fields,
			limit: 100,
			orderBy: 'modified desc',
		};
	}, [definition]);

	const currentListKey = useMemo(
		() => getListKey(selectedShell.name, listQuery),
		[selectedShell.name, listQuery]
	);

	const {
		deleteResource,
		fetchResourceList,
		invalidateResourceLists,
		saveResource,
	} = useFrappeResourceActions(frappeStore);

	const { resources, isResolving, error } = useFrappeResourceList(
		frappeStore,
		selectedShell.name,
		listQuery
	);

	useEffect(() => {
		setVisibleResources(undefined);
	}, [currentListKey]);

	useEffect(() => {
		if (resources) {
			setVisibleResources(resources);
		}
	}, [resources]);

	useEffect(() => {
		fetchResourceList(selectedShell.name, listQuery).catch(() => {});
	}, [fetchResourceList, listQuery, selectedShell.name]);

	const displayedResources = resources ?? visibleResources;
	const placeholderResources =
		(isResolving || isDefinitionResolving) && !(displayedResources?.length)
			? Array.from({ length: 6 }).map((_, index) => ({
				name: `placeholder-${selectedShell.name}-${index}`,
			}))
			: undefined;
	const processed = useMemo(
		() => filterSortAndPaginate((displayedResources || placeholderResources) ?? [], view, fields),
		[displayedResources, placeholderResources, view, fields]
	);

	async function refresh() {
		setNotice(undefined);
		setActionError(undefined);
		const doctype = definition?.name ?? selectedShell.name;
		await Promise.resolve(invalidateResourceLists(doctype));
		await fetchResourceList(doctype, listQuery);
	}

	async function confirmDeletion() {
		if (!pendingDeletion) return;
		setDeleting(true);
		setActionError(undefined);
		try {
			await Promise.all(
				pendingDeletion.items.map((item) =>
					deleteResource(pendingDeletion.doctype, item.name)
				)
			);
			setSelection([]);
			setNotice(
				`${pendingDeletion.items.length} record${pendingDeletion.items.length === 1 ? '' : 's'} deleted.`
			);
			pendingDeletion.onActionPerformed?.(pendingDeletion.items);
		} catch (deleteError) {
			setActionError(errorMessage(deleteError));
		} finally {
			setDeleting(false);
			setPendingDeletion(undefined);
		}
	}

const actions = useMemo<Action<FrappeResource>[]>(() => {
		if (!definition) {
			return [];
		}

		return [
			{
				id: 'edit',
				label: 'Edit',
				icon: pencil,
				isPrimary: true,
				supportsBulk: false,
				modalHeader: (items) =>
					`Edit ${definition.name} ${String(items[0]?.name || '')}`,
				RenderModal: ({ items, closeModal, onActionPerformed }) => (
					<ResourceEditor
						definition={definition}
						item={items[0]}
						onCancel={() => closeModal?.()}
						onSubmit={async (values) => {
						await saveResource(definition.name, {
							...values,
							name: items[0]?.name,
						});
						setNotice(`${definition.name} saved.`);
						onActionPerformed?.(items);
						closeModal?.();
					}}
					/>
				),
			},
			{
				id: 'delete',
				label: (items) => (items.length > 1 ? 'Delete records' : 'Delete'),
				icon: trash,
				isDestructive: true,
				supportsBulk: true,
				callback: (items, { onActionPerformed }) => {
					setPendingDeletion({
						items,
						doctype: definition.name,
						onActionPerformed,
					});
				},
			},
		];
	}, [definition, saveResource]);

	return (
		<div className="frappe-app-shell">
			<aside className="frappe-sidebar">
				<div className="frappe-brand">
					<Icon icon={wordpress} size={32} />
					<strong>WP Frappe</strong>
				</div>
				<nav className="frappe-sidebar-nav" aria-label="CRM resources">
					{DOC_TYPE_SHELLS.map((docType) => {
						const isActive = docType.name === selectedShell.name;
						return (
							<Button
								key={docType.name}
								icon={SIDEBAR_ICONS[docType.icon as keyof typeof SIDEBAR_ICONS]}
								iconSize={20}
								className={`frappe-doctype${isActive ? ' active' : ''}`}
								aria-current={isActive ? 'page' : undefined}
								onClick={() => setSelectedShell(docType)}
							>
								{docType.label}
							</Button>
						);
					})}
				</nav>
				<div className="frappe-sidebar-footer">
					<span
						className="frappe-sidebar-status"
						title={getFrappeSiteUrl()}
					>
						<span className="frappe-status-dot" />
						<span className="frappe-site-label">
							{new URL(getFrappeSiteUrl()).host}
						</span>
					</span>
					<Tooltip text="Connection settings">
						<Button
							icon={settings}
							iconSize={20}
							label="Connection settings"
							className="frappe-sidebar-settings"
							onClick={() => setShowConnection(true)}
						/>
					</Tooltip>
				</div>
			</aside>

			<div className="frappe-main-frame">
				<header className="frappe-topbar">
					<Flex align="center" gap={3}>
						<FlexBlock>
								<h1>
									{selectedShell.label}
									{(isResolving || isDefinitionResolving) && (
										<span style={{ marginLeft: 12, fontSize: '0.85em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
											<Spinner />
											Loading
										</span>
									)}
								</h1>
							</FlexBlock>
						<FlexItem>
							<Button
								icon={plus}
								variant="primary"
								onClick={() => setShowCreate(true)}
								disabled={!definition}
							>
								Add {selectedShell.label.replace(/s$/, '')}
							</Button>
						</FlexItem>
					</Flex>
				</header>
				<main className="frappe-main">
					{Boolean(definitionError) && (
						<Notice status="error" isDismissible={false}>
							<strong>Couldn’t load {selectedShell.label.toLowerCase()} metadata.</strong>{' '}
							{errorMessage(definitionError)}{' '}
							<Button variant="link" onClick={() => setShowConnection(true)}>
								Reconnect to Frappe
							</Button>
						</Notice>
					)}
					{Boolean(error) && (
						<Notice status="error" isDismissible={false}>
							<strong>Couldn’t load {selectedShell.label.toLowerCase()}.</strong>{' '}
							{errorMessage(error)}{' '}
							<Button variant="link" onClick={() => setShowConnection(true)}>
								Connect to Frappe
							</Button>
						</Notice>
					)}
					{notice && (
						<Notice status="success" onRemove={() => setNotice(undefined)}>
							{notice}
						</Notice>
					)}
					{actionError && (
						<Notice status="error" onRemove={() => setActionError(undefined)}>
							{actionError}
						</Notice>
					)}

					<section className="frappe-data-card" aria-label={`${selectedShell.label.toLowerCase()} data`}>
						<DataViews<FrappeResource>
							view={view}
							onChangeView={setView}
							fields={fields}
							data={processed.data}
							getItemId={(item) => item.name}
							isLoading={isResolving || isDefinitionResolving}
							paginationInfo={processed.paginationInfo}
							selection={selection}
							onChangeSelection={setSelection}
							actions={actions}
							search
							searchLabel={`Search ${selectedShell.label.toLowerCase()}`}
							defaultLayouts={{
								table: {},
								grid: { layout: { density: 'comfortable' } },
								list: {},
							}}
							config={{ perPageSizes: [10, 20, 50, 100] }}
							empty={
								<div className="frappe-empty-state">
									<div className="frappe-empty-icon">
										<Icon icon={plus} size={24} />
									</div>
									<h2>No {selectedShell.label.toLowerCase()} found</h2>
									<p>Create a record or adjust the active filters.</p>
								</div>
							}
						/>
						{isResolving && !resources && (
							<div className="frappe-loading-overlay">
								<Spinner />
								<span>Loading {selectedShell.label.toLowerCase()}…</span>
							</div>
						)}
					</section>
				</main>
			</div>

			{showConnection && (
				<ConnectionModal
					onClose={() => setShowConnection(false)}
					onAuthenticated={refresh}
					onDisconnected={onDisconnected}
				/>
			)}
			<ConfirmDialog
				isOpen={Boolean(pendingDeletion)}
				isBusy={isDeleting}
				confirmButtonText="Delete"
				onConfirm={() => void confirmDeletion()}
				onCancel={() => setPendingDeletion(undefined)}
			>
				Delete {pendingDeletion?.items.length ?? 0}{' '}
				{pendingDeletion?.doctype ?? 'record'}
				{pendingDeletion?.items.length === 1 ? '' : ' records'}?{' '}
				<strong>This action cannot be undone.</strong>
			</ConfirmDialog>
			{showCreate && definition && (
				<Modal
					title={`Create ${definition.name}`}
					onRequestClose={() => setShowCreate(false)}
				>
					<ResourceEditor
						definition={definition}
						onCancel={() => setShowCreate(false)}
						onSubmit={async (values) => {
							await saveResource(definition.name, values);
							setShowCreate(false);
							setNotice(`${definition.name} created.`);
						}}
					/>
				</Modal>
			)}
		</div>
	);
}

type ConnectionState = 'checking' | 'connected' | 'disconnected';

export default function App() {
	const [connectionState, setConnectionState] =
		useState<ConnectionState>('checking');

	useEffect(() => {
		let isCurrent = true;
		void validateFrappeConnection().then(
			() => {
				if (isCurrent) setConnectionState('connected');
			},
			() => {
				if (isCurrent) setConnectionState('disconnected');
			}
		);
		return () => {
			isCurrent = false;
		};
	}, []);

	if (connectionState === 'checking') {
		return <ConnectionScreen isChecking />;
	}
	if (connectionState === 'disconnected') {
		return (
			<ConnectionScreen
				isChecking={false}
				onAuthenticated={() => setConnectionState('connected')}
			/>
		);
	}
	return (
		<ResourceDesk onDisconnected={() => setConnectionState('disconnected')} />
	);
}
