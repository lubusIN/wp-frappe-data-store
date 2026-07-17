<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('hooks');
</script>

<template>
  <div class="pg-landing">
    <!-- Hero Section -->
    <section class="pg-hero">
      <div class="pg-hero-content">
        <h1 class="pg-hero-title">
          Headless <span class="pg-accent">Frappe</span> <br/>for WordPress
        </h1>
        <p class="pg-hero-tagline">
          Connect Frappe DocTypes to WordPress interfaces with <code>@wordpress/data</code> using React hooks.
        </p>
        <div class="pg-hero-actions">
          <a href="/guide/getting-started" class="pg-btn pg-btn-primary">
            <span>Get Started</span>
            <svg class="lucide lucide-arrow-right" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <a href="/api/" class="pg-btn pg-btn-secondary">API Reference</a>
        </div>
      </div>

      <!-- Clean Code Preview Window -->
      <div class="pg-hero-visual">
        <div class="pg-code-card">
          <div class="pg-code-tabs">
            <button 
              :class="['pg-tab', { active: activeTab === 'hooks' }]" 
              @click="activeTab = 'hooks'">
              CRMDealsTable.tsx
            </button>
            <button 
              :class="['pg-tab', { active: activeTab === 'store' }]" 
              @click="activeTab = 'store'">
              store.ts
            </button>
          </div>
          <div class="pg-code-content">
            <div v-if="activeTab === 'hooks'" class="pg-code-pane">
              <pre><code><span class="keyword">import</span> { useFrappeResourceList } <span class="keyword">from</span> <span class="string">'@lubusin/wp-frappe-data-store'</span>;
<span class="keyword">import</span> { frappeStore } <span class="keyword">from</span> <span class="string">'./store'</span>;

<span class="keyword">export function</span> <span class="function">CRMDealsTable</span>() {
  <span class="keyword">const</span> { resources, isResolving, error } = <span class="function">useFrappeResourceList</span>(
    frappeStore, 
    <span class="string">'CRM Deal'</span>, 
    { fields: [<span class="string">'deal_name'</span>, <span class="string">'status'</span>, <span class="string">'deal_value'</span>], limit: <span class="number">5</span> }
  );

  <span class="keyword">if</span> (isResolving &amp;&amp; !resources) <span class="keyword">return</span> <span class="tag">&lt;div&gt;</span>Loading deals...<span class="tag">&lt;/div&gt;</span>;
  <span class="keyword">if</span> (error) <span class="keyword">return</span> <span class="tag">&lt;div&gt;</span>Failed to fetch deals.<span class="tag">&lt;/div&gt;</span>;

  <span class="keyword">return</span> (
    <span class="tag">&lt;ul</span> <span class="attr">class</span>=<span class="string">"deals-list"</span><span class="tag">&gt;</span>
      {resources?.<span class="function">map</span>((deal) =&gt; (
        <span class="tag">&lt;li</span> <span class="attr">key</span>={deal.deal_name}<span class="tag">&gt;</span>
          <span class="tag">&lt;strong&gt;</span>{deal.deal_name}<span class="tag">&lt;/strong&gt;</span> — ${deal.deal_value}
        <span class="tag">&lt;/li&gt;</span>
      ))}
    <span class="tag">&lt;/ul&gt;</span>
  );
}</code></pre>
            </div>
            <div v-if="activeTab === 'store'" class="pg-code-pane">
              <pre><code><span class="keyword">import</span> { registerFrappeDataStore } <span class="keyword">from</span> <span class="string">'@lubusin/wp-frappe-data-store'</span>;

