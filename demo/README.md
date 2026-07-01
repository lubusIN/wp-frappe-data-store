# Frappe CRM DataViews demo

This standalone React app demonstrates `wp-frappe-data-store` in a WordPress/FSE-style application shell. It uses WordPress [`DataViews`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/) for resource lists and `DataForm` for record editing. It connects to Frappe CRM and can browse, search, filter, create, edit, bulk-select, and delete its core records. The demo editor form is metadata-driven and can render labels, types, descriptions, and placeholders from the target DocType metadata.

The connection screen defaults to `https://frappe.localhost` and accepts another Frappe site origin.

## Requirements

- Node.js 18 or newer.
- A running Frappe site with the CRM app installed, reachable at `https://frappe.localhost`.
- A Frappe user with the appropriate DocType permissions.

The left sidebar mirrors Frappe CRM's primary data navigation from Leads through Tasks. It maps to `CRM Lead`, `CRM Deal`, `Contact`, `CRM Organization`, `FCRM Note`, and `CRM Task`. CRM Tasks and Notes expose `reference_doctype` and `reference_docname` so they can be linked to leads, deals, contacts, or organizations.

## Start the demo

From the repository root:

```sh
npm install
npm run demo
```

Then open [http://127.0.0.1:5180](http://127.0.0.1:5180).

The demo intentionally uses port `5180` because the Frappe Local desktop app may already use Vite's default port `5173`.

The Vite development server proxies `/frappe-api/*` to the site selected on the connection screen. This avoids browser CORS restrictions and accepts locally generated HTTPS certificates. The browser never connects directly to the Frappe origin.

## Default Frappe URL

Enter the desired site origin on the connection screen, for example `https://crm.example.test`. The selected origin is stored in browser `sessionStorage` and disappears when the browser session closes.

To change the prefilled fallback, copy the example environment file:

```sh
cp demo/.env.example demo/.env.local
```

Then update the target:

```dotenv
VITE_FRAPPE_TARGET=https://my-frappe-site.localhost
```

Restart `npm run demo` after changing the fallback. Do not add usernames, passwords, API keys, or API secrets to this file.

## Provide credentials

On startup, the demo validates the saved session or API token. If it is missing or invalid, the resource shell stays hidden and a connection screen requests the Frappe site URL and credentials. The connection screen supports two authentication methods.

### Password session

1. Enter the Frappe site URL.
2. Select **Password**.
3. Enter the Frappe username, such as `Administrator`.
4. Enter the user's password and select **Connect**.

The password is sent once to Frappe's standard `/api/method/login` endpoint. It is not written to local storage or session storage. Frappe returns an HTTP-only session cookie, which the browser sends through the development proxy on later requests.

Use this option when developing locally with an interactive Frappe account.

### API token

First create an API key and secret in Frappe:

1. Sign in to the Frappe Desk.
2. Open the **User** record that the demo should use.
3. Find the **API Access** section.
4. Select **Generate Keys**.
5. Copy the API key and the generated API secret. Frappe normally shows the secret only once.

Then return to the demo:

1. Enter the Frappe site URL.
2. Select **API token**.
3. Paste the API key and API secret.
4. Select **Connect**.

The demo sends the standard Frappe header:

```text
Authorization: token API_KEY:API_SECRET
```

The combined token is stored only in browser `sessionStorage`. It disappears when the browser session is closed. Select **Disconnect** in the header connection dialog to remove it immediately and log out any password session.

Do not commit API credentials to this repository or expose a privileged token in a production browser bundle.

## Required Frappe permissions

Authentication does not bypass Frappe permissions. The selected user needs these permissions for each DocType they use:

- **Read** to display records.
- **Create** to add records.
- **Write** to edit records.
- **Delete** to delete records.

Grant these through the normal Frappe Role Permission Manager and assign the relevant CRM roles to the user. A user may be able to browse Leads while receiving a permission error for Tasks if their CRM permissions differ.

## Using the demo

- Choose a DocType from the left sidebar.
- Use the DataViews toolbar to search, filter, sort, paginate, change columns, or switch between table, list, and grid layouts.
- Form fields display descriptions and placeholders from the selected DocType's metadata when available.
- Select **Add _DocType_** to create a record.
- Use a row's action menu to edit or delete it.
- Select several rows to perform bulk deletion.
- Select **Refresh** after making changes outside the demo.

The demo requests at most 100 records per DocType and then applies DataViews filtering, sorting, and pagination in the browser. It is intended as a development example, not as an unbounded production listing.

## Production note

The Vite proxy exists only during local development. A production WordPress integration should proxy Frappe requests through a same-origin, authenticated WordPress REST endpoint and keep Frappe API secrets on the server. The datastore's injectable `request` function supports that arrangement.

## Troubleshooting

### “PermissionError” or “Insufficient Permission”

The request reached Frappe, but the current user cannot read or modify that DocType. Connect with another account or update the user's roles and DocType permissions.

### Requests still run as Guest

- Open connection settings and sign in again.
- Confirm that `npm run demo` is running; the session-cookie flow depends on the Vite proxy.
- If using an API token, confirm that both values belong to the same enabled Frappe user.
- Select **Disconnect**, then reconnect using one authentication method.

### A CRM DocType does not exist

Confirm that the Frappe CRM app is installed and migrated on the target site. The definitions in [`src/doctypes.ts`](./src/doctypes.ts) follow CRM's native DocType names rather than ERPNext's legacy CRM records.

### The Frappe site URL does not work

Return to Connection settings and enter the complete site origin, including `http://` or `https://` and any port. Do not include a path, query, credentials, or fragment.

## Validate a change

From the repository root:

```sh
npm run typecheck
npm run demo:build
npm test
```
