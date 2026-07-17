# Standalone Starter Templates

Two standalone starter repositories demonstrate `@lubusin/wp-frappe-data-store` in actual application structures. Each repository can be cloned or used directly via GitHub template generation.

## 1. WordPress Plugin Starter

The **WordPress Plugin Starter Template** ([`wpui-frappe-plugin-starter`](https://github.com/lubusIN/wpui-frappe-plugin-starter)) demonstrates how to integrate `@lubusin/wp-frappe-data-store` inside the WordPress admin panel.

### Architectural Features:
- **Admin Interface**: Built with `@wordpress/boot` for WordPress sidebar navigation across CRM entities (`Leads`, `Deals`, `Contacts`, `Organizations`, `Notes`, `Tasks`).
- **Build Architecture**: Packaged using `@wordpress/build` with npm workspaces (`packages/*` and `routes/*`).
- **Server-Side REST Proxy**: Proxies cross-origin API calls to Frappe through a custom WordPress REST API endpoint (`/wp-json/frappe-data-store/v1/proxy`) using `wp_remote_request()` to prevent browser CORS restrictions and keep credentials server-side.
- **WordPress Playground Setup**: Run `npm run playground` from the root directory to boot an isolated WordPress Playground instance with the plugin pre-activated, requiring no local database or PHP installation.

## 2. Standalone App Starter

The **WordPress DataViews App Starter Template** ([`wpui-frappe-app-starter`](https://github.com/lubusIN/wpui-frappe-app-starter)) is a standalone single-page application connected to Frappe CRM.

### Architectural Features:
- **WordPress-Style App Shell**: Uses `@wordpress/components` and `@wordpress/dataviews` to render data tables and record inspectors outside of a WordPress installation.
- **DocType Form Generation**: Loads DocType metadata dynamically from Frappe (`useDocTypeDefinition`) to generate form fields, placeholders, required validations, and option lists.
- **Vite Local Proxying**: Includes a local proxy server that rewrites HTTPS-only Frappe cookies and `X-Frappe-Site-URL` headers for local HTTP origins during development.
- **Vitest & TypeScript**: Comes configured with unit tests and static typing.
