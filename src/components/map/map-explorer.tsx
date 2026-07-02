'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import type { Point } from 'geojson'
import { Loader2, MapPin, Sparkles } from 'lucide-react'
import MapLibreMap from './maplibre-wrapper'
import { MapFilters } from './map-filters'
import { useMapSpots, type MapBounds, type MapSpotProperties } from '@/hooks/use-map-spots'

interface Category {
  id: string
  name: string
  slug: string
}

interface MapExplorerProps {
  categories: Category[]
}

interface SpotListItem {
  props: MapSpotProperties
  lng: number
  lat: number
}

export function MapExplorer({ categories }: MapExplorerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const categorySlug = searchParams.get('category')
  const categoryId = useMemo(
    () => categories.find((c) => c.slug === categorySlug)?.id ?? null,
    [categories, categorySlug]
  )

  const [bounds, setBounds] = useState<MapBounds | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<MapSpotProperties | null>(null)
  const [focus, setFocus] = useState<{ lng: number; lat: number } | null>(null)

  const { data, isFetching } = useMapSpots(bounds, categoryId)

  const onBoundsChange = useCallback((b: MapBounds) => setBounds(b), [])

  const items: SpotListItem[] = useMemo(
    () =>
      (data?.features ?? []).map((f) => ({
        props: f.properties as unknown as MapSpotProperties,
        lng: (f.geometry as Point).coordinates[0],
        lat: (f.geometry as Point).coordinates[1],
      })),
    [data]
  )

  const setCategory = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set('category', slug)
    else params.delete('category')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const handleListSelect = (item: SpotListItem) => {
    setSelectedSpot(item.props)
    setFocus({ lng: item.lng, lat: item.lat })
  }

  const results = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {items.length} {items.length === 1 ? 'spot' : 'spots'} in view
        </h2>
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
            <MapPin className="h-8 w-8 opacity-40" />
            <p>No reels in this area yet. Try zooming out or panning the map.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {items.map((item) => {
              const active = selectedSpot?.id === item.props.id
              return (
                <li key={item.props.id}>
                  <button
                    onClick={() => handleListSelect(item)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      active ? 'bg-emerald-500/10' : ''
                    }`}
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-border/50">
                      <Image
                        src={item.props.cover_image}
                        alt={item.props.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-heading text-sm font-bold text-foreground">
                        {item.props.title}
                      </h3>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-3 w-3" />
                        {item.props.reel_count} {item.props.reel_count === 1 ? 'reel' : 'reels'}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )

  return (
    <div className="relative flex h-[calc(100dvh_-_8rem)] w-full flex-col md:h-[calc(100dvh_-_4rem)] lg:flex-row">
      {/* Map — the inner wrapper is absolutely positioned so it has a definite
          height for MapLibre (a percentage height inside a flex item can
          collapse to 0 and render a blank canvas). */}
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <MapLibreMap
            data={data}
            onBoundsChange={onBoundsChange}
            selectedSpot={selectedSpot}
            onSelectSpot={setSelectedSpot}
            focus={focus}
            className="h-full w-full"
          />
        </div>
        <div className="absolute left-3 right-3 top-3 z-10 sm:right-auto">
          <MapFilters categories={categories} value={categorySlug} onChange={setCategory} />
        </div>
      </div>

      {/* Results — desktop right sidebar */}
      <aside className="hidden border-l border-border/50 bg-background lg:block lg:w-96">{results}</aside>

      {/* Results — mobile bottom sheet (peek + expand) */}
      <MobileSheet count={items.length}>{results}</MobileSheet>
    </div>
  )
}

function MobileSheet({ count, children }: { count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-10 rounded-t-2xl border-t border-border/50 bg-background shadow-2xl transition-[height] duration-300 lg:hidden ${
        open ? 'h-[55%]' : 'h-14'
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-muted-foreground"
      >
        <span className="h-1 w-10 rounded-full bg-border" />
      </button>
      {open ? (
        <div className="h-[calc(100%_-_2.75rem)]">{children}</div>
      ) : (
        <div className="px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {count} {count === 1 ? 'spot' : 'spots'} in view · tap to browse
        </div>
      )}
    </div>
  )
}
