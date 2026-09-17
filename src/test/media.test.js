import { describe, it, expect } from 'vitest';
import { mediaUrl, mediaSrcSet } from '../lib/media.js';

const MEDIA = {
  secureUrl: 'https://res.cloudinary.com/pkesmajk/image/upload/v1/pcn-sportiva/team.jpg',
  alt: 'The team',
  width: 1600,
  height: 1000,
};

describe('Cloudinary delivery', () => {
  it('requests a modern format and automatic quality', () => {
    const url = mediaUrl(MEDIA, { width: 800 });
    expect(url).toContain('f_auto');
    expect(url).toContain('q_auto');
    expect(url).toContain('w_800');
  });

  it('serves retina screens without a separate asset', () => {
    expect(mediaUrl(MEDIA)).toContain('dpr_auto');
  });

  it('builds a responsive srcset so phones do not download desktop images', () => {
    const srcset = mediaSrcSet(MEDIA);
    expect(srcset).toContain('480w');
    expect(srcset).toContain('1920w');
    // Each entry ends in a width descriptor; the transformation strings
    // themselves contain commas, so count descriptors rather than splitting.
    expect(srcset.match(/\d+w/g)).toHaveLength(4);
  });

  it('leaves a non-Cloudinary URL untouched', () => {
    expect(mediaUrl({ secureUrl: 'https://example.com/a.jpg' })).toBe('https://example.com/a.jpg');
  });

  it('returns nothing for missing media instead of throwing', () => {
    expect(mediaUrl(null)).toBe('');
    expect(mediaSrcSet(undefined)).toBeUndefined();
  });
});

describe('cropping keeps the subject in frame', () => {
  const PORTRAIT = {
    secureUrl: 'https://res.cloudinary.com/pkesmajk/image/upload/v1/portrait.jpg',
    width: 1687,
    height: 2109,
  };

  // Cloudinary crops from the centre by default, which decapitates a person in
  // a portrait photo shown in a landscape tile.
  it('asks Cloudinary to choose the subject when cropping', () => {
    expect(mediaUrl(PORTRAIT, { width: 600, height: 450 })).toContain('g_auto');
  });

  it('can be told to prefer faces, for team photographs', () => {
    const url = mediaUrl(PORTRAIT, { width: 400, height: 480, gravity: 'faces:auto' });
    expect(url).toContain('g_faces:auto');
    expect(url).not.toContain('g_auto,');
  });

  it('adds no gravity when the crop does not discard anything', () => {
    expect(mediaUrl(PORTRAIT, { width: 1200, crop: 'fit' })).not.toContain('g_');
    expect(mediaUrl(PORTRAIT, { width: 1200, crop: 'scale' })).not.toContain('g_');
  });

  // A fixed height across a varying-width srcset gives every candidate a
  // different shape, so the browser picks one and the layout gets another.
  it('keeps one aspect ratio across every srcset candidate', () => {
    const srcset = mediaSrcSet(PORTRAIT, { width: 600, height: 450, crop: 'fill' });
    const ratios = srcset.split(', ').map((entry) => {
      const w = Number(/w_(\d+)/.exec(entry)[1]);
      const h = Number(/h_(\d+)/.exec(entry)[1]);
      return (w / h).toFixed(2);
    });

    expect(ratios).toHaveLength(4);
    expect(new Set(ratios).size, `ratios drifted: ${ratios.join(' ')}`).toBe(1);
    expect(ratios[0]).toBe('1.33');
  });

  it('omits height entirely when none was asked for', () => {
    const srcset = mediaSrcSet(PORTRAIT, { width: 600 });
    expect(srcset).not.toContain('h_');
  });
});

describe('fitted images', () => {
  it('pads to the requested shape instead of cropping', async () => {
    const { mediaUrl } = await import('../lib/media.js');
    const url = mediaUrl({ secureUrl: 'https://res.cloudinary.com/x/image/upload/v1/a.jpg' }, { width: 800, height: 600, crop: 'pad', background: 'auto' });
    expect(url).toContain('w_800,h_600,c_pad,b_auto');
    expect(url).not.toContain('g_auto');
  });
});
