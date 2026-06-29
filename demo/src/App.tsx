import {
	Button,
	Modal,
	Notice,
	Spinner,
	Tooltip,
} from '@wordpress/components';
import {
	DataViews,
	filterSortAndPaginate,
	type Action,
	type Field,
	type View,
} from '@wordpress/dataviews';
import { Icon, pencil, plus, settings, trash, update } from '@wordpress/icons';
import { useEffect, useMemo, useState } from 'react';
import type { FrappeListQuery, FrappeResource } from '../../src';
import {
	useFrappeResourceActions,
	useFrappeResourceList,
} from '../../src';
import { hasApiToken } from './auth';
import { ConnectionModal } from './ConnectionModal';
import {
	DOC_TYPES,
	type DocTypeDefinition,
	type ResourceFieldDefinition,
} from './doctypes';
import { ResourceEditor } from './ResourceEditor';
import { frappeStore } from './store';

const LIST_QUERY: FrappeListQuery = {
	fields: ['*'],
	limit: 100,
	orderBy: 'modified desc',
};

function initialView(definition: DocTypeDefinition): View {
	const visibleFields = definition.fields
		.filter((field) => field.id !== definition.titleField && field.id !== 'owner')
		.slice(0, 5)
		.map((field) => field.id);
	return {
		type: 'table',
		page: 1,
		perPage: 10,
		fields: visibleFields,
		titleField: definition.titleField,
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

export default function App() {
	const [definition, setDefinition] = useState(DOC_TYPES[0]!);
	const [view, setView] = useState<View>(() => initialView(DOC_TYPES[0]!));
	const [selection, setSelection] = useState<string[]>([]);
	const [showConnection, setShowConnection] = useState(false);
	const [showCreate, setShowCreate] = useState(false);
	const [notice, setNotice] = useState<string>();
	const fields = useMemo(() => makeFields(definition), [definition]);
	const { resources, isResolving, error } = useFrappeResourceList(
		frappeStore,
		definition.name,
		LIST_QUERY
	);
	const {
		deleteResource,
		fetchResourceList,
		invalidateResourceLists,
		saveResource,
	} = useFrappeResourceActions(frappeStore);

	useEffect(() => {
		setView(initialView(definition));
		setSelection([]);
		setNotice(undefined);
	}, [definition]);

	const processed = useMemo(
		() => filterSortAndPaginate(resources || [], view, fields),
		[resources, view, fields]
	);

	async function refresh() {
		setNotice(undefined);
		await Promise.resolve(invalidateResourceLists(definition.name));
		await fetchResourceList(definition.name, LIST_QUERY);
	}

	const actions = useMemo<Action<FrappeResource>[]>(
		() => [
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
							await saveResource(definition.name, values);
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
					if (
						!window.confirm(
							`Delete ${items.length} ${definition.name}${items.length === 1 ? '' : ' records'}? This cannot be undone.`
						)
					) {
						return;
					}
					void Promise.all(
						items.map((item) => deleteResource(definition.name, item.name))
					).then(() => {
						setSelection([]);
						setNotice(`${items.length} record${items.length === 1 ? '' : 's'} deleted.`);
						onActionPerformed?.(items);
					});
				},
			},
		],
		[definition, deleteResource, saveResource]
	);

	return (
		<div className="frappe-app-shell">
			<header className="frappe-topbar">
				<div className="frappe-brand-mark" aria-hidden="true">
					F
				</div>
				<div className="frappe-brand-copy">
					<strong>Frappe Resource Desk</strong>
					<span>WordPress DataViews demo</span>
				</div>
				<div className="frappe-topbar-spacer" />
				<span className="frappe-endpoint">
					<span className="frappe-status-dot" /> frappe.localhost
				</span>
				<Tooltip text="Connection settings">
					<Button
						icon={settings}
						label="Connection settings"
						onClick={() => setShowConnection(true)}
					/>
				</Tooltip>
			</header>

			<div className="frappe-workspace">
				<aside className="frappe-sidebar">
					<p className="frappe-sidebar-label">DocTypes</p>
					<nav aria-label="Frappe DocTypes">
						{DOC_TYPES.map((docType) => (
							<button
								key={docType.name}
								type="button"
								className={
									docType.name === definition.name
										? 'frappe-doctype active'
										: 'frappe-doctype'
								}
								onClick={() => setDefinition(docType)}
							>
								<span className="frappe-doctype-icon">
									{docType.name.slice(0, 1)}
								</span>
								<span>
									<strong>{docType.label}</strong>
									<small>{docType.description}</small>
								</span>
							</button>
						))}
					</nav>
					<div className="frappe-sidebar-foot">
						<span>{hasApiToken() ? 'API token' : 'Session / guest'}</span>
						<Button variant="link" onClick={() => setShowConnection(true)}>
							Change
						</Button>
					</div>
				</aside>

				<main className="frappe-main">
					<div className="frappe-page-heading">
						<div>
							<p className="frappe-kicker">{definition.name} resources</p>
							<h1>{definition.label}</h1>
							<p>{definition.description}</p>
						</div>
						<div className="frappe-heading-stat">
							<strong>{resources?.length ?? '—'}</strong>
							<span>loaded records</span>
						</div>
					</div>

					{Boolean(error) && (
						<Notice status="error" isDismissible={false}>
							<strong>Couldn’t load {definition.label.toLowerCase()}.</strong>{' '}
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

					<section className="frappe-data-card" aria-label={`${definition.label} data`}>
						<DataViews<FrappeResource>
							view={view}
							onChangeView={setView}
							fields={fields}
							data={processed.data}
							getItemId={(item) => item.name}
							isLoading={isResolving}
							paginationInfo={processed.paginationInfo}
							selection={selection}
							onChangeSelection={setSelection}
							actions={actions}
							search
							searchLabel={`Search ${definition.label.toLowerCase()}`}
							defaultLayouts={{
								table: {},
								grid: { layout: { density: 'comfortable' } },
								list: {},
							}}
							config={{ perPageSizes: [10, 20, 50, 100] }}
							header={
								<div className="frappe-grid-actions">
									<Button
										icon={update}
										variant="secondary"
										onClick={() => void refresh()}
										disabled={isResolving}
									>
										Refresh
									</Button>
									<Button
										icon={plus}
										variant="primary"
										onClick={() => setShowCreate(true)}
									>
										Add {definition.name}
									</Button>
								</div>
							}
							empty={
								<div className="frappe-empty-state">
									<div className="frappe-empty-icon">
										<Icon icon={plus} size={24} />
									</div>
									<h2>No {definition.label.toLowerCase()} found</h2>
									<p>Create a record or adjust the active filters.</p>
								</div>
							}
						/>
						{isResolving && !resources && (
							<div className="frappe-loading-overlay">
								<Spinner />
								<span>Loading {definition.label.toLowerCase()}…</span>
							</div>
						)}
					</section>
				</main>
			</div>

			{showConnection && (
				<ConnectionModal
					onClose={() => setShowConnection(false)}
					onAuthenticated={refresh}
				/>
			)}
			{showCreate && (
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
