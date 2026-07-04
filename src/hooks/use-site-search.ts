'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface SearchResult {
  kind: 'spot' | 'district' | 'state' | 'category'
  title: string
  subtitle: string | null
  url: string
  image: string | null
  rank: number
}

/**
 * Live site-wide search via the `search_site` RPC (pg_trgm-backed, free).
 * Queries are keyed by the trimmed term; anything under 2 characters is
 * skipped so we never spam the database while the user starts typing.
 */
export function useSiteSearch(term: string): UseQueryResult<SearchResult[], Error> {
  const q = term.trim()
  return useQuery<SearchResult[], Error>({
    queryKey: ['site-search', q.toLowerCase()],
    enabled: q.length >= 2,
    staleTime: 60_000,
    queryFn: async ({ signal }): Promise<SearchResult[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .rpc('search_site', { q, max_results: 12 })
        .abortSignal(signal)
      if (error) throw error
      return (data ?? []) as SearchResult[]
    },
  })
}
