import { describe, it, expect } from 'vitest';
import { renderWithProviders } from './utils.jsx';
import { FlipCard } from '../components/template/cards.jsx';

const photo = { secureUrl: 'https://res.cloudinary.com/x/image/upload/v1/p.jpg', width: 500, height: 900 };

describe('team flip card', () => {
  it('flips to the quote when there is one', () => {
    const { container } = renderWithProviders(<FlipCard lawyer={{ slug: 'a', name: 'A', role: 'Partner', photo, quote: 'We fight for athletes.' }} />);
    expect(container.querySelector('.block-2')).not.toHaveClass('pcn-no-flip');
    expect(container.querySelector('.back blockquote')).toHaveTextContent('We fight for athletes.');
  });

  it('stays on the photo, with no empty back, when there is no quote', () => {
    const { container } = renderWithProviders(<FlipCard lawyer={{ slug: 'a', name: 'A', role: 'Partner', photo, quote: '  ' }} />);
    expect(container.querySelector('.block-2')).toHaveClass('pcn-no-flip');
    expect(container.querySelector('.back')).toBeNull();
    expect(container.querySelector('.front h2')).toHaveTextContent('A');
  });
});
