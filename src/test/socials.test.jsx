import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockApi } from './utils.jsx';
import Footer from '../layout/Footer.jsx';
import SocialIcon, { SUPPORTED_PLATFORMS, hasIcon, resolvePlatform, platformLabel } from '../components/SocialIcon.jsx';

afterEach(() => vi.unstubAllGlobals());

function settingsWith(socials) {
  return {
    data: {
      settings: { siteName: 'PCN Sportiva LP', socials, seoDefaults: {}, contact: {} },
      navigation: { header: [], footer: [] },
    },
  };
}

const renderFooter = (socials) => {
  vi.stubGlobal('fetch', mockApi({ '/settings': settingsWith(socials), '/services': { data: [] } }));
  return renderWithProviders(<Footer />);
};

describe('social icons', () => {
  it('covers every platform the firm asked for', () => {
    for (const p of ['facebook', 'instagram', 'tiktok', 'linkedin', 'twitter']) {
      expect(hasIcon(p), p).toBe(true);
    }
  });

  it('draws an svg for each supported platform', () => {
    for (const p of SUPPORTED_PLATFORMS) {
      const { container, unmount } = renderWithProviders(<SocialIcon platform={p} />);
      const svg = container.querySelector('svg');
      expect(svg, p).toBeTruthy();
      const d = svg.querySelector('path')?.getAttribute('d');
      expect(d, p).toBeTruthy();
      expect(d.length, p).toBeGreaterThan(100);
      unmount();
    }
  });

  it('accepts common alternative spellings', () => {
    expect(resolvePlatform('IG')).toBe('instagram');
    expect(resolvePlatform('Tik-Tok')).toBe('tiktok');
    expect(resolvePlatform('FB')).toBe('facebook');
    expect(resolvePlatform('  LinkedIn  ')).toBe('linkedin');
  });

  it('renders nothing for a platform it cannot draw', () => {
    const { container } = renderWithProviders(<SocialIcon platform="myspace" />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('labels platforms the way people write them', () => {
    expect(platformLabel('tiktok')).toBe('TikTok');
    expect(platformLabel('linkedin')).toBe('LinkedIn');
    expect(platformLabel('youtube')).toBe('YouTube');
  });
});

describe('the footer hides social links that have no URL', () => {
  it('shows an icon for each filled-in link', async () => {
    renderFooter([
      { platform: 'facebook', url: 'https://facebook.com/pcn' },
      { platform: 'instagram', url: 'https://instagram.com/pcn' },
      { platform: 'tiktok', url: 'https://tiktok.com/@pcn' },
      { platform: 'linkedin', url: 'https://linkedin.com/company/pcn' },
      { platform: 'twitter', url: 'https://twitter.com/pcn' },
    ]);

    await waitFor(() => {
      expect(screen.getByLabelText(/ Facebook$/)).toBeInTheDocument();
    });
    for (const name of ['Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'Twitter']) {
      expect(screen.getByLabelText(new RegExp(` ${name}$`)), name).toBeInTheDocument();
    }
  });

  it('omits a platform whose URL is an empty string', async () => {
    renderFooter([
      { platform: 'facebook', url: 'https://facebook.com/pcn' },
      { platform: 'tiktok', url: '' },
      { platform: 'instagram', url: '   ' },
    ]);

    await waitFor(() => expect(screen.getByLabelText(/ Facebook$/)).toBeInTheDocument());
    expect(screen.queryByLabelText(/ TikTok$/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/ Instagram$/)).not.toBeInTheDocument();
  });

  it('renders no social list at all when every URL is empty', async () => {
    const { container } = renderFooter([
      { platform: 'facebook', url: '' },
      { platform: 'tiktok', url: '' },
    ]);

    await waitFor(() => expect(screen.getByText('PCN Sportiva LP')).toBeInTheDocument());
    expect(container.querySelector('.ftco-footer-social')).toBeNull();
  });

  it('renders no social list when the firm has set none', async () => {
    const { container } = renderFooter([]);
    await waitFor(() => expect(screen.getByText('PCN Sportiva LP')).toBeInTheDocument());
    expect(container.querySelector('.ftco-footer-social')).toBeNull();
  });

  it('drops a link whose URL is unsafe', async () => {
    renderFooter([
      { platform: 'facebook', url: 'https://facebook.com/pcn' },
      { platform: 'tiktok', url: 'javascript:alert(1)' },
    ]);

    await waitFor(() => expect(screen.getByLabelText(/ Facebook$/)).toBeInTheDocument());
    expect(screen.queryByLabelText(/ TikTok$/)).not.toBeInTheDocument();
  });

  it('opens social links safely in a new tab', async () => {
    renderFooter([{ platform: 'linkedin', url: 'https://linkedin.com/company/pcn' }]);

    const link = await screen.findByLabelText(/ LinkedIn$/);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('href', 'https://linkedin.com/company/pcn');
  });
});
