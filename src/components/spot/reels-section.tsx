'use client'

import { useEffect, useRef, useState } from 'react'
import { ReelEmbed } from './reel-embed'
import { AddReelDialog } from './add-reel-dialog'
import { Film, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

interface SocialLink {
  id: string
  platform: string
  url: string
}

interface ReelsSectionProps {
  links: SocialLink[]
  spotId: string
  spotTitle: string
}

/**
 * All reels for a spot. A single reel renders as one centered player; multiple
 * reels become a horizontal snap carousel (swipe on touch, arrows on desktop)
 * instead of stacking into a grid. Non-Instagram platforms render as outbound
 * link chips.
 */
export function ReelsSection({ links, spotId, spotTitle }: ReelsSectionProps) {
  const instagram = links.filter((l) => l.platform === 'instagram')
  const others = links.filter((l) => l.platform !== 'instagram')

  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  // Arrows/dots only make sense when the row actually overflows — with few
  // reels on a wide screen everything fits and the controls would be inert.
  const [scrollable, setScrollable] = useState(false)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const measure = () => setScrollable(el.scrollWidth > el.clientWidth + 4)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [instagram.length])

  const scrollToCard = (index: number) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const clamped = Math.max(0, Math.min(index, instagram.length - 1))
    const card = scroller.children[clamped] as HTMLElement | undefined
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  const handleScroll = () => {
    const scroller = scrollerRef.current
    if (!scroller) return
    // The card whose center is closest to the scroller's center is active.
    const mid = scroller.scrollLeft + scroller.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    Array.from(scroller.children).forEach((child, i) => {
      const el = child as HTMLElement
      const center = el.offsetLeft + el.offsetWidth / 2
      const dist = Math.abs(center - mid)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    })
    setActive(best)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-heading text-2xl font-bold">
          <Film className="h-5 w-5 text-emerald-500" />
          Watch the {instagram.length === 1 ? 'Reel' : 'Reels'}
        </h2>

        <div className="flex items-center gap-2">
          <AddReelDialog spotId={spotId} spotTitle={spotTitle} />

        </div>
      </div>

      {instagram.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/50 bg-muted/20 px-6 py-10 text-center">
          <Film className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No reels here yet — seen one of this spot on Instagram? Add it and earn reputation.
          </p>
        </div>
      )}

      {instagram.length === 1 && (
        <div className="space-y-2">
          <ReelEmbed url={instagram[0].url} />
          <OpenOnInstagram url={instagram[0].url} />
        </div>
      )}

      {instagram.length > 1 && (
        <>
          <div
            ref={scrollerRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {instagram.map((link) => (
              <div key={link.id} className="w-[280px] sm:w-[320px] flex-shrink-0 snap-center space-y-2">
                <ReelEmbed url={link.url} className="!max-w-none" />
                <OpenOnInstagram url={link.url} />
              </div>
            ))}
          </div>

          {/* Snap-position dots */}
          {scrollable && (
          <div className="flex justify-center gap-1.5">
            {instagram.map((link, i) => (
              <button
                key={link.id}
                type="button"
                aria-label={`Go to reel ${i + 1}`}
                onClick={() => scrollToCard(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-5 bg-emerald-500' : 'w-1.5 bg-border hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
          )}
        </>
      )}

      {others.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {others.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 text-xs font-semibold capitalize text-muted-foreground transition-colors hover:border-emerald-500/50 hover:text-emerald-500"
            >
              <ExternalLink className="h-3 w-3" />
              {link.platform}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}

function OpenOnInstagram({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-auto flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-emerald-500"
    >
      <ExternalLink className="h-3 w-3" />
      Open on Instagram
    </a>
  )
}
