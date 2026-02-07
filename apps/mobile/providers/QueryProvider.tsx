import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 2 * 60 * 1000, // 2 min default
      gcTime: 10 * 60 * 1000, // keep unused data 10 min
      refetchOnWindowFocus: false, // mobile doesn't have "window focus"
    },
    mutations: {
      retry: 1,
    },
  },
});

/** Stale-time presets per domain (use as `staleTime` in useQuery) */
export const STALE_TIMES = {
  /** User profile, settings */
  profile: 5 * 60 * 1000,
  /** Task / sprint / epic lists */
  lists: 2 * 60 * 1000,
  /** Static content: FAQs, mindset themes, book catalog */
  static: 30 * 60 * 1000,
  /** Real-time-ish: notifications, command-center */
  realtime: 30 * 1000,
} as const;

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };
