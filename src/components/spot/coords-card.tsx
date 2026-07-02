'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { Copy, Navigation } from 'lucide-react'
import { toast } from 'sonner'

interface CoordsCardProps {
  latitude: number
  longitude: number
}

/**
 * Exact coordinates + one-tap directions. Uses the free Google Maps URL
 * scheme (plain deep link, not the metered JS/API).
 */
export function CoordsCard({ latitude, longitude }: CoordsCardProps) {
  const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`

  const copyCoords = async () => {
    try {
      await navigator.clipboard.writeText(coords)
      toast.success('Coordinates copied — paste into any maps app')
    } catch {
      toast.error('Could not copy coordinates')
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Exact GPS Coordinates
          </div>
          <div className="mt-1 truncate font-mono text-sm font-semibold">{coords}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyCoords}
          aria-label="Copy coordinates"
          className="h-9 w-9 flex-shrink-0 p-0 text-muted-foreground hover:text-foreground"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonVariants({ variant: 'default' })} gradient-btn w-full gap-1.5`}
      >
        <Navigation className="h-4 w-4" />
        <span>Get Directions</span>
      </a>
    </div>
  )
}
