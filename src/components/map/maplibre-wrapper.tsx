'use client'

import dynamic from 'next/dynamic'

// MapLibre touches `window`/DOM on import, so it must never run on the server.
const MapLibreMap = dynamic(() => import('./maplibre-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <div className="text-sm text-muted-foreground animate-pulse">Loading map...</div>
    </div>
  ),
})

export default MapLibreMap
