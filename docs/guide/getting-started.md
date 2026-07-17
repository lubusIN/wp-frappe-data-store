# Getting Started

`@lubusin/wp-frappe-data-store` provides reactive data management for connecting WordPress or React applications to any Frappe site (such as **Frappe CRM**, **ERPNext**, or custom **Frappe Framework** apps).

## Installation

Install the library using your package manager along with `@wordpress/data` (or `@wordpress/element` if using hooks inside WordPress):

```sh
npm install @lubusin/wp-frappe-data-store @wordpress/data @wordpress/element react
```

## Store Registration

In your application's entry point (`main.tsx` or plugin bootstrapper), register the store before mounting your React tree:

```ts
import { registerFrappeDataStore } from '@lubusin/wp-frappe-data-store';

export const frappeStore = registerFrappeDataStore({
  storeName: 'my-app/frappe',
  baseUrl: import.meta.env.DEV
    ? '/api/frappe-proxy'
    : (localStorage.getItem('frappe_site_url') || 'https://myfrappe.localhost'),
  headers: () => {
    const token = localStorage.getItem('frappe_api_token');
    if (token) {
      return { Authorization: `token ${token}` };
    }
    return {};
  },
  credentials: 'include',
});
```

## Next Steps

Explore the next sections to learn how to interact with your registered store:
- Check out the [React Hooks](./react-hooks.md) guide.
- Learn about [Proxy & CORS](./proxy-cors.md) handling for development.
- Explore our [Starter Templates](./starter-templates.md).
