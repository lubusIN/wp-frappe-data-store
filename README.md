# WP Frappe Data Store

A reusable [`@wordpress/data`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-data/) store for reading and mutating Frappe DocType resources from WordPress components.

## Standalone DataViews demo

This repository includes a standalone WordPress DataViews app connected to Frappe CRM. Its WordPress-style app shell browses and manages Leads, Deals, Contacts, Organizations, Notes, and Tasks using the app's native DocTypes. The demo also loads DocType metadata dynamically from Frappe, so record forms can surface field descriptions and placeholders when available.

```sh
npm install
npm run build
cd demo
npm install
npm run dev
```

Open `http://127.0.0.1:5180`, enter the Frappe site URL, then sign in with a password session or API key and secret. The resource desk appears only after the connection is validated.

See the [complete demo setup and credentials guide](./demo/README.md) for proxy configuration, permissions, security notes, and troubleshooting.

## Install

```sh
npm install wp-frappe-data-store @wordpress/data
```

## Register a store

Register it once in your plugin application entry point. In production, point `baseUrl` at a same-origin WordPress REST proxy so Frappe credentials remain on the server.

```js
import { registerFrappeDataStore } from 'wp-frappe-data-store';

export const frappeStore = registerFrappeDataStore({
	storeName: 'my-plugin/frappe',
	baseUrl: '/wp-json/my-plugin/v1/frappe',
	apiPath: '/resource',
});
```

For custom authentication, error handling, or proxy response adaptation, inject a request function:

```js
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

export const frappeStore = registerFrappeDataStore({
	request: ({ method, path, query, data, signal }) =>
		apiFetch({ method, path: addQueryArgs(path, query), data, signal }),
});
```

The request function must return standard Frappe payloads (`{ data: ... }`).

## Use from a component

```jsx
import {
	useFrappeResourceActions,
	useFrappeResourceList,
} from 'wp-frappe-data-store';
import { frappeStore } from './store';

export function OpenTasks() {
	const { resources, isResolving, error } = useFrappeResourceList(
		frappeStore,
		'Task',
		{
			fields: ['subject', 'status'],
			filters: [['status', '=', 'Open']],
			orderBy: 'modified desc',
			limit: 20,
		}
	);
	const { saveResource, deleteResource } = useFrappeResourceActions(frappeStore);

	if (isResolving && !resources) return <p>Loading…</p>;
	if (error) return <p>{error.message}</p>;

	return (
		<ul>
			{resources?.map((task) => (
				<li key={task.name}>
					{task.subject}
					<button onClick={() => deleteResource('Task', task.name)}>
						Delete
					</button>
				</li>
			))}
			<button onClick={() => saveResource('Task', { subject: 'New task' })}>
				Add task
			</button>
		</ul>
	);
}
```

Calling `getResource` or `getResourceList` through `useSelect` triggers their resolvers automatically. The package exports `createFrappeDataStore` for custom registries, `createFrappeRequest` for standalone transport setup, and `loadDocTypeDefinition` for retrieving normalized Frappe DocType metadata.

## DocType metadata

The package provides a helper for loading DocType metadata from Frappe and a hook/selector for retrieving cached metadata in React components:

```js
import {
	loadDocTypeDefinition,
	useDocTypeDefinition,
	type DocTypeDefinition,
} from 'wp-frappe-data-store';

// Load and cache definition imperatively via request transport:
const definition = await loadDocTypeDefinition(request, 'CRM Lead');

// Retrieve cached definition reactively inside a component:
function LeadForm() {
	const { docTypeDefinition } = useDocTypeDefinition(frappeStore, 'CRM Lead');
	// ...
}
```

The normalized field metadata is useful for building dynamic editors and list adapters.

## API

- **Store registration & creation**: `registerFrappeDataStore`, `createFrappeDataStore`
- **Hooks**: `useFrappeResource`, `useFrappeResourceList`, `useFrappeResourceActions`, `useDocTypeDefinition`
- **Selectors**: `getResource`, `getResourceList`, `getDocTypeDefinition`, `isRequestPending`, `getRequestError`
- **Actions**: `fetchResource`, `fetchResourceList`, `saveResource`, `deleteResource`, `invalidateResourceLists`
- **Transport & Errors**: `createFrappeRequest`, `FrappeRequestError`
- **Utilities & Helpers**: `loadDocTypeDefinition`, `getListKey`, `getResourceKey`, `toFrappeQuery`
- **TypeScript Types**: `FrappeDataStore`, `FrappeStoreConfig`, `FrappeResource`, `FrappeResourceActions`, `FrappeListQuery`, `FrappeFilter`, `FrappeRequest`, `FrappeRequestOptions`, `FrappeBoundSelectors`, `DocTypeDefinition`, `ResourceFieldDefinition`, `RequestStatus`

List responses are normalized by Frappe's `name` field. When an explicit `fields` list is supplied, the store automatically includes `name`.

## Development

```sh
npm test
npm run typecheck
npm run build
```
