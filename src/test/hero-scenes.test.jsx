import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { TxtRotate } from '../hooks/useAnimations.jsx';

describe('hero typewriter drives the background scenes', () => {
  it('reports each new word as it starts typing, looping back to the first', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const seen = [];
    render(<TxtRotate words={['Ab', 'Cd']} period={1000} onWordChange={(i) => seen.push(i)} />);
    expect(seen).toEqual([0]);

    // Type 2 letters (300ms each), hold 1000ms, delete 2 (150ms each), pause 500ms.
    act(() => { vi.advanceTimersByTime(300 * 2 + 1000 + 150 * 2 + 100); });
    expect(seen).toEqual([0, 1]);

    act(() => { vi.advanceTimersByTime(500 + 300 * 2 + 1000 + 150 * 2 + 100); });
    expect(seen).toEqual([0, 1, 0]);

    vi.useRealTimers();
    vi.restoreAllMocks();
  });
});
