import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { portfolio } from './src/data/portfolio.ts';

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

export default defineConfig(({ command, mode }) => {
  const configured = loadEnv(mode, '.', 'SITE_').SITE_URL;
  let siteUrl = '';
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('SITE_URL must be a public HTTPS URL without credentials, query, or fragment.');
    siteUrl = url.href.replace(/\/$/, '') + '/';
  }
  return {
    // Relative assets work at any directory; CI explicitly supplies the Pages base path.
    base: './',
    plugins: [react(), {
      name: 'portfolio-metadata',
      transformIndexHtml(html) {
        return {
          html: html.replaceAll('__PAGE_TITLE__', escape(`${portfolio.personal.name} — Developer Portfolio`)).replaceAll('__PAGE_DESCRIPTION__', escape(portfolio.personal.intro)),
          tags: [
            ...(siteUrl ? [
              { tag: 'link', attrs: { rel: 'canonical', href: siteUrl }, injectTo: 'head' as const },
              { tag: 'meta', attrs: { property: 'og:url', content: siteUrl }, injectTo: 'head' as const },
            ] : []),
            ...(command === 'build' ? [{
              tag: 'meta',
              attrs: { 'http-equiv': 'Content-Security-Policy', content: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'" },
              injectTo: 'head-prepend' as const,
            }] : []),
          ],
        };
      },
      generateBundle() {
        if (siteUrl) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(siteUrl)}</loc></url></urlset>` });
      },
    }],
  };
});
