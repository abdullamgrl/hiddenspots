'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Card } from '@/components/ui/card'
import { Sparkles, MapPin, X } from 'lucide-react'

// Same free CARTO dark style used by the /map discovery page so every map in
// the app shares one basemap (and zero metered map loads).
const DEFAULT_STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

export interface SpotGeom {
  id: string
  title: string
  slug: string
  latitude: number
  longitude: number
  cover_image: string
  verification_score: number
  district: { name: string; slug: string } | string
  state: { name: string; slug: string } | string
  category: { name: string }
}

interface SpotMapProps {
  spots: SpotGeom[]
  center?: [number, number] // [lng, lat]
  zoom?: number
  interactive?: boolean
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getDetailLink = (spot: SpotGeom) => {
  const stateSlug = typeof spot.state === 'object' ? spot.state.slug : slugify(spot.state)
  const districtSlug = typeof spot.district === 'object' ? spot.district.slug : slugify(spot.district)
  return `/${stateSlug}/${districtSlug}/${spot.slug}`
}

function createPinElement(): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'hs-map-pin'
  el.innerHTML = `
    <svg width="30" height="38" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18c0-6.63-5.37-12-12-12z" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4.5" fill="#064e3b"/>
    </svg>`
  el.style.cursor = 'pointer'
  el.style.transition = 'transform 0.15s ease'
  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.15)' })
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
  return el
}

/**
 * Lightweight MapLibre map for embedding a handful of spot pins (home preview,
 * spot detail sidebar). The clustered viewport-driven map lives in
 * `maplibre-map.tsx`; this one is intentionally simpler — static pins, fit to
 * bounds, tap for a preview card.
 */
export default function SpotMap({
  spots,
  center = [76.13, 11.68], // [lng, lat]
  zoom = 9,
  interactive = true,
}: SpotMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [activeSpot, setActiveSpot] = useState<SpotGeom | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_STYLE_URL,
      center,
      zoom,
      interactive,
      cooperativeGestures: interactive,
      attributionControl: { compact: true },
    })
    mapRef.current = map

    if (interactive) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    }

    map.on('error', (e) => {
      console.error('[maplibre]', e.error ?? e)
    })

    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Render pins whenever the spot list changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const valid = spots.filter((s) => s.latitude && s.longitude)

    valid.forEach((spot) => {
      const el = createPinElement()
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setActiveSpot(spot)
        map.easeTo({
          center: [spot.longitude, spot.latitude],
          zoom: Math.max(map.getZoom(), 12),
        })
      })
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([spot.longitude, spot.latitude])
        .addTo(map)
      markersRef.current.push(marker)
    })

    // Fit the viewport to the pins (single pin keeps the provided zoom).
    if (valid.length > 1) {
      const bounds = new maplibregl.LngLatBounds()
      valid.forEach((s) => bounds.extend([s.longitude, s.latitude]))
      map.fitBounds(bounds, { padding: 64, maxZoom: 12, duration: 0 })
    }
  }, [spots])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border/50 shadow-inner">
      <div ref={containerRef} className="h-full w-full" />

      {/* Floating active-spot preview card */}
      {activeSpot && (
        <div className="absolute bottom-4 left-4 right-4 z-20 animate-in slide-in-from-bottom-5 duration-300 md:left-6 md:right-auto md:w-80">
          <Card className="glass relative overflow-hidden p-0 shadow-xl">
            <button
              onClick={() => setActiveSpot(null)}
              aria-label="Close preview"
              className="absolute right-2 top-2 z-30 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <Link href={getDetailLink(activeSpot)}>
              <div className="relative h-32 w-full">
                <Image
                  src={activeSpot.cover_image}
                  alt={activeSpot.title}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
                <div className="absolute left-2 top-2 flex items-center space-x-1 rounded-full bg-emerald-600/90 px-2 py-0.5 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  <span>{activeSpot.verification_score} Score</span>
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-teal-400">
                  {activeSpot.category.name}
                </div>
                <h4 className="mt-1 line-clamp-1 font-heading text-base font-bold text-foreground">
                  {activeSpot.title}
                </h4>
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                  <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                  <span>
                    {typeof activeSpot.district === 'object' ? activeSpot.district.name : activeSpot.district},{' '}
                    {typeof activeSpot.state === 'object' ? activeSpot.state.name : activeSpot.state}
                  </span>
                </div>
              </div>
            </Link>
          </Card>
        </div>
      )}
    </div>
  )
}
