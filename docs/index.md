---
layout: home
hero:
  name: "WP Frappe Data Store"
  text: "Reactive Frappe Data for WordPress & React"
  tagline: Seamlessly integrate Frappe Framework & Frappe CRM DocTypes into @wordpress/data and React custom hooks.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/
features:
  - title: "@wordpress/data Powered"
    details: Leverages WordPress's Redux-based data management engine with caching, deduplication, and reactive resolution.
  - title: React Hooks
    details: Direct access to useFrappeResourceList, useFrappeResource, and mutations with automatic re-renders.
  - title: DocType Schema Normalization
    details: Inspects Frappe metadata (`DocType`) to provide normalized definitions for form inputs, placeholders, and labels.
  - title: Proxy & Multi-Auth Support
    details: Supports session cookies, API key and secret headers, and WordPress REST API server-side proxy routes.
---

## Why `@lubusin/wp-frappe-data-store`?

When building modern WordPress interfaces (DataViews, Gutenberg blocks, custom admin screens, or standalone SPA plugins) that need to communicate with **Frappe Framework** or **Frappe CRM**, managing state, caching, and async requests can become complex quickly.

`@lubusin/wp-frappe-data-store` bridges this gap by registering a standard `@wordpress/data` store (`wpui-frappe/resources`) and wrapping it in type-safe React hooks.

```tsx
import { useFrappeResourceList } from '@lubusin/wp-frappe-data-store';

export function CRMDealsList() {
  const { records, isResolving, error } = useFrappeResourceList('CRM Deal', {
    fields: ['name', 'deal_name', 'status', 'deal_value'],
    limit_page_length: 20
  });

  if (isResolving && !records) return <p>Loading Deals...</p>;
  if (error) return <p>Error loading deals.</p>;

  return (
    <ul>
      {records?.map((deal) => (
        <li key={deal.name}>{deal.deal_name} (${deal.deal_value})</li>
      ))}
    </ul>
  );
}
```
