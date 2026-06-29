import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, root, 'VITE_');
	const frappeTarget = env.VITE_FRAPPE_TARGET || 'https://frappe.localhost';

	return {
		root,
		plugins: [react()],
		build: {
			outDir: '../demo-dist',
			emptyOutDir: true,
		},
		server: {
			host: '127.0.0.1',
			port: 5180,
			strictPort: true,
			proxy: {
				'/frappe-api': {
					target: frappeTarget,
					changeOrigin: true,
					secure: false,
					cookieDomainRewrite: '',
					rewrite: (path) => path.replace(/^\/frappe-api/, ''),
				},
			},
		},
	};
});
