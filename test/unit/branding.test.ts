import path from 'node:path';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const { renderFile } = createRequire(import.meta.url)('pug');
const baseUrl = 'https://example.org/as';

function render(view: string) {
  return renderFile(path.resolve(`src/views/${view}.pug`), {
    displayName: 'Example & Wallet',
    baseUrl,
    client: { clientName: 'Issuer' },
    params: {},
    uid: 'test',
  });
}

describe('branding views', () => {
  it.each(['index', 'login', 'consent'])(
    'renders the configured name and base-path-aware icons in %s',
    (view) => {
      const html = render(view);
      expect(html).toContain('<title>Example &amp; Wallet');
      expect(html).toContain(`<base href="${baseUrl}/">`);
    },
  );

  it.each(['index', 'login', 'consent', 'pid-callback'])(
    'renders a favicon without a webmanifest in %s',
    (view) => {
      const html = render(view);
      expect(html).toContain('<link rel="icon" href="images/favicon.ico">');
      expect(html).not.toContain('rel="manifest"');
    },
  );

  it('renders the PID callback with a fixed title and no base URL', () => {
    const html = render('pid-callback');
    expect(html).toContain('<title>Completing sign-in…</title>');
    expect(html).not.toContain('<base ');
  });

  it('renders home branding and the wwWallet attribution link', () => {
    const html = render('index');
    expect(html).toContain('<h1 class="home__title">Example &amp; Wallet</h1>');
    expect(html).toContain('Powered by&nbsp');
    expect(html).toContain('href="https://github.com/wwWallet"');
  });

  it('renders the AS logo with an accessible name and an image-error fallback', () => {
    const html = render('consent');
    expect(html).toContain('src="images/logo.png"');
    expect(html).toContain('alt="Example &amp; Wallet logo"');
    expect(html).toContain('onerror="this.hidden=true;this.nextElementSibling.hidden=false"');
    expect(html).toContain('<span hidden>AS</span>');
  });
});
