import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from '../pages/Home.jsx';
import Record from '../pages/Record.jsx';
import Insights from '../pages/Insights.jsx';
import Careers from '../pages/Careers.jsx';
import About from '../pages/About.jsx';

/**
 * Renders the real pages against the RUNNING API — nothing mocked.
 *
 * This is the check that answers "the dashboard has data but is the site
 * showing it?", which tests with stubbed fetch cannot. It needs the local stack
 * up (see README, Quick start); it is skipped automatically when the API is not
 * reachable so it never fails a CI run that has no server.
 */
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

let apiUp = false;
try {
  const res = await fetch(`${API}/health`);
  apiUp = res.ok;
} catch {
  apiUp = false;
}

/**
 * Settles every query before asserting. Chained waitFor calls proved flaky
 * here: each block on a page resolves its own request, and waitFor would
 * return after the first repaint while later blocks were still in flight.
 */
async function renderSettled(ui, route = '/') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const view = render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );

  await act(async () => { await new Promise((resolve) => { setTimeout(resolve, 2500); }); });

  const failed = queryClient.getQueryCache().getAll().filter((q) => q.state.error);
  if (failed.length) {
    throw new Error(`queries failed: ${failed.map((q) => `${JSON.stringify(q.queryKey)}: ${q.state.error.message}`).join('; ')}`);
  }

  return { ...view, text: view.container.textContent.replace(/\s+/g, ' ').trim() };
}

describe.skipIf(!apiUp)('live pages render real content from the running API', () => {
  it('home shows the firm copy, its services, the case record and the gallery', async () => {
    const { text } = await renderSettled(<Home />);
    console.log(`  HOME     ${text.length} chars`);

    expect(text).toMatch(/boutique sports law practice/i);      // firm copy
    expect(text).toMatch(/Sports Dispute Resolution/);          // services
    expect(text).toMatch(/Secures FIFA DRC Ruling/);            // case record
    expect(text).toMatch(/Pius Ndubuokwu/);                     // team flip cards
    expect(text).toMatch(/Free Consultation/);                  // consultation block
    expect(text.length).toBeGreaterThan(3000);
  }, 20000);

  it('record lists real outcomes and populates its filters', async () => {
    const { text } = await renderSettled(<Record />, '/record');
    console.log(`  RECORD   ${text.length} chars`);

    expect(text).toMatch(/\d+ matters/);
    expect(text).toMatch(/Secures FIFA DRC Ruling/);
    expect(text).toMatch(/All forums/);
  }, 20000);

  it('insights lists real articles with authors and dates', async () => {
    const { text } = await renderSettled(<Insights />, '/insights');
    console.log(`  INSIGHTS ${text.length} chars`);

    // Blog cards: title, date block and the Read more button.
    expect(text).toMatch(/Read more/);
    expect(text).toMatch(/20\d\d/);
  }, 20000);

  it('careers lists the open role', async () => {
    const { text } = await renderSettled(<Careers />, '/careers');
    console.log(`  CAREERS  ${text.length} chars`);

    expect(text).toMatch(/Associate, Sports Disputes/);
    expect(text).toMatch(/Lagos, Nigeria/);
  }, 20000);

  it('about shows the firm and the consultation form', async () => {
    const { text } = await renderSettled(<About />, '/about');
    console.log(`  ABOUT    ${text.length} chars`);

    expect(text).toMatch(/boutique sports law practice/i);
    expect(text).toMatch(/Free Consultation/);
  }, 20000);
});
