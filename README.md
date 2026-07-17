<p align="center"><img width="180" src=".github/assets/logo.svg"></p>


<img src=".github/assets/banner.png" />

# WP Frappe Data Store

A reactive [`@wordpress/data`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-data/) store and React hooks library for reading, querying, and mutating Frappe DocType resources (**Frappe Framework** & **Frappe CRM**) from WordPress and React applications.


> [!CAUTION]
> Project is currently under active development.

## Install

```sh
npm install @lubusin/wp-frappe-data-store @wordpress/data @wordpress/element react
```

## Quick Reference

### 1. Register the Store

Register the store once in your application entry point (`main.tsx` or plugin bootstrapper):

```ts
import { registerFrappeDataStore } from '@lubusin/wp-frappe-data-store';

export const frappeStore = registerFrappeDataStore({
	storeName: 'my-app/frappe',
	baseUrl: import.meta.env.DEV
		? '/api/frappe-proxy'
		: 'https://myfrappe.example.com',
	headers: () => {
		const token = localStorage.getItem('frappe_api_token');
		return token ? { Authorization: `token ${token}` } : {};
	},
	credentials: 'include',
});
```

> [!TIP]
> For production WordPress plugins, route calls through a WordPress REST API endpoint (`/wp-json/my-plugin/v1/frappe`) using `X-WP-Nonce` to keep your API tokens securely on the server (`wp-config.php`). See the **[WordPress REST Proxy Guide](https://wp-frappe-data.lubus.in/guide/proxy-cors#wordpress-server-side-rest-proxy-pattern)**.

### 2. Query and Mutate with Hooks

Subscribe to list queries, single records, and mutations. Re-renders happen automatically when background fetches resolve or when caches are invalidated:

```tsx
import {
	useFrappeResourceList,
	useFrappeResourceActions,
} from '@lubusin/wp-frappe-data-store';
import { frappeStore } from './store';

export function OpenTasks() {
	const { resources, isResolving, error } = useFrappeResourceList(
		frappeStore,
		'Task',
		{
			fields: ['name', 'subject', 'status'],
			filters: [['status', '=', 'Open']],
			orderBy: 'modified desc',
			limit: 20,
		}
	);
	const { saveResource, deleteResource } = useFrappeResourceActions(frappeStore);

	if (isResolving && !resources) return <p>Loading tasks…</p>;
	if (error) return <p>Error loading tasks: {error.message}</p>;

	return (
		<div>
			<ul>
				{resources?.map((task) => (
					<li key={task.name}>
						{task.subject}
						<button onClick={() => deleteResource('Task', task.name)}>
							Delete
						</button>
					</li>
				))}
			</ul>
			<button
				onClick={() =>
					saveResource('Task', { subject: 'New task', status: 'Open' })
				}
			>
				Add Task
			</button>
		</div>
	);
}
```
### 3. Dynamic Forms via DocType Metadata

Inspect Frappe (`DocType`) field definitions normalized specifically for UI rendering (`label`, `type`, `placeholder`, `required`, `options`):

```tsx
import { useDocTypeDefinition } from '@lubusin/wp-frappe-data-store';
import { frappeStore } from './store';

export function LeadForm() {
	const { docTypeDefinition, isResolving, error } = useDocTypeDefinition(
		frappeStore,
		'CRM Lead'
	);

	if (isResolving && !docTypeDefinition) return <p>Loading schema…</p>;
	if (error || !docTypeDefinition) return null;

	return (
		<form>
			<h3>Create {docTypeDefinition.name}</h3>
			{docTypeDefinition.fields.map((field) => (
				<label key={field.id} style={{ display: 'block', margin: '8px 0' }}>
					{field.label}
					{field.type === 'select' ? (
						<select name={field.id} required={field.required}>
							<option value="">Select option...</option>
							{field.options?.map((opt) => (
								<option key={opt} value={opt}>
									{opt}
								</option>
							))}
						</select>
					) : (
						<input
							type={field.type === 'number' ? 'number' : 'text'}
							name={field.id}
							required={field.required}
							readOnly={field.readOnly}
							placeholder={field.placeholder}
						/>
					)}
				</label>
			))}
		</form>
	);
}
```

See **[DocType Metadata & Forms Guide](https://wp-frappe-data.lubus.in/guide/doctype-metadata)** for detailed normalization rules and usage outside React components.

## Starter Templates

We provide two production-ready open-source starter repositories demonstrating architectural best practices:

| Template | Type | Description |
| :--- | :--- | :--- |
| **[`wpui-frappe-plugin-starter`](https://github.com/lubusIN/wpui-frappe-plugin-starter)** | WordPress Admin Plugin | Full-screen sidebar navigation across Frappe CRM entities (`@wordpress/boot`), server-side REST proxying, and instant **WordPress Playground** testing (`npm run playground`). |
| **[`wpui-frappe-app-starter`](https://github.com/lubusIN/wpui-frappe-app-starter)** | Standalone SPA / DataViews | WordPress-style app shell (`@wordpress/dataviews`), dynamic DocType form generation, Vite local proxying, and Vitest setup. |

For full setup instructions and comparison, check the **[Starter Templates Guide](https://wp-frappe-data.lubus.in/guide/starter-templates)**.

## Documentation & Guides

We have dedicated, comprehensive documentation hosted at **[wp-frappe-data.lubus.in](https://wp-frappe-data.lubus.in/)**:

- **[Getting Started](https://wp-frappe-data.lubus.in/guide/getting-started)**: Setup, configuration, and environment handling
- **[React Hooks Guide](https://wp-frappe-data.lubus.in/guide/react-hooks)**: Detailed examples of list queries, item fetching, and mutations
- **[Proxy & CORS Setup](https://wp-frappe-data.lubus.in/guide/proxy-cors)**: Vite dev proxying and WordPress server-side REST API proxy patterns
- **[DocType Metadata & Forms](https://wp-frappe-data.lubus.in/guide/doctype-metadata)**: Auto-generating UI forms using normalized schema definitions
- **[Starter Templates](https://wp-frappe-data.lubus.in/guide/starter-templates)**: Standalone architectures for WordPress plugins & SPAs
- **[API Reference](https://wp-frappe-data.lubus.in/api/)**: Full TypeScript classes, interfaces, hooks, and selectors

## Development

```sh
npm test
npm run typecheck
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and feature requests, please use the GitHub issue tracker.

## Meet Your Artisans

[LUBUS](https://lubus.in/?utm_source=github&utm_medium=open-source&utm_campaign=wp-frappe-data-store) is a web design agency based in Mumbai.

<a href="https://cal.com/lubus">
<img src="https://raw.githubusercontent.com/lubusIN/.github/refs/heads/main/profile/banner.png" />
</a>

## License

WP Frappe Data Store is open-sourced licensed under the [MIT License](LICENSE).
