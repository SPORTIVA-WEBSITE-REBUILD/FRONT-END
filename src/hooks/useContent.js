import { useQuery } from '@tanstack/react-query';
import { apiGet, qs } from '../lib/api.js';

// Content changes rarely, so cached data stays fresh for five minutes and the
// site does not refetch on every navigation (CLAUDE.md section 11).
const CONTENT_OPTIONS = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: 1,
  refetchOnWindowFocus: false,
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: ({ signal }) => apiGet('/settings', { signal }).then((r) => r.data),
    // The shell needs this on every page; keep it warm for the whole session.
    staleTime: 15 * 60 * 1000,
    gcTime: Infinity,
    retry: 1,
    refetchOnWindowFocus: false,
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

/** Looks a section up by its stable key, so ordering changes cannot break a page. */
export function section(page, key) {
  return page?.sections?.find((s) => s.key === key) || {};
}