<span class="keyword">export const</span> frappeStore = <span class="function">registerFrappeDataStore</span>({
  storeName: <span class="string">'my-app/frappe'</span>,
  baseUrl: import.meta.env.DEV ? <span class="string">'/api/frappe-proxy'</span> : <span class="string">'https://crm.example.com'</span>,
  headers: () =&gt; ({
    <span class="string">'Authorization'</span>: <span class="string">`token <span class="variable">${localStorage.getItem('api_key')}</span>:<span class="variable">${localStorage.getItem('api_secret')}</span>`</span>
  }),
});</code></pre>
            </div>
          </div>
        </div>

        <!-- Separate Output Preview Card Outside Code Tabs -->
        <div class="pg-preview-card">
          <div class="pg-preview-header">
            <span>Rendered Preview</span>
          </div>
          <ul class="pg-deals-list">
            <li>
              <div class="pg-deal-info">
                <strong>Acme Cloud Migration</strong>
                <span>Frappe CRM &bull; Deal</span>
              </div>
              <div class="pg-deal-meta">
                <span class="pg-pill pg-pill-open">Open</span>
                <span class="pg-deal-value">$45,000</span>
              </div>
            </li>
            <li>
              <div class="pg-deal-info">
                <strong>Global Retail POS Integration</strong>
                <span>Frappe CRM &bull; Deal</span>
              </div>
              <div class="pg-deal-meta">
                <span class="pg-pill pg-pill-quote">Quotation</span>
                <span class="pg-deal-value">$18,200</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Core Capabilities Grid -->
    <section class="pg-features">
      <div class="pg-feature-grid">
        <!-- Feature 1 -->
        <div class="pg-feature-card">
          <div class="pg-feature-icon">
            <svg class="lucide lucide-database" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
          </div>
          <h3 class="pg-feature-title">Reactive Data Querying</h3>
          <p class="pg-feature-desc">
            <code>useFrappeResourceList</code> and <code>useFrappeResource</code> resolve data synchronously when available in cache while triggering background revalidation.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="pg-feature-card">
          <div class="pg-feature-icon">
            <svg class="lucide lucide-layers" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>
          </div>
          <h3 class="pg-feature-title">@wordpress/data Engine</h3>
          <p class="pg-feature-desc">
            Built on WordPress's Redux state management engine (<code>frappe/resources</code> by default). Shares cached records and deduplicates requests across components.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="pg-feature-card">
          <div class="pg-feature-icon">
            <svg class="lucide lucide-file-code" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>
          </div>
          <h3 class="pg-feature-title">Schema Normalization</h3>
          <p class="pg-feature-desc">
            Inspect metadata with <code>useFrappeDocType</code> to automatically derive structured definitions for form controls, select options, and validation rules.
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="pg-feature-card">
          <div class="pg-feature-icon">
            <svg class="lucide lucide-shield-check" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <h3 class="pg-feature-title">REST Proxy &amp; Multi-Auth</h3>
          <p class="pg-feature-desc">
            Connect via session cookies or route calls through WordPress REST proxy endpoints (`X-WP-Nonce`) to keep API tokens securely on the server.
          </p>
        </div>
      </div>
    </section>

    <!-- Starter Repositories Section -->
    <section class="pg-starters">
      <div class="pg-section-header">
        <h2 class="pg-section-title">Starter Templates</h2>
        <p class="pg-section-desc">
          Reference architectures for building WordPress plugins and standalone web applications with Frappe backend integration.
        </p>
      </div>

      <div class="pg-starters-grid">
        <!-- Starter 1 -->
        <a href="https://github.com/lubusIN/wpui-frappe-plugin-starter" target="_blank" rel="noopener noreferrer" class="pg-starter-card">
          <div class="pg-starter-top">
            <div class="pg-starter-icon">
              <svg class="lucide lucide-box" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            </div>
            <span class="pg-starter-badge">WordPress Plugin</span>
          </div>
          <h3 class="pg-starter-title">wpui-frappe-plugin-starter</h3>
          <p class="pg-starter-desc">
            Admin sidebar navigation across Frappe CRM entities (<code>@wordpress/boot</code>), server-side REST proxying, and instant testing with <strong>WordPress Playground</strong> (<code>npm run playground</code>).
          </p>
          <div class="pg-starter-link">
            <span>View Repository</span>
            <svg class="lucide lucide-external-link" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          </div>
        </a>

        <!-- Starter 2 -->
        <a href="https://github.com/lubusIN/wpui-frappe-app-starter" target="_blank" rel="noopener noreferrer" class="pg-starter-card">
          <div class="pg-starter-top">
            <div class="pg-starter-icon">
              <svg class="lucide lucide-layout" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </div>
            <span class="pg-starter-badge">Single Page App</span>
          </div>
          <h3 class="pg-starter-title">wpui-frappe-app-starter</h3>
          <p class="pg-starter-desc">
            Standalone SPA built with WordPress DataViews (<code>@wordpress/dataviews</code>), dynamic DocType form generation, Vite local development server, and Vitest testing harness.
          </p>
          <div class="pg-starter-link">
            <span>View Repository</span>
            <svg class="lucide lucide-external-link" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          </div>
        </a>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="pg-cta">
      <div class="pg-cta-content">
        <h2>Start using WP Frappe Data Store</h2>
        <p>Install the package via npm and configure your first store.</p>
        <div class="pg-cta-code">
          <slot name="install-code">
            <code>npm install @lubusin/wp-frappe-data-store @wordpress/data react</code>
          </slot>
        </div>
        <div class="pg-cta-actions">
          <a href="/guide/getting-started" class="pg-btn pg-btn-primary">Documentation</a>
          <a href="/guide/react-hooks" class="pg-btn pg-btn-secondary">React Hooks Guide</a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ==========================================================================
   Authentic, Clean Landing Page Styles (Zero AI Smells)
   ========================================================================== */

