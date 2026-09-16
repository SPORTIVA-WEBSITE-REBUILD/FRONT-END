import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/** Renders a component with the same providers main.jsx installs. */
export function renderWithProviders(ui, { route = '/' } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

/** Stubs fetch with a map of "path fragment" -> response body. */
export function mockApi(routes) {
  return vi.fn((url) => {
    const match = Object.keys(routes).find((key) => String(url).includes(key));
    if (!match) {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } }),
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, ...routes[match] }),
    });
  });
}
