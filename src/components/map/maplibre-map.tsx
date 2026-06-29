'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { FeatureCollection, Point } from 'geojson'
import type { MapBounds, MapSpotProperties } from '@/hooks/use-map-spots'
import { SpotPreviewCard } from './spot-preview-card'

// Default dark vector basemap. Free fair-use CARTO style that matches the
// app's dark theme. Override with NEXT_PUBLIC_MAP_STYLE_URL to point at
// OpenFreeMap, a self-hosted style, or any MapLibre-compatible style JSON.
const DEFAULT_STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

// Whole-of-India default viewport (content is currently Kerala-centric but
// the directory is national in scope).
const DEFAULT_CENTER: [number, number] = [78.9, 20.6]
const DEFAULT_ZOOM = 3.5

// Fonts confirmed available on the CARTO glyph endpoint.
const TEXT_FONT = ['Open Sans Bold']

const EMPTY_FC: FeatureCollection = { type: 'FeatureCollection', features: [] }

interface MapLibreMapProps {
  /** GeoJSON spots to render (owned by the parent so a side list can share it). */
  data?: FeatureCollection
  /** Reports the viewport bbox whenever it changes, so the parent can refetch. */
  onBoundsChange?: (bounds: MapBounds) => void
  /** Currently previewed spot (drives the preview card). */
  selectedSpot?: MapSpotProperties | null
  onSelectSpot?: (spot: MapSpotProperties | null) => void
  /** Fly the map to this point (e.g. when a list item is clicked). */
  focus?: { lng: number; lat: number } | null
  center?: [number, number]
  zoom?: number
  className?: string
}

export default function MapLibreMap({
  data,
  onBoundsChange,
  selectedSpot,
  onSelectSpot,
  focus,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className,
}: MapLibreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [styleReady, setStyleReady] = useState(false)

  // Keep latest callbacks in refs so the init-once effect never reads stale ones.
  const onBoundsChangeRef = useRef(onBoundsChange)
  const onSelectSpotRef = useRef(onSelectSpot)
  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange
    onSelectSpotRef.current = onSelectSpot
  })

  // Create the map + cluster layers once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_STYLE_URL,
      center,
      zoom,
      attributionControl: { compact: true },
    })
    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    )

    // Surface style/tile load failures instead of silently rendering blank.
    map.on('error', (e) => {
      console.error('[maplibre]', e.error ?? e)
    })

    // The map measures its container on init and only auto-resizes on window
    // resize — not on layout/flex changes. Observe the container so the canvas
    // always matches its box (fixes the blank-map-in-a-flex-layout case).
    const resizeObserver = new ResizeObserver(() => map.resize())
    if (containerRef.current) resizeObserver.observe(containerRef.current)

    const syncBounds = () => {
      const b = map.getBounds()
      onBoundsChangeRef.current?.({
        minLng: b.getWest(),
        minLat: b.getSouth(),
        maxLng: b.getEast(),
        maxLat: b.getNorth(),
        zoom: map.getZoom(),
      })
    }

    map.on('load', () => {
      map.addSource('spots', {
        type: 'geojson',
        data: EMPTY_FC,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'spots',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#10b981',
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#064e3b',
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 30],
        },
      })

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'spots',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': TEXT_FONT,
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' },
      })

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'spots',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#10b981',
          'circle-radius': 9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      // Reel-count badge on individual spots.
      map.addLayer({
        id: 'unclustered-count',
        type: 'symbol',
        source: 'spots',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['to-string', ['get', 'reel_count']],
          'text-font': TEXT_FONT,
          'text-size': 10,
          'text-allow-overlap': true,
        },
        paint: { 'text-color': '#ffffff' },
      })

      // Expand a cluster on click.
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        const clusterId = features[0]?.properties?.cluster_id as number | undefined
        if (clusterId == null) return
        const source = map.getSource('spots') as maplibregl.GeoJSONSource
        source.getClusterExpansionZoom(clusterId).then((expansionZoom) => {
          map.easeTo({
            center: (features[0].geometry as Point).coordinates as [number, number],
            zoom: expansionZoom,
          })
        })
      })

      // Open the preview card for a clicked spot.
      map.on('click', 'unclustered-point', (e) => {
        const props = e.features?.[0]?.properties as MapSpotProperties | undefined
        if (props) onSelectSpotRef.current?.(props)
      })

      // Pointer affordances.
      for (const layer of ['clusters', 'unclustered-point']) {
        map.on('mouseenter', layer, () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', layer, () => {
          map.getCanvas().style.cursor = ''
        })
      }

      map.resize()
      setStyleReady(true)
      syncBounds()
    })

    // Refetch on viewport change; moveend fires once per gesture, the timeout
    // coalesces rapid successive gestures.
    let moveTimer: ReturnType<typeof setTimeout>
    const onMoveEnd = () => {
      clearTimeout(moveTimer)
      moveTimer = setTimeout(syncBounds, 300)
    }
    map.on('moveend', onMoveEnd)

    return () => {
      clearTimeout(moveTimer)
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
      setStyleReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push parent-owned spots into the GeoJSON source.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady) return
    const source = map.getSource('spots') as maplibregl.GeoJSONSource | undefined
    source?.setData(data ?? EMPTY_FC)
  }, [data, styleReady])

  // Fly to an externally-focused spot (e.g. clicked from the results list).
  useEffect(() => {
    const map = mapRef.current
    if (!map || !focus) return
    map.flyTo({ center: [focus.lng, focus.lat], zoom: Math.max(map.getZoom(), 13), essential: true })
  }, [focus])

  return (
    <div className={`relative ${className ?? 'h-full w-full'}`}>
      {/* h-full (not absolute inset-0): MapLibre forces position:relative on
          this node via .maplibregl-map, which would cancel an `absolute` and
          collapse the height. */}
      <div ref={containerRef} className="h-full w-full" />
      {selectedSpot && (
        <SpotPreviewCard
          key={selectedSpot.id}
          spot={selectedSpot}
          onClose={() => onSelectSpot?.(null)}
        />
      )}
    </div>
  )
}
