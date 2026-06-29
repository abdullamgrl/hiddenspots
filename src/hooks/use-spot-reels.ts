'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface SpotReel {
  id: string
  url: string
  platform: string
  created_at: string
}

/**
 * Lazily fetches a spot's Instagram reels via the `get_spot_reels` RPC. Only
 * runs once a spot is selected (a marker preview is opened), so reel data and
 * the Instagram embeds it drives are never loaded for off-screen markers.
 */
export function useSpotReels(spotId: string | null): UseQueryResult<SpotReel[], Error> {
  return useQuery<SpotReel[], Error>({
    queryKey: ['spot-reels', spotId],
    enabled: !!spotId,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }): Promise<SpotReel[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .rpc('get_spot_reels', { p_spot_id: spotId! })
        .abortSignal(signal)

      if (error) throw error
      return (data ?? []) as SpotReel[]
    },
  })
}
