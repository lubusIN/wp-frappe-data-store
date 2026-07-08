# WP Frappe Data Store - Sample WordPress Plugin

A full-featured WordPress plugin demonstrating how to use `@lubusin/wp-frappe-data-store` to build rich, reactive CRM administration interfaces inside WordPress.

This plugin showcases modern WordPress engineering practices, featuring a full-screen admin application powered by **`@wordpress/boot`** and the next-generation **`@wordpress/build`** tooling.

---

## Features & Architecture

### 1. Full-Screen Admin Application (`@wordpress/boot`)
Instead of building custom admin wrappers or layout shells, this plugin leverages `@wordpress/boot` to render a native, full-page WordPress admin application.
- **Native Sidebar Navigation**: Automatically displays sidebar menu items for CRM entities (Leads, Deals, Contacts, Organizations, Notes, Tasks) and Connection Settings.
- **Reactive DataViews**: Uses `@wordpress/dataviews` to provide table, list, and grid layouts with built-in pagination, sorting, filtering, and bulk selection.
- **DataForm Integration**: Uses `@wordpress/dataviews` DataForm components for creating and editing Frappe resources in modal dialogs.

### 2. Next-Generation Build Tooling (`@wordpress/build`)
Built using the new opinionated WordPress build architecture with npm workspaces:
- **`packages/init/`**: The required initialization module (`@wp-frappe-data-store/init`) that assigns icons and localized titles to sidebar menu items on boot.
- **`packages/common/`**: Shared library containing the Frappe DataStore configuration, authentication management, DocType definitions, and shared React components (`ResourceView`, `ConnectionView`, `ResourceEditor`).
- **`routes/*`**: File-based route modules (`routes/leads/`, `routes/deals/`, etc.) where each directory defines a page route and exports a `stage` React component.
- **Automatic Asset Generation**: `@wordpress/build` automatically compiles TypeScript and SCSS across workspaces and generates `build/build.php` and `build/pages.php` for seamless PHP loading.

### 3. Server-Side REST API Proxy (`class-rest-proxy.php`)
When making requests from the WordPress admin browser window to an external Frappe CRM instance, web browsers enforce Cross-Origin Resource Sharing (CORS) restrictions.
To provide a zero-config experience:
- The plugin registers a custom WordPress REST API namespace: `/wp-json/frappe-data-store/v1/proxy`.
- Browser requests are sent to this local endpoint with WordPress nonce (`X-WP-Nonce`) verification.
- The PHP proxy (`includes/class-rest-proxy.php`) securely forwards the request to the external Frappe server using `wp_remote_request()`, preserving `Authorization` tokens and `X-Frappe-Site-URL` headers.

---

## Quickstart with WordPress Playground

You can instantly test and interact with this plugin locally without installing Docker, MySQL, or a local PHP server! We include a pre-configured WordPress Playground setup.

### Prerequisites
- Node.js (v18+) and npm

### 1. Build & Run Playground
From the repository root directory, run:
```bash
# Build the library and plugin bundle
npm run build:plugin

# Start WordPress Playground server
npm run playground
```

This will:
1. Start a local WordPress instance using `@wp-playground/cli`.
2. Auto-mount `sample-plugin/` directly into `/wordpress/wp-content/plugins/sample-plugin`.
3. Activate the plugin and log you in automatically as `admin`.
4. Open your browser directly to the CRM Dashboard at `/wp-admin/admin.php?page=frappe-data-store`.

### 2. Connect to Frappe
When the app opens:
1. Enter your Frappe CRM site URL (e.g., `https://frappe.localhost` or your live cloud instance).
2. Authenticate using either **Username & Password** or **API Key & Secret**.
3. Once connected, browse, search, filter, create, edit, and delete CRM records directly inside WordPress!

---

## Development & Build Commands

From inside `sample-plugin/`:

```bash
# Install workspace dependencies
npm install

# Build production bundle
npm run build

# Watch mode for development
npm run dev

# Run Playground locally
npm run playground
```
