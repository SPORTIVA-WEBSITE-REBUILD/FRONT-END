import { useQuery } from '@tanstack/react-query';
import { apiGet, qs } from '../lib/api.js';

// Cached data stays fresh for 30 seconds, so navigating around does not refetch
// constantly, but something an editor has just published shows up on the next
// visit or when the tab is refocused, not five minutes later (CLAUDE.md section 11).
const CONTENT_OPTIONS = {
  staleTime: 30 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: 1,
  refetchOnWindowFocus: true,
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: ({ signal }) => apiGet('/settings', { signal }).then((r) => r.data),
    // The shell needs this on every page; keep it warm for the whole session,
    // but not stale for a quarter of an hour after a settings change.
    staleTime: 60 * 1000,
    gcTime: Infinity,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}

export function usePage(slug) {
  return useQuery({
    queryKey: ['page', slug],
    queryFn: ({ signal }) => apiGet(`/pages/${slug}`, { signal }).then((r) => r.data),
    ...CONTENT_OPTIONS,
  });
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: ({ signal }) => apiGet('/services', { signal }).then((r) => r.data),
    ...CONTENT_OPTIONS,
  });
}

export function useService(slug) {
  return useQuery({
    queryKey: ['service', slug],
    queryFn: ({ signal }) => apiGet(`/services/${slug}`, { signal }).then((r) => r.data),
    enabled: Boolean(slug),
    ...CONTENT_OPTIONS,
  });
}

export function useCases(filters = {}) {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: ({ signal }) => apiGet(`/cases${qs(filters)}`, { signal }),
    // Keeps the previous page visible while the next one loads, so filtering
    // the archive does not flash an empty grid.
    placeholderData: (prev) => prev,
    ...CONTENT_OPTIONS,
  });
}

export function useCaseFilters() {
  return useQuery({
    queryKey: ['case-filters'],
    queryFn: ({ signal }) => apiGet('/cases/filters', { signal }).then((r) => r.data),
    staleTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCase(slug) {
  return useQuery({
    queryKey: ['case', slug],
    queryFn: ({ signal }) => apiGet(`/cases/${slug}`, { signal }),
    enabled: Boolean(slug),
    ...CONTENT_OPTIONS,
  });
}

export function useArticles(filters = {}) {
  return useQuery({
    queryKey: ['articles', filters],
    queryFn: ({ signal }) => apiGet(`/articles${qs(filters)}`, { signal }),
    placeholderData: (prev) => prev,
    ...CONTENT_OPTIONS,
  });
}

export function useArticle(slug) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: ({ signal }) => apiGet(`/articles/${slug}`, { signal }),
    enabled: Boolean(slug),
    ...CONTENT_OPTIONS,
  });
}

export function useGallery({ limit = 24 } = {}) {
  return useQuery({
    queryKey: ['gallery', limit],
    queryFn: ({ signal }) => apiGet(`/gallery${qs({ limit })}`, { signal }).then((r) => r.data),
    ...CONTENT_OPTIONS,
  });
}

export function useVacancies() {
  return useQuery({
    queryKey: ['vacancies'],
    queryFn: ({ signal }) => apiGet('/vacancies', { signal }).then((r) => r.data),
    ...CONTENT_OPTIONS,
  });
}

export function useVacancy(slug) {
  return useQuery({
    queryKey: ['vacancy', slug],
    queryFn: ({ signal }) => apiGet(`/vacancies/${slug}`, { signal }),
    enabled: Boolean(slug),
    ...CONTENT_OPTIONS,
  });
}

export function useLawyers() {
  return useQuery({
    queryKey: ['lawyers'],
    queryFn: ({ signal }) => apiGet('/lawyers', { signal }).then((r) => r.data),
    ...CONTENT_OPTIONS,
  });
}

export function useLawyer(slug) {
  return useQuery({
    queryKey: ['lawyer', slug],
    queryFn: ({ signal }) => apiGet(`/lawyers/${slug}`, { signal }),
    enabled: Boolean(slug),
    ...CONTENT_OPTIONS,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: ({ signal }) => apiGet('/testimonials', { signal }).then((r) => r.data),
    ...CONTENT_OPTIONS,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => apiGet('/categories', { signal }).then((r) => r.data),
    ...CONTENT_OPTIONS,
  });
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: ({ signal }) => apiGet('/articles/tags', { signal }).then((r) => r.data),
    ...CONTENT_OPTIONS,
  });
}

export function useComments(slug) {
  return useQuery({
    queryKey: ['comments', slug],
    queryFn: ({ signal }) => apiGet(`/articles/${slug}/comments`, { signal }),
    enabled: Boolean(slug),
    ...CONTENT_OPTIONS,
    // Newly approved comments should appear without a long wait.
    staleTime: 60 * 1000,
  });
}

/**
 * The site-wide chrome from the `layout` page, which arrives with the settings.
 * `labels(key)` returns a section's named interface text; the API has already
 * filled every empty one with the template's wording.
 */
export function useLayout() {
  const { data } = useSiteSettings();
  const layout = data?.layout;
  return {
    section: (key) => section(layout, key),
    labels: (key) => section(layout, key).labels || {},
    settings: data?.settings || {},
    ready: Boolean(data),
  };
}

/** Shared interface words: "Read more", breadcrumb "Home", error text… */
export function useCommon() {
  return useLayout().labels('common');
}

/** Looks a section up by its stable key, so ordering changes cannot break a page. */
export function section(page, key) {
  return page?.sections?.find((s) => s.key === key) || {};
}
