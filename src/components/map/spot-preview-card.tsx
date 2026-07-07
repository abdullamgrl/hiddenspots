'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { ReelEmbed } from '@/components/spot/reel-embed'
import { useSpotReels } from '@/hooks/use-spot-reels'
import type { MapSpotProperties } from '@/hooks/use-map-spots'

interface SpotPreviewCardProps {
  spot: MapSpotProperties
  onClose: () => void
}

export function SpotPreviewCard({ spot, onClose }: SpotPreviewCardProps) {
  const { data: reels, isLoading, isError } = useSpotReels(spot.id)
  const [index, setIndex] = useState(0)

  const detailLink = `/${spot.state_slug}/${spot.district_slug}/${spot.slug}`
  const total = reels?.length ?? 0
  const current = total > 0 ? reels![index % total] : undefined

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-[360px] z-20 animate-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xl glass">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-30 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
          aria-label="Close preview"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Reel preview — Instagram embeds load only now that the card is open */}
        <div className="max-h-[420px] overflow-y-auto bg-black/40">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading reels...
            </div>
          ) : current ? (
            <div className="p-2">
              <ReelEmbed key={current.url} url={current.url} />
            </div>
          ) : (
            // No reel (or failed to load) — fall back to the cover image.
            <div className="relative h-40 w-full">
              <Image src={spot.cover_image} alt={spot.title} fill sizes="360px" className="object-cover" />
              {isError && (
                <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white">
                  Could not load reels
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pager for spots with more than one reel */}
        {total > 1 && (
          <div className="flex items-center justify-between border-t border-border/50 px-3 py-2">
            <button
              onClick={() => setIndex((i) => (i - 1 + total) % total)}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Previous reel"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reel {(index % total) + 1} / {total}
            </span>
            <button
              onClick={() => setIndex((i) => (i + 1) % total)}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Next reel"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Footer: title, reel count, link to the full detail page */}
        <div className="space-y-2 border-t border-border/50 p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="line-clamp-1 font-heading text-base font-bold text-foreground">{spot.title}</h4>
            {spot.reel_count > 0 && (
              <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-brand/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                <Sparkles className="h-3 w-3" />
                {spot.reel_count} {spot.reel_count === 1 ? 'reel' : 'reels'}
              </span>
            )}
          </div>
          <Link
            href={detailLink}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand dark:text-brand-cream transition-colors hover:text-brand-green dark:text-brand-cream dark:hover:text-brand-cream"
          >
            View details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