.pg-landing {
  width: 100%;
  max-width: var(--vp-layout-max-width, 1440px);
  margin: 0 auto;
  padding: 24px 32px 0;
  font-family: var(--vp-font-family-base);
  box-sizing: border-box;
}

/* --- Hero Section --- */
.pg-hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 36px;
  align-items: flex-start;
  padding: 24px 0 48px;
  width: 100%;
}

@media (min-width: 960px) {
  .pg-hero {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 48px;
    padding: 16px 0 64px;
  }
}

.pg-hero-content,
.pg-hero-visual {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.pg-hero-title {
  font-family: var(--vp-font-family-serif, "EB Garamond", Georgia, serif);
  font-size: clamp(40px, 5.5vw, 62px);
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
  margin-bottom: 20px;
}

.pg-hero-title .pg-accent {
  color: #3858e9;
}

.pg-hero-tagline {
  font-size: clamp(17px, 2vw, 19px);
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin-bottom: 32px;
  max-width: 520px;
}

.pg-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.pg-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 2px;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.4;
  text-decoration: none !important;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
}

.pg-btn-primary {
  background-color: #3858e9;
  color: #ffffff !important;
  border: 1px solid #3858e9;
}

.pg-btn-primary:hover {
  background-color: #213fd4;
  border-color: #213fd4;
  color: #ffffff !important;
}

.pg-btn-secondary {
  background-color: transparent;
  color: #3858e9 !important;
  border: 1px solid #3858e9;
}

.pg-btn-secondary:hover {
  background-color: #213fd4;
  border-color: #213fd4;
  color: #ffffff !important;
}

/* --- Clean Code Preview Card --- */
.pg-code-card {
  width: 100%;
  box-sizing: border-box;
  background-color: #1a1919;
  border: 1px solid #40464d;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.2);
}

.pg-code-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 8px 0 8px;
  background-color: #141414;
  border-bottom: 1px solid #40464d;
  align-items: flex-end;
}

.pg-tab {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  box-sizing: border-box;
  background: #1e1e1e;
  border: 1px solid #30363d;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  color: #80848d;
  font-size: 12px;
  font-family: monospace;
  padding: 0 14px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  line-height: 1;
  position: relative;
  bottom: -1px;
}

.pg-tab:hover {
  background: #23282d;
  color: #e5e7eb;
}

.pg-tab.active {
  background-color: #1a1919;
  color: #ffffff;
  font-weight: 600;
  border-color: #40464d;
  border-bottom: 1px solid #1a1919;
}

.pg-code-content {
  padding: 12px;
  color: #e5e7eb;
  font-family: monospace;
  font-size: 13px;
  height: 195px;
  overflow-y: auto;
  overflow-x: auto;
}

.pg-code-pane pre {
  margin: 0;
  padding: 0;
  overflow-x: auto;
  line-height: 1.4;
}

.pg-code-pane .keyword { color: #c792ea; }
.pg-code-pane .function { color: #82aaff; }
.pg-code-pane .string { color: #ecc48d; }
.pg-code-pane .number { color: #f78c6c; }
.pg-code-pane .tag { color: #80cbc4; }
.pg-code-pane .attr { color: #addb67; }

/* --- Separate Code Output Preview Card --- */
.pg-preview-card {
  width: 100%;
  box-sizing: border-box;
  margin-top: 12px;
  background-color: #1a1919;
  border: 1px solid #40464d;
  border-radius: 2px;
  padding: 8px 10px;
  height: auto;
  overflow: hidden;
  box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.2);
}

.pg-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10.5px;
  font-weight: 600;
  color: #979aa1;
  margin-bottom: 5px;
  letter-spacing: 0.02em;
}

.pg-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: #3858e9;
  font-weight: 600;
  background-color: rgba(56, 88, 233, 0.12);
  padding: 1px 6px;
  border-radius: 2px;
}

.pg-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #3858e9;
}

.pg-deals-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pg-deals-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 8px;
  background-color: #1e1e1e;
  border: 1px solid #40464d;
  border-radius: 2px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.pg-deal-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.pg-deal-info strong {
  font-size: 11.5px;
  color: #ffffff;
  font-weight: 600;
}

.pg-deal-info span {
  font-size: 10px;
  color: #80848d;
}

.pg-deal-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pg-pill {
  font-size: 9.5px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 2px;
}

.pg-pill-open {
  background-color: rgba(56, 88, 233, 0.2);
  color: #6883ff;
}

.pg-pill-quote {
  background-color: rgba(0, 208, 132, 0.18);
  color: #00d084;
}

.pg-deal-value {
  font-size: 11.5px;
  font-weight: 700;
  color: #ffffff;
  font-family: monospace;
}

/* --- Features Grid --- */
.pg-features {
  padding: 64px 0;
}

.pg-feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 640px) {
  .pg-feature-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .pg-feature-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.pg-feature-card {
  padding: 24px;
  border: 1px solid transparent;
  border-radius: 2px;
  background-color: var(--vp-c-bg-soft);
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.pg-feature-card:hover {
  border-color: #3858e9;
  transform: translateY(-2px);
  box-shadow: 6px 6px 0px rgba(56, 88, 233, 0.12);
}

.pg-feature-icon {
  width: 42px;
  height: 42px;
  border-radius: 2px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-gutter);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3858e9;
  margin-bottom: 18px;
}

.pg-feature-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

.pg-feature-desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0;
}

/* --- Starter Repositories --- */
.pg-starters {
  padding: 64px 0;
}

.pg-section-header {
  margin-bottom: 36px;
  max-width: 640px;
}

.pg-section-title {
  font-family: var(--vp-font-family-serif, "EB Garamond", Georgia, serif);
  font-size: clamp(32px, 4vw, 44px);
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.pg-section-desc {
  font-size: 16.5px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

.pg-starters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .pg-starters-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.pg-starter-card {
  display: flex;
  flex-direction: column;
  padding: 28px;
  border: 1px solid transparent;
  border-radius: 2px;
  background-color: var(--vp-c-bg-soft);
  text-decoration: none !important;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.pg-starter-card:hover {
  border-color: #3858e9;
  transform: translateY(-2px);
  box-shadow: 6px 6px 0px rgba(56, 88, 233, 0.12);
}

.pg-starter-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.pg-starter-icon {
  width: 44px;
  height: 44px;
  border-radius: 2px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-gutter);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3858e9;
}

.pg-starter-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  padding: 4px 10px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-gutter);
  border-radius: 2px;
}

.pg-starter-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 12px;
  font-family: monospace;
}

