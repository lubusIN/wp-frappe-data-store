# Frappe Resource Desk demo

This standalone React app demonstrates `wp-frappe-data-store` with the WordPress [`DataViews`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/) data grid. It can browse, search, filter, create, edit, bulk-select, and delete records from several Frappe DocTypes.

The demo is configured for `https://frappe.localhost` by default.

## Requirements

- Node.js 18 or newer.
- A running Frappe site reachable at `https://frappe.localhost`.
- A Frappe user with the appropriate DocType permissions.

The included presets are Task, ToDo, Note, Contact, Customer, and Issue. Some presets, such as Customer and Issue, require ERPNext or another app that provides those DocTypes.

## Start the demo

From the repository root:

```sh
npm install
npm run demo
```

Then open [http://127.0.0.1:5180](http://127.0.0.1:5180).

The demo intentionally uses port `5180` because the Frappe Local desktop app may already use Vite's default port `5173`.

The Vite development server proxies `/frappe-api/*` to `https://frappe.localhost/*`. This avoids browser CORS restrictions and accepts the locally generated HTTPS certificate. The browser never connects directly to the Frappe origin.

## Use another Frappe URL

Copy the example environment file:

```sh
cp demo/.env.example demo/.env.local
```

Then update the target:

```dotenv
VITE_FRAPPE_TARGET=https://my-frappe-site.localhost
```

Restart `npm run demo` after changing the target. Do not add usernames, passwords, API keys, or API secrets to this file.

## Provide credentials

Open the demo and select the gear button in the upper-right corner. The connection dialog supports two authentication methods.

### Password session

1. Select **Password**.
2. Enter the Frappe username, such as `Administrator`.
3. Enter the user's password and select **Sign in**.

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

1. Open the connection dialog using the gear button.
2. Select **API token**.
3. Paste the API key and API secret.
4. Select **Use token**.

The demo sends the standard Frappe header:

```text
Authorization: token API_KEY:API_SECRET
```

The combined token is stored only in browser `sessionStorage`. It disappears when the browser session is closed. Select **Clear credentials** in the connection dialog to remove it immediately and log out any password session.

Do not commit API credentials to this repository or expose a privileged token in a production browser bundle.

## Required Frappe permissions

Authentication does not bypass Frappe permissions. The selected user needs these permissions for each DocType they use:

- **Read** to display records.
- **Create** to add records.
- **Write** to edit records.
- **Delete** to delete records.

Grant these through the normal Frappe Role Permission Manager and assign the relevant roles to the user. A user may be able to browse one preset, such as ToDo, while receiving a permission error for another, such as Customer.

## Using the demo

- Choose a DocType from the left sidebar.
- Use the DataViews toolbar to search, filter, sort, paginate, change columns, or switch between table, list, and grid layouts.
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
- Select **Clear credentials**, then reconnect using one authentication method.

### A preset DocType does not exist

Customer and Issue are commonly provided by ERPNext. Use a preset installed by your site, or update [`src/doctypes.ts`](./src/doctypes.ts) with definitions for your own DocTypes.

### The Frappe site uses a different hostname

Set `VITE_FRAPPE_TARGET` in `demo/.env.local` and restart the development server. The value must include the protocol, for example `https://frappe.example.test`.

## Validate a change

From the repository root:

```sh
npm run typecheck
npm run demo:build
npm test
```
