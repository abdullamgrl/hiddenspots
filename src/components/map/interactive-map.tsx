'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Sparkles, MapPin, X } from 'lucide-react'
import Image from 'next/image'
import { loadGoogleMaps } from '@/lib/maps-loader'

interface SpotGeom {
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

interface MapProps {
  spots: SpotGeom[]
  center?: [number, number] // [lng, lat]
  zoom?: number
  interactive?: boolean
}

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#12131a' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8ec3b9' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1a1b26' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#2c2e3e' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0d9488' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#1c1e2d' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a8ebd0' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0b2820' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#34d399' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#24283b' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ab8b2' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1f3a38' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0d9488' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#091c18' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#31645a' }],
  },
]

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export default function InteractiveMap({
  spots,
  center = [76.13, 11.68], // [lng, lat]
  zoom = 9,
  interactive = true,
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  const [activeSpot, setActiveSpot] = useState<SpotGeom | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        setLoaded(true)
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err)
        setErrorMsg(err.message)
      })
  }, [])

  useEffect(() => {
    if (!loaded || !mapContainerRef.current) return

    // Initialize Map
    const mapOptions: google.maps.MapOptions = {
      center: { lat: center[1], lng: center[0] },
      zoom: zoom,
      styles: darkMapStyle,
      gestureHandling: interactive ? 'cooperative' : 'none',
      zoomControl: interactive,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: interactive,
      scaleControl: interactive,
    }

    const map = new google.maps.Map(mapContainerRef.current, mapOptions)
    mapRef.current = map

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    // Add Markers
    spots.forEach((spot) => {
      if (!spot.latitude || !spot.longitude) return

      const marker = new google.maps.Marker({
        position: { lat: spot.latitude, lng: spot.longitude },
        map: map,
        title: spot.title,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#10b981', // Emerald green
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
          scale: 1.5,
          anchor: new google.maps.Point(12, 22),
        },
      })

      marker.addListener('click', () => {
        setActiveSpot(spot)
        map.panTo({ lat: spot.latitude, lng: spot.longitude })
        map.setZoom(Math.max(map.getZoom() || 9, 12))
      })

      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach((m) => m.setMap(null))
    }
  }, [loaded, spots, center, zoom, interactive])

  if (errorMsg) {
    return (
      <div className="flex h-[450px] w-full flex-col items-center justify-center rounded-2xl bg-muted border border-border px-6 text-center">
        <MapPin className="h-12 w-12 text-muted-foreground mb-4 animate-bounce" />
        <h4 className="font-heading text-lg font-bold">Interactive Map Unavailable</h4>
        <p className="text-sm text-muted-foreground max-w-sm mt-2">
          Please add a valid `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in your environment variables to enable the geolocational mapping experience.
        </p>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="flex h-[450px] w-full items-center justify-center rounded-2xl bg-muted border border-border">
        <div className="text-sm text-muted-foreground animate-pulse font-medium">Loading Google maps...</div>
      </div>
    )
  }

  // Calculate Slugs safely for detail page link
  const getDetailLink = (spot: SpotGeom) => {
    const stateSlug = typeof spot.state === 'object' ? spot.state.slug : slugify(spot.state)
    const districtSlug = typeof spot.district === 'object' ? spot.district.slug : slugify(spot.district)
    return `/${stateSlug}/${districtSlug}/${spot.slug}`
  }

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-inner border border-border/50">
      {/* Map Element */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Floating Active Spot Preview Card */}
      {activeSpot && (
        <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:w-80 z-20 animate-in slide-in-from-bottom-5 duration-300">
          <Card className="p-0 overflow-hidden glass relative shadow-xl">
            <button
              onClick={() => setActiveSpot(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white z-30 transition-colors"
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
                <div className="absolute top-2 left-2 flex items-center space-x-1 rounded-full bg-emerald-600/90 text-white px-2 py-0.5 text-xs font-semibold">
                  <Sparkles className="h-3 w-3" />
                  <span>{activeSpot.verification_score} Score</span>
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-emerald-600 dark:text-teal-400 font-semibold uppercase tracking-wider">
                  {activeSpot.category.name}
                </div>
                <h4 className="font-heading text-base font-bold text-foreground mt-1 line-clamp-1">
                  {activeSpot.title}
                </h4>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
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
