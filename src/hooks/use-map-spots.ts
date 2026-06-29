'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { FeatureCollection } from 'geojson'
import { createClient } from '@/lib/supabase/client'

export interface MapBounds {
  minLng: number
  minLat: number
  maxLng: number
  maxLat: number
  zoom: number
}

// Properties carried on each GeoJSON feature returned by get_map_spots.
export interface MapSpotProperties {
  id: string
  title: string
  slug: string
  cover_image: string
  state_slug: string
  district_slug: string
  reel_count: number
}

// Coarsen the bbox in the cache key (~1km) so small pans reuse cached data
// instead of refetching on every gesture.
const round = (n: number) => Math.round(n * 100) / 100

/**
 * Fetches the minimal GeoJSON FeatureCollection of reel-bearing spots inside
 * the current viewport via the `get_map_spots` RPC. Keyed by a rounded bbox +
 * zoom so panning only refetches when the viewport meaningfully changes;
 * React Query passes an AbortSignal so superseded requests are cancelled.
 */
export function useMapSpots(
  bounds: MapBounds | null,
  category?: string | null
): UseQueryResult<FeatureCollection, Error> {
  return useQuery<FeatureCollection, Error>({
    queryKey: bounds
      ? [
          'map-spots',
          round(bounds.minLng),
          round(bounds.minLat),
          round(bounds.maxLng),
          round(bounds.maxLat),
          Math.round(bounds.zoom),
          category ?? null,
        ]
      : ['map-spots', 'idle'],
    enabled: !!bounds,
    // Keep the previous viewport's markers on screen while the next load is in
    // flight, so panning doesn't flash an empty map.
    placeholderData: (prev) => prev,
    queryFn: async ({ signal }): Promise<FeatureCollection> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .rpc('get_map_spots', {
          min_lng: bounds!.minLng,
          min_lat: bounds!.minLat,
          max_lng: bounds!.maxLng,
          max_lat: bounds!.maxLat,
          zoom: Math.round(bounds!.zoom),
          p_category: category ?? null,
        })
        .abortSignal(signal)

      if (error) throw error
      return data as FeatureCollection
    },
  })
}
