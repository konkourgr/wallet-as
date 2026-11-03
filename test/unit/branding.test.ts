import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const { renderFile } = createRequire(import.meta.url)('pug');
const baseUrl = 'https://example.org/as';

function render(view: string, locals = {}) {
  return renderFile(path.resolve(`src/views/${view}.pug`), {
    displayName: 'Example & Wallet',
    baseUrl,
    client: { clientName: 'Issuer' },
    params: {},
    uid: 'test',
    ...locals,
  });
}

describe('branding views', () => {
  it.each(['index', 'login', 'consent', 'pid-callback'])(
    'renders the configured name and base-path-aware icons in %s',
    (view) => {
      const html = render(view);
      expect(html).toContain('<title>Example &amp; Wallet');
      expect(html).toContain(`<base href="${baseUrl}/">`);
      expect(html).toContain('href="images/favicon.ico"');
      expect(html).toContain('href="metadata/site.webmanifest"');
    },
  );

  it('renders home branding and the wwWallet attribution link', () => {
    const html = render('index');
    expect(html).toContain('<h1 class="home__title">Example &amp; Wallet</h1>');
    expect(html).toContain('Powered by');
    expect(html).toContain('href="https://github.com/wwWallet"');
  });

  it('renders the AS logo with an accessible name and an image-error fallback', () => {
    const html = render('consent', { hasLogo: true });
    expect(html).toContain('src="images/logo.png"');
    expect(html).toContain('alt="Example &amp; Wallet logo"');
    expect(html).toContain('this.nextElementSibling.hidden=false');
    expect(html).toContain('<span hidden>AS</span>');
  });

  it('renders AS text when the logo is absent', () => {
    const html = render('consent', { hasLogo: false });
    expect(html).not.toContain('src="images/logo.png"');
    expect(html).toContain('<div class="consent__app-circle"><span>AS</span></div>');
  });

  it('ships all icons referenced by the manifest and templates', () => {
    const manifest = JSON.parse(fs.readFileSync('public/metadata/site.webmanifest', 'utf8'));
    for (const icon of manifest.icons) {
      expect(fs.existsSync(path.resolve('public/metadata', icon.src))).toBe(true);
    }
    for (const icon of ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'logo.png']) {
      expect(fs.existsSync(path.resolve('public/images', icon))).toBe(true);
    }
  });
});
