import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import type { IncomingMessage } from 'node:http';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, root, 'VITE_');
	const frappeTarget = env.VITE_FRAPPE_TARGET || 'https://frappe.localhost';
	const siteUrlHeader = 'x-frappe-site-url';

	return {
		root,
		plugins: [react()],
		resolve: {
			// The datastore is installed from the parent directory during local
			// development. Force React-facing imports from that linked package to
			// use the demo's copies so hooks share one React dispatcher.
			dedupe: [
				'react',
				'react-dom',
				'@wordpress/data',
				'@wordpress/element',
			],
		},
		build: {
			outDir: 'dist',
			emptyOutDir: true,
		},
		server: {
			host: '127.0.0.1',
			port: 5180,
			strictPort: true,
			proxy: {
				'/frappe-api': {
					target: frappeTarget,
					router: (request: IncomingMessage) => {
						const header = request.headers[siteUrlHeader];
						const candidate = Array.isArray(header) ? header[0] : header;
						if (!candidate) return frappeTarget;
						try {
							const url = new URL(candidate);
							return ['http:', 'https:'].includes(url.protocol)
								? url.origin
								: frappeTarget;
						} catch {
							return frappeTarget;
						}
					},
					changeOrigin: true,
					secure: false,
					cookieDomainRewrite: '',
					rewrite: (path) => path.replace(/^\/frappe-api/, ''),
					configure: (proxy) => {
						proxy.on('proxyReq', (proxyRequest) => {
							proxyRequest.removeHeader(siteUrlHeader);
						});
					},
				},
			},
		},
	};
});
