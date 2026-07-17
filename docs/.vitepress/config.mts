import { defineConfig } from 'vitepress';
import fs from 'node:fs';
import path from 'node:path';

function getApiItems(subDir: string, filterFn?: (name: string) => boolean) {
  const dirPath = path.resolve(__dirname, '../api', subDir);
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.md') && file !== 'index.md')
    .map(file => file.replace(/\.md$/, ''))
    .filter(name => (filterFn ? filterFn(name) : true))
    .sort()
    .map(name => ({ text: name, link: `/api/${subDir}/${name}` }));
}

export default defineConfig({
  title: 'WP Frappe Data',
  description: 'Reactive WordPress @wordpress/data & React Hooks for Frappe Framework & CRM',
  base: '/',
  lastUpdated: true,
  transformPageData(pageData) {
    if (pageData.relativePath.startsWith('api/')) {
      pageData.frontmatter.editLink = false;
    }
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    editLink: {
      pattern: 'https://github.com/lubusIN/wp-frappe-data-store/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      {
        text: 'Starters',
        items: [
          { text: 'App', link: 'https://github.com/lubusIN/wpui-frappe-app-starter' },
          { text: 'Plugin', link: 'https://github.com/lubusIN/wpui-frappe-plugin-starter' }
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
            { text: 'Overview', link: '/api/' }
          ]
        },
        {
          text: 'React Hooks',
          collapsed: false,
          items: getApiItems('functions', name => name.startsWith('use'))
        },
        {
          text: 'Store & Core Functions',
          collapsed: false,
          items: getApiItems('functions', name => !name.startsWith('use'))
        },
        {
          text: 'Classes',
          collapsed: false,
          items: getApiItems('classes')
        },
        {
          text: 'Type Aliases',
          collapsed: true,
          items: getApiItems('type-aliases')
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
