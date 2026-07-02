'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface NearbySpot {
  id: string
  title: string
  slug: string
  cover_image: string
  state_slug: string
  district_slug: string
  district_name: string
  state_name: string
  category_name: string
  verification_score: number
  latitude: number
  longitude: number
  reel_count: number
  distance_km: number
}

/**
 * Distance-sorted spots around the given coordinates via the
 * `get_nearby_spots` RPC. Coordinates are rounded in the cache key (~100m)
 * so tiny GPS jitter doesn't refetch.
 */
export function useNearbySpots(
  coords: { lat: number; lng: number } | null,
  radiusKm: number
): UseQueryResult<NearbySpot[], Error> {
  return useQuery<NearbySpot[], Error>({
    queryKey: coords
      ? ['nearby-spots', Math.round(coords.lat * 1000), Math.round(coords.lng * 1000), radiusKm]
      : ['nearby-spots', 'idle'],
    enabled: !!coords,
    staleTime: 120_000,
    queryFn: async ({ signal }): Promise<NearbySpot[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .rpc('get_nearby_spots', {
          p_lat: coords!.lat,
          p_lng: coords!.lng,
          radius_km: radiusKm,
          max_results: 24,
        })
        .abortSignal(signal)
      if (error) throw error
      return (data ?? []) as NearbySpot[]
    },
  })
}
