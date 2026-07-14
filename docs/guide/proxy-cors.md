# Proxy & CORS Setup

When building web interfaces (such as single-page Vite applications or WordPress plugins) that communicate with a remote or local Frappe instance, you often encounter two common challenges:

1. **CORS Restrictions**: If your frontend runs on `http://localhost:5180` and Frappe runs on `https://myfrappe.site`, browser security prevents direct cross-origin requests unless CORS headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`) are explicitly configured on the Frappe server.
2. **Secure/SameSite Cookies**: Frappe session cookies (`sid`) are often marked `Secure; SameSite=Lax`. When developing locally over `http://`, the browser will refuse to save or send secure cookies cross-origin.

## The Local Development Proxy Pattern

To solve this during development, we recommend routing API calls through a development proxy that strips secure cookie attributes and sets proper CORS headers or forwards the destination via an `X-Frappe-Site-URL` header.

### Vite Dev Server Proxy Example

If using Vite (`vite.config.ts`), configure a custom proxy middleware:

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api/frappe-proxy': {
        target: 'https://frappe.localhost',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const targetSiteUrl = req.headers['x-frappe-site-url'];
            if (targetSiteUrl && typeof targetSiteUrl === 'string') {
              const parsed = new URL(targetSiteUrl);
              proxyReq.setHeader('host', parsed.host);
              proxyReq.protocol = parsed.protocol;
              proxyReq.host = parsed.host;
            }
          });
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              proxyRes.headers['set-cookie'] = setCookie.map((cookie) =>
                cookie
                  .replace(/;\s*Secure\b/gi, '')
                  .replace(/;\s*SameSite=None\b/gi, '; SameSite=Lax')
              );
            }
          });
        }
      }
    }
  }
});
```

With this configured, point your store's `getRequestUrl` option to `/api/frappe-proxy` during local development:

```ts
registerFrappeDataStore({
  storeName: 'my-app/frappe',
  siteUrl: () => 'https://myfrappe.localhost',
  getRequestUrl: (path) => {
    if (import.meta.env.DEV) {
      return `/api/frappe-proxy?path=${encodeURIComponent(path)}`;
    }
    return `https://myfrappe.localhost${path}`;
  }
});
```

---

## WordPress Server-Side REST Proxy Pattern

For a production WordPress plugin (`wpui-frappe-plugin-starter`), we recommend proxying requests through a server-side WordPress REST API endpoint (`/wp-json/my-plugin/v1/frappe/*`). This ensures:
1. **API Secret Protection**: The browser authenticates securely to WordPress using native nonces (`X-WP-Nonce`) or cookies, while the Frappe URL and API Token (`API_KEY:API_SECRET`) remain safely stored on the server (`wp-config.php`).
2. **Zero CORS Issues**: Because WordPress (`wp_remote_request()`) makes server-to-server requests to Frappe, browser cross-origin policies do not apply.

### 1. Define Server-Side Credentials (`wp-config.php`)

```php
define( 'MY_PLUGIN_FRAPPE_URL', 'https://crm.example.com' );
define( 'MY_PLUGIN_FRAPPE_TOKEN', 'token API_KEY:API_SECRET' );
```

### 2. Register the PHP Proxy Route

In your main plugin PHP code, register an authenticated endpoint that intercepts `/frappe/(?P<path>api/resource(?:/.*)?)`:

```php
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'my-plugin/v1',
			'/frappe/(?P<path>api/resource(?:/.*)?)',
			array(
				'methods'             => array( 'GET', 'POST', 'PUT', 'DELETE' ),
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'callback'            => function ( WP_REST_Request $request ) {
					$path = ltrim( $request['path'], '/' );
					$url  = trailingslashit( MY_PLUGIN_FRAPPE_URL ) . $path;
					$url  = add_query_arg( $request->get_query_params(), $url );

					$response = wp_remote_request(
						$url,
						array(
							'method'  => $request->get_method(),
							'headers' => array(
								'Accept'        => 'application/json',
								'Authorization' => MY_PLUGIN_FRAPPE_TOKEN,
								'Content-Type'  => 'application/json',
							),
							'body'    => $request->get_body(),
							'timeout' => 20,
						)
					);

					if ( is_wp_error( $response ) ) {
						return new WP_Error(
							'frappe_unavailable',
							$response->get_error_message(),
							array( 'status' => 502 )
						);
					}

					$status = wp_remote_retrieve_response_code( $response );
					$body   = json_decode( wp_remote_retrieve_body( $response ), true );

					return new WP_REST_Response( is_array( $body ) ? $body : array(), $status );
				},
			)
		);
	}
);
```

### 3. Expose WordPress REST Nonce to JavaScript

When enqueuing your plugin admin script, pass the nonce using `wp_localize_script`:

```php
wp_localize_script(
	'my-plugin-app',
	'myPluginSettings',
	array(
		'restNonce' => wp_create_nonce( 'wp_rest' ),
	)
);
```

### 4. Configure Store in JavaScript

Finally, register your data store pointing `baseUrl` to the WordPress proxy endpoint (`/wp-json/my-plugin/v1/frappe`) and passing the `X-WP-Nonce` header:

```ts
export const frappeStore = registerFrappeDataStore({
	storeName: 'my-plugin/frappe',
	baseUrl: '/wp-json/my-plugin/v1/frappe',
	apiPath: '/api/resource',
	headers: {
		'X-WP-Nonce': window.myPluginSettings.restNonce,
	},
	credentials: 'same-origin',
});
```

The datastore generates standard `/api/resource/{doctype}/{name}` paths, which are intercepted by WordPress, authenticated against the current user's capabilities, and forwarded directly to Frappe.
