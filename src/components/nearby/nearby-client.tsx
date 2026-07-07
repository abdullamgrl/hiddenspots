'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button, buttonVariants } from '@/components/ui/button'
import { useNearbySpots } from '@/hooks/use-nearby-spots'
import {
  Locate,
  Loader2,
  MapPin,
  Film,
  Sparkles,
  Map as MapIcon,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react'

const RADIUS_OPTIONS = [10, 25, 50, 100] as const

type LocationState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'denied' }
  | { status: 'error'; message: string }
  | { status: 'ready'; lat: number; lng: number }

export function NearbyClient() {
  const [location, setLocation] = useState<LocationState>({ status: 'idle' })
  const [radiusKm, setRadiusKm] = useState<number>(50)

  const coords =
    location.status === 'ready' ? { lat: location.lat, lng: location.lng } : null
  const { data: spots, isPending, isError } = useNearbySpots(coords, radiusKm)

  const locate = () => {
    if (!navigator.geolocation) {
      setLocation({ status: 'error', message: 'Your browser does not support location.' })
      return
    }
    setLocation({ status: 'locating' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ status: 'ready', lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocation({ status: 'denied' })
        } else {
          setLocation({ status: 'error', message: 'Could not get your location. Try again.' })
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-xl space-y-3 text-center">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">
          Hidden Spots <span className="gradient-text">Near You</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Community-verified gems around your current location, closest first. Your location is
          used once for the search and never stored.
        </p>
      </div>

      {/* Ask for location */}
      {(location.status === 'idle' || location.status === 'locating') && (
        <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand dark:text-brand-cream">
            <Locate className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-heading text-lg font-bold">Find what&apos;s around you</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Allow location access to see verified hidden spots within {radiusKm} km of you.
          </p>
          <Button
            onClick={locate}
            disabled={location.status === 'locating'}
            className="gradient-btn mt-5 w-full gap-2"
          >
            {location.status === 'locating' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Locating…
              </>
            ) : (
              <>
                <Locate className="h-4 w-4" />
                Use my location
              </>
            )}
          </Button>
        </div>
      )}

      {/* Permission denied / error */}
      {(location.status === 'denied' || location.status === 'error') && (
        <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-card p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h2 className="mt-3 font-heading text-lg font-bold">
            {location.status === 'denied' ? 'Location access blocked' : 'Something went wrong'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {location.status === 'denied'
              ? 'Enable location for this site in your browser settings, or explore the map instead.'
              : location.message}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button onClick={locate} variant="outline">
              Try again
            </Button>
            <Link href="/map" className={`${buttonVariants({ variant: 'default' })} gradient-btn`}>
              <MapIcon className="mr-1.5 h-4 w-4" />
              Explore the Map
            </Link>
          </div>
        </div>
      )}

      {/* Results */}
      {location.status === 'ready' && (
        <div className="space-y-6">
          {/* Radius selector */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Within
            </span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  radiusKm === r
                    ? 'border-brand bg-brand/10 text-brand dark:text-brand-cream'
                    : 'border-border/50 bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {isPending ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-2xl border border-border/40 bg-muted/50"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-card p-8 text-center">
              <h2 className="font-heading text-lg font-bold">Couldn&apos;t load nearby spots</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try again in a moment, or browse the map instead.
              </p>
              <Link href="/map" className={`${buttonVariants({ variant: 'outline' })} mt-4`}>
                <MapIcon className="mr-1.5 h-4 w-4" />
                Open the Map
              </Link>
            </div>
          ) : !spots || spots.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-card p-8 text-center">
              <MapPin className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h2 className="mt-3 font-heading text-lg font-bold">
                Nothing within {radiusKm} km yet
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                You&apos;re in uncharted territory — widen the radius, or put your area on the map.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {radiusKm < 100 && (
                  <Button variant="outline" onClick={() => setRadiusKm(100)}>
                    Search 100 km
                  </Button>
                )}
                <Link
                  href="/add-spot"
                  className={`${buttonVariants({ variant: 'default' })} gradient-btn`}
                >
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  Add the first spot
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {spots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/${spot.state_slug}/${spot.district_slug}/${spot.slug}`}
                  className="group"
                >
                  <div className="glass h-full overflow-hidden rounded-2xl border border-white/5 bg-card transition-all duration-300 hover:border-brand/35 group-hover:-translate-y-1 group-hover:shadow-xl">
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image
                        src={spot.cover_image}
                        alt={spot.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                        <Locate className="h-3 w-3 text-brand dark:text-brand-cream" />
                        {spot.distance_km} km
                      </div>
                      {spot.reel_count > 0 && (
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-brand/90 px-2.5 py-0.5 text-xs font-semibold text-white">
                          <Film className="h-3 w-3" />
                          {spot.reel_count}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-brand-cream">
                        {spot.category_name}
                      </span>
                      <h3 className="mt-1 line-clamp-1 font-heading text-base font-bold transition-colors group-hover:text-brand">
                        {spot.title}
                      </h3>
                      <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {spot.district_name}, {spot.state_name}
                        </span>
                        <span className="flex items-center gap-0.5 font-semibold text-amber-500">
                          <Sparkles className="h-3 w-3" />
                          {spot.verification_score}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
