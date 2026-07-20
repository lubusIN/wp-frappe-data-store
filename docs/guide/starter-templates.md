# Standalone Starter Templates

Two standalone starter repositories demonstrate `@lubusin/wp-frappe-data-store` in actual application structures. Each repository can be cloned or used directly via GitHub template generation.

## 1. WordPress Plugin

The **WordPress Plugin Starter Template** ([`wpui-frappe-plugin-starter`](https://github.com/lubusIN/wpui-frappe-plugin-starter)) demonstrates how to integrate `@lubusin/wp-frappe-data-store` inside the WordPress admin panel.

### Architectural Features:
- **Admin Interface (`@wordpress/boot`)**: Built with `@wordpress/boot` to render a native, full-page WordPress admin application without custom layout shells. It features native sidebar navigation and leverages `@wordpress/dataviews` for lists, grids, and DataForm integration.
- **Next-Generation Build Tooling (`@wordpress/build`)**: Uses npm workspaces (`packages/` and `routes/`) to automatically compile TypeScript and SCSS. It outputs `build/build.php` and `build/pages.php` for seamless server-side asset loading.
- **Server-Side REST API Proxy**: Proxies cross-origin API calls to Frappe through a custom WordPress REST API endpoint (`/wp-json/wpui-frappe/v1/connection/proxy`) using `wp_remote_request()`. This prevents browser CORS restrictions when the plugin runs inside the WordPress admin.
- **WordPress Playground Setup**: Run `npm run playground` from the root directory to boot an isolated WordPress Playground instance with the plugin pre-activated, requiring no local database or PHP installation.

### Advanced Configuration

#### Production Connection

Keep Frappe credentials out of browser storage or WordPress database by defining them securely in your `wp-config.php`:

```php
define( 'WPUI_FRAPPE_SITE_URL', 'https://crm.example.com' );
define( 'WPUI_FRAPPE_API_TOKEN', 'API_KEY:API_SECRET' );
```

Use a dedicated, least-privilege Frappe user for these tokens. Administrators may alternatively save the origin and API token through the plugin's Connection screen; the values remain server-side and are never returned by the REST API.

#### Local Development Flags

Local or private network origins are rejected by default for security. For local development only, you can opt in to such origins by defining flags in `wp-config.php`:

```php
define( 'WPUI_FRAPPE_ALLOW_LOCAL', true );
define( 'WPUI_FRAPPE_ALLOW_INSECURE_TLS', true );
```

The included local Playground blueprint enables both flags so self-signed origins such as `https://frappe.localhost` work during development.

#### Quality and Release

To check and build the plugin for production:

```bash
npm run check       # TypeScript, PHP syntax, and production build
npm run plugin-zip  # Create an installable release archive (wpui-frappe.zip)
```


## 2. Standalone App

The **WordPress DataViews App Starter Template** ([`wpui-frappe-app-starter`](https://github.com/lubusIN/wpui-frappe-app-starter)) is a standalone single-page application connected to Frappe CRM.

### Architectural Features:
- **WordPress-Style App Shell**: Uses `@wordpress/components` and `@wordpress/dataviews` to render data tables and record inspectors outside of a WordPress installation.
- **DocType Form Generation**: Loads DocType metadata dynamically from Frappe (`useDocTypeDefinition`) to generate form fields, placeholders, required validations, and option lists.
- **Vite Local Proxying**: Includes a local proxy server that rewrites HTTPS-only Frappe cookies and `X-Frappe-Site-URL` headers for local HTTP origins during development.
- **Vitest & TypeScript**: Comes configured with unit tests and static typing.

### Advanced Configuration & Deployment

#### Default Frappe URL

The standalone app uses an interactive connection screen. The connection screen defaults to `https://frappe.localhost`. 

To change the prefilled fallback during local development, copy the `.env.example` file to `.env.local` and set `VITE_FRAPPE_TARGET`:

```dotenv
VITE_FRAPPE_TARGET=https://my-frappe-site.localhost
```

#### Authentication Options

The app supports two authentication methods for connecting to Frappe:

1. **Password Session**: Best for local development with an interactive Frappe account. The password is sent once to Frappe's `/api/method/login` endpoint and never persisted. The resulting HTTP-only session cookie handles authentication through the Vite proxy.
2. **API Token**: Ideal for headless integration. Generate an API Key and Secret in the Frappe Desk under a User's "API Access" section. The token is sent in the `Authorization: token API_KEY:API_SECRET` header. It is strictly stored in the browser's volatile `sessionStorage`.

#### Required Frappe Permissions

Authentication does not bypass Frappe permissions. The selected Frappe user needs these permissions for each DocType:
- **Read** to display records.
- **Create** to add records.
- **Write** to edit records.
- **Delete** to delete records.

A user may be able to browse Leads while receiving a permission error for Tasks if their Frappe CRM roles differ.

#### Cloudflare Pages Edge Deployment

To host a live demo of the React app on [Cloudflare Pages](https://pages.cloudflare.com/), the repository includes two pre-configured deployment files:

- [`public/_redirects`](https://github.com/lubusIN/wpui-frappe-app-starter/blob/main/public/_redirects): Explicitly passes through `/assets/*` and static assets before applying the SPA routing fallback (`/* / 200`).
- [`public/_routes.json`](https://github.com/lubusIN/wpui-frappe-app-starter/blob/main/public/_routes.json): Ensures Cloudflare Pages edge functions only invoke on `/frappe-api/*` and exclude `/assets/*`.
- [`functions/frappe-api/[[path]].ts`](https://github.com/lubusIN/wpui-frappe-app-starter/blob/main/functions/frappe-api/%5B%5Bpath%5D%5D.ts): A Cloudflare Pages edge proxy that automatically intercepts `/frappe-api/*` requests and securely routes them to your Frappe backend without CORS restrictions.

**Cloudflare Setup Steps**:
1. In the **Cloudflare Dashboard**, navigate to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Select your repository and configure the build settings for `wpui-frappe-app-starter`:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. *(Optional)* In **Environment variables**, set `FRAPPE_TARGET` to your default fallback Frappe CRM origin (e.g., `https://demo-crm.example.com`).
4. Select **Save and Deploy**. 

#### Troubleshooting

- **"PermissionError" or "Insufficient Permission"**: The request reached Frappe, but the current user cannot read or modify that DocType.
- **Requests still run as Guest**: Ensure `npm run dev` is running (the session-cookie flow depends on the Vite proxy). If using an API token, confirm that both values belong to the same enabled Frappe user.
- **The Frappe site URL does not work**: Enter the complete site origin (e.g. `https://frappe.localhost`), including the protocol and any port. Do not include a path.
