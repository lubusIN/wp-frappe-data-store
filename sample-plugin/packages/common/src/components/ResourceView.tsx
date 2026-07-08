import {
	Button,
	Flex,
	FlexBlock,
	FlexItem,
	Modal,
	Notice,
	Spinner,
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
	pencil,
	plus,
	trash,
} from '@wordpress/icons';
import { useEffect, useMemo, useState } from '@wordpress/element';
import type { FrappeListQuery, FrappeResource } from '@lubusin/wp-frappe-data-store';
import {
	getListKey,
	useDocTypeDefinition,
	useFrappeResourceActions,
	useFrappeResourceList,
} from '@lubusin/wp-frappe-data-store';
import { getFrappeSiteUrl, validateFrappeConnection } from '../auth';
import { ConnectionView } from './ConnectionView';
import {
	DOC_TYPE_SHELLS,
	type DocTypeDefinition,
	type ResourceFieldDefinition,
} from '../doctypes';
import { ResourceEditor } from './ResourceEditor';
import { frappeStore } from '../store';
import '../styles.scss';

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
		getValue: ({ item }) => item?.[field.id],
	}));
}

function errorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	return typeof error === 'string' ? error : 'The request could not be completed.';
}

type Props = {
	docType: string;
};

export function ResourceView({ docType }: Props) {
	const [connectionState, setConnectionState] = useState<'checking' | 'connected' | 'disconnected'>('checking');
	const selectedShell = useMemo(
		() => DOC_TYPE_SHELLS.find((shell) => shell.name === docType) ?? { name: docType, label: docType, description: '' },
		[docType]
	);

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
		return <ConnectionView isChecking />;
	}

	if (connectionState === 'disconnected') {
		return (
			<ConnectionView
				isChecking={false}
				onAuthenticated={() => {
					setConnectionState('connected');
				}}
			/>
		);
	}

	// Only mount data-fetching hooks once connection is confirmed.
	return (
		<ConnectedResourceView
			selectedShell={selectedShell}
			onDisconnect={() => setConnectionState('disconnected')}
		/>
	);
}

type ConnectedProps = {
	selectedShell: { name: string; label: string; description: string };
	onDisconnect: () => void;
};

/**
 * Inner component that is only mounted when the Frappe connection has been
 * verified. Keeping all store hooks here ensures that resolvers never fire
 * before auth is established, which previously caused a crash loop.
 */
function ConnectedResourceView({ selectedShell, onDisconnect }: ConnectedProps) {
	const {
		docTypeDefinition: definition,
		isResolving: isDefinitionResolving,
		error: definitionError,
	} = useDocTypeDefinition(frappeStore, selectedShell.name);
	const [view, setView] = useState<View>(() => initialView());
	const [selection, setSelection] = useState<string[]>([]);
	const [showCreate, setShowCreate] = useState(false);
	const [notice, setNotice] = useState<string>();
	const [actionError, setActionError] = useState<string>();
	const [isDeleting, setDeleting] = useState(false);
	const [visibleResources, setVisibleResources] = useState<FrappeResource[] | undefined>();
	const [pendingDeletion, setPendingDeletion] = useState<{
		items: FrappeResource[];
		doctype: string;
		onActionPerformed?: (items: FrappeResource[]) => void;
	}>();

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

	// Eager fetch on mount — connection is already confirmed at this point.
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
					`Edit ${definition?.name ?? ''} ${String(items?.[0]?.name || '')}`,
				RenderModal: ({ items, closeModal, onActionPerformed }) => (
					<ResourceEditor
						definition={definition}
						item={items[0]}
						onCancel={() => closeModal?.()}
						onSubmit={async (values) => {
							await saveResource(definition?.name ?? '', {
								...values,
								name: items?.[0]?.name,
							});
							setNotice(`${definition?.name ?? 'Record'} saved.`);
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
						doctype: definition?.name ?? '',
						onActionPerformed,
					});
				},
			},
		];
	}, [definition, saveResource]);

	return (
		<div className="frappe-main-frame">
			<header className="frappe-topbar">
				<Flex align="center" gap={3}>
					<FlexBlock>
						<Flex align="center" gap={3}>
							<h1>{selectedShell.label}</h1>
							{(isResolving || isDefinitionResolving) && (
								<span className="frappe-loading-indicator">
									<Spinner />
									Loading
								</span>
							)}
							<span className="frappe-sidebar-status" title={getFrappeSiteUrl()}>
								<span className="frappe-status-dot" />
								<span className="frappe-site-label">
									{new URL(getFrappeSiteUrl()).host}
								</span>
							</span>
						</Flex>
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
						<strong>Couldn't load {selectedShell.label.toLowerCase()} metadata.</strong>{' '}
						{errorMessage(definitionError)}{' '}
						<Button variant="link" onClick={onDisconnect}>
							Reconnect to Frappe
						</Button>
					</Notice>
				)}
				{Boolean(error) && (
					<Notice status="error" isDismissible={false}>
						<strong>Couldn't load {selectedShell.label.toLowerCase()}.</strong>{' '}
						{errorMessage(error)}{' '}
						<Button variant="link" onClick={onDisconnect}>
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
						getItemId={(item) => item?.name ?? ''}
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
					title={`Create ${definition?.name ?? selectedShell.name}`}
					onRequestClose={() => setShowCreate(false)}
				>
					<ResourceEditor
						definition={definition}
						onCancel={() => setShowCreate(false)}
						onSubmit={async (values) => {
							await saveResource(definition?.name ?? selectedShell.name, values);
							setShowCreate(false);
							setNotice(`${definition?.name ?? selectedShell.name} created.`);
						}}
					/>
				</Modal>
			)}
		</div>
	);
}
