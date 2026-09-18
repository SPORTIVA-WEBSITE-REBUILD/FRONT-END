import { describe, it, expect } from 'vitest';
import { ServiceCard, PracticeCard } from '../components/template/cards.jsx';
import ServiceIcon, { ICON_SLUGS } from '../components/icons.jsx';
import { renderWithProviders } from './utils.jsx';

const service = (over = {}) => ({
  slug: 'sports-dispute-resolution',
  title: 'Sports Dispute Resolution',
  summary: 'Representation before sports tribunals.',
  ...over,
});

describe('practice-area cards', () => {
  it('renders no image, only a drawn icon', () => {
    // The stadium photograph that used to repeat on every card is gone; the
    // mark is inline SVG, so nothing here should fetch a picture.
    const { container } = renderWithProviders(
      <ServiceCard service={service({ image: { secureUrl: 'https://example.com/stadium.jpg', width: 800, height: 600 } })} />,
    );

    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(container.querySelector('[style*="background-image"]')).toBeNull();
    expect(container.querySelector('.pcn-service__icon')).toBeTruthy();
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('omits the evidence line when the practice area has no published cases', () => {
    const { container } = renderWithProviders(<ServiceCard service={service({ caseCount: 0 })} />);
    // Nothing at all, rather than "0 matters in the record".
    expect(container.querySelector('.pcn-service__evidence')).toBeNull();
    expect(container.textContent).not.toMatch(/0\s+matters/i);

    // Absent is also the right answer when the API sends no count at all.
    const { container: missing } = renderWithProviders(<ServiceCard service={service()} />);
    expect(missing.querySelector('.pcn-service__evidence')).toBeNull();
  });

  it('prints the count when the practice area has published cases', () => {
    const { container } = renderWithProviders(<ServiceCard service={service({ caseCount: 12 })} />);
    expect(container.querySelector('.pcn-service__evidence').textContent).toBe('12 matters in the record');
  });

  it('says "matter" for one and "matters" for more', () => {
    const one = renderWithProviders(<ServiceCard service={service({ caseCount: 1 })} />);
    expect(one.container.querySelector('.pcn-service__evidence').textContent).toBe('1 matter in the record');
  });

  it('makes the whole card the link, with no separate read-more', () => {
    const { container } = renderWithProviders(<ServiceCard service={service()} />);
    const card = container.querySelector('.pcn-service');

    expect(card.tagName).toBe('A');
    expect(card.getAttribute('href')).toBe('/services/sports-dispute-resolution');
    // One link for the card, not a title link plus a read-more link.
    expect(container.querySelectorAll('a')).toHaveLength(1);
    expect(container.querySelector('.pcn-service__more')).toBeNull();
    expect(container.textContent).not.toMatch(/read more/i);
  });

  it('uses the same card on the services page', () => {
    const { container } = renderWithProviders(<PracticeCard service={service()} />);
    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(container.querySelector('.pcn-service').tagName).toBe('A');
  });
});

describe('the practice-area icons', () => {
  it('covers every practice area the firm publishes', () => {
    expect(ICON_SLUGS).toEqual([
      'sports-dispute-resolution',
      'contracts-and-transfers',
      'sports-governance',
      'player-representation',
      'sports-infrastructure-advisory',
      'data-protection-and-technology',
    ]);
  });

  it('draws on one grid, at one stroke, in currentColor with no fill', () => {
    for (const slug of ICON_SLUGS) {
      const { container } = renderWithProviders(<ServiceIcon slug={slug} />);
      const svg = container.querySelector('svg');
      expect(svg.getAttribute('viewBox'), slug).toBe('0 0 24 24');
      expect(svg.getAttribute('stroke-width'), slug).toBe('1.5');
      expect(svg.getAttribute('stroke'), slug).toBe('currentColor');
      expect(svg.getAttribute('fill'), slug).toBe('none');
      expect(svg.getAttribute('stroke-linecap'), slug).toBe('round');
      // 32px at the call site, per the design direction.
      expect(svg.getAttribute('width'), slug).toBe('32');
    }
  });

  it('renders nothing for a practice area added later with no icon', () => {
    const { container } = renderWithProviders(<ServiceIcon slug="something-new" />);
    expect(container.querySelector('svg')).toBeNull();
  });
});
