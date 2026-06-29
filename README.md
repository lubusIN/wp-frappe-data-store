# WP Frappe Data Store

A reusable [`@wordpress/data`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-data/) store for reading and mutating Frappe DocType resources from WordPress components.

## Standalone DataViews demo

This repository includes a standalone WordPress DataViews app for browsing and managing Task, ToDo, Note, Contact, Customer, and Issue records on a local Frappe site.

```sh
npm install
npm run demo
```

Open `http://127.0.0.1:5180`, then use the gear button to sign in with a Frappe password session or API key and secret.

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

Calling `getResource` or `getResourceList` through `useSelect` triggers their resolvers automatically. The package exports `createFrappeDataStore` for custom registries and `createFrappeRequest` for standalone transport setup.

## API

- Selectors: `getResource`, `getResourceList`, `isRequestPending`, `getRequestError`
- Actions: `fetchResource`, `fetchResourceList`, `saveResource`, `deleteResource`, `invalidateResourceLists`
- Hooks: `useFrappeResource`, `useFrappeResourceList`, `useFrappeResourceActions`

List responses are normalized by Frappe's `name` field. When an explicit `fields` list is supplied, the store automatically includes `name`.

## Development

```sh
npm test
npm run typecheck
npm run build
```
