import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'WP Frappe Data',
  description: 'Reactive WordPress @wordpress/data & React Hooks for Frappe Framework & CRM',
  base: '/',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/' },
      {
        text: 'Starters',
        items: [
          { text: 'App Starter', link: 'https://github.com/lubusIN/wpui-frappe-app-starter' },
          { text: 'Plugin Starter', link: 'https://github.com/lubusIN/wpui-frappe-plugin-starter' }
        ]
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'React Hooks', link: '/guide/react-hooks' },
            { text: 'DocType Metadata', link: '/guide/doctype-metadata' },
            { text: 'Proxy & CORS', link: '/guide/proxy-cors' },
            { text: 'Starter Templates', link: '/guide/starter-templates' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Functions', link: '/api/functions/createFrappeDataStore' },
            { text: 'Classes', link: '/api/classes/FrappeRequestError' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lubusIN/wp-frappe-data-store' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © LUBUS'
    }
  }
});
