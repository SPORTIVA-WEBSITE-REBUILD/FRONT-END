import '@testing-library/jest-dom/vitest';

// jsdom implements neither, and the reveal/scroll hooks call both.
// Mirrors the real API: an entry always carries the element it observed.
// Omitting `target` hid a crash in code that reads entry.target.
global.IntersectionObserver = class {
  constructor(callback) { this.callback = callback; }
  observe(el) { this.callback([{ isIntersecting: true, target: el }]); }
  unobserve() {}
  disconnect() {}
};

window.scrollTo = () => {};

// jsdom has no ResizeObserver either, and AboutBlock's alignment hook
// constructs one on every mount. jsdom's getBoundingClientRect() always
// returns a zero rect, so there is nothing meaningful for it to report
// regardless — this exists so constructing it does not throw.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false, media: query, addEventListener() {}, removeEventListener() {},
  });
}

/**
 * jsdom and Node's fetch disagree about AbortSignal: React Query's signal comes
 * from a different realm, and undici rejects it with
 *   "Expected signal to be an instance of AbortSignal".
 *
 * Browsers have no such split. Stripping the signal here keeps tests exercising
 * the real request path instead of failing on an environment quirk.
 */
const nativeFetch = globalThis.fetch;
globalThis.fetch = (input, init = {}) => {
  const { signal, ...rest } = init || {};
  return nativeFetch(input, rest);
};