.pg-starter-desc {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0 0 24px;
  flex-grow: 1;
}

.pg-starter-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #3858e9;
}

/* --- Call to Action (Playground Blueberry Banner Style) --- */
.pg-cta {
  padding: 64px 0 0;
}

.pg-cta-content {
  background-color: #3858e9;
  border: 1px solid #213fd4;
  border-radius: 2px;
  padding: 60px 24px;
  text-align: center;
  color: #ffffff;
  box-shadow: 6px 6px 0px rgba(33, 63, 212, 0.25);
}

.pg-cta-content h2 {
  font-family: var(--vp-font-family-serif, "EB Garamond", Georgia, serif);
  font-size: clamp(32px, 4vw, 46px);
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.pg-cta-content p {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 28px;
}

.pg-cta-code {
  display: inline-block;
  max-width: 100%;
  margin-bottom: 32px;
  text-align: left;
}

.pg-cta-code code {
  color: #ffffff !important;
  background-color: transparent !important;
  font-family: monospace;
  font-size: 15px !important;
  font-weight: 600 !important;
}

.pg-cta-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.pg-cta-content .pg-btn-primary {
  background-color: #ffffff !important;
  color: #3858e9 !important;
  border: 1px solid #ffffff !important;
}

.pg-cta-content .pg-btn-primary:hover {
  background-color: #eff2ff !important;
  border-color: #eff2ff !important;
  color: #213fd4 !important;
}

.pg-cta-content .pg-btn-secondary {
  background-color: transparent !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.45) !important;
}

.pg-cta-content .pg-btn-secondary:hover {
  background-color: #ffffff !important;
  border-color: #ffffff !important;
  color: #3858e9 !important;
}
</style>

<style>
/* --- Unscoped Global Overrides for HomeLanding --- */
/* Prevents VitePress .vp-doc styles from injecting border-top/border-bottom across headings and sections on the homepage */
.vp-doc .pg-landing h1,
.vp-doc .pg-landing h2,
.vp-doc .pg-landing h3,
.vp-doc .pg-landing h4,
.vp-doc .pg-landing section,
.vp-doc .pg-landing .pg-section-header,
.vp-doc .pg-landing .pg-cta-content h2 {
  border: none !important;
  border-top: none !important;
  border-bottom: none !important;
  margin-top: 0 !important;
  padding-top: 0 !important;
}

/* Ensure install command text inside CTA is crisp white against charcoal background */
.vp-doc .pg-cta-code code {
  color: #ffffff !important;
  background-color: transparent !important;
  font-size: 15px !important;
  font-weight: 600 !important;
}

/* Seamless VitePress Code Component Styling inside CTA Slot */
.vp-doc .pg-cta-code div[class*='language-'] {
  background-color: #1e1e1e !important;
  border: 1px solid #40464d !important;
  border-radius: 2px !important;
  margin: 0 !important;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.3) !important;
}

.vp-doc .pg-cta-code div[class*='language-'] pre,
.vp-doc .pg-cta-code div[class*='language-'] code,
.vp-doc .pg-cta-code div[class*='language-'] code span,
.vp-doc .pg-cta-code div[class*='language-'] span:not(.lang) {
  background-color: transparent !important;
  color: #ffffff !important;
  font-size: 15px !important;
  font-weight: 600 !important;
}

.vp-doc .pg-cta-code div[class*='language-'] span.lang {
  color: rgba(255, 255, 255, 0.65) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
}

.vp-doc .pg-cta-code div[class*='language-'] button.copy {
  border-radius: 2px !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  background-color: #2a2a2a !important;
  color: #ffffff !important;
}

.vp-doc .pg-cta-code div[class*='language-'] button.copy:hover {
  background-color: #383838 !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}

/* Eliminate excessive default VitePress home content bottom spacing */
.VPHome .VPHomeContent {
  padding-bottom: 32px !important;
  margin-bottom: 0 !important;
}
</style>
