import { useQuery } from '@tanstack/react-query';
import { getWebinar } from '../lib/webinarApi.js';

/**
 * Polled on a short stale time (not the usual 30s CONTENT_OPTIONS): the
 * hero's isHeroActive/registrationOpen/hasEnded flags are time-based, not
 * just content-based, so a visitor sitting on the home page across the
 * webinar's end time should see it flip without a manual refresh.
 */
export function useWebinar() {
  return useQuery({
    queryKey: ['webinar'],
    queryFn: ({ signal }) => getWebinar({ signal }),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
  });
}
