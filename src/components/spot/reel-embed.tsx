'use client'

import { useMemo, useState } from 'react'
import { Film } from 'lucide-react'

interface ReelEmbedProps {
  url: string
  className?: string
}

// Instagram's bare /embed/ endpoint (no /captioned/) omits the caption and
// comments but still draws a profile header above and an engagement bar below
// the video. There is no official chrome-free player, so we oversize the
// iframe inside a window matching the embed's media box and shift it up,
// cropping the chrome away. The media box in IG embeds is 4:5 (taller reels
// are letterboxed inside it), so a 4:5 window ends exactly where the footer
// begins. If Instagram changes its chrome, tune CHROME_TOP.
const CHROME_TOP = 54 // profile header row
const IFRAME_OVERDRAW = 400 // extra height so footer/whitespace always exists below the crop

export function ReelEmbed({ url, className }: ReelEmbedProps) {
  const [loaded, setLoaded] = useState(false)

  const embedSrc = useMemo(() => {
    const match = url.match(/instagram\.com\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/)
    if (!match) return null
    const kind = match[1] === 'reels' ? 'reel' : match[1]
    return `https://www.instagram.com/${kind}/${match[2]}/embed/`
  }, [url])

  if (!embedSrc) return null

  return (
    <div
      className={`relative w-full max-w-[340px] mx-auto aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-950 ring-1 ring-white/10 shadow-xl ${className ?? ''}`}
    >
      {/* Loading shimmer until Instagram paints */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900 animate-pulse">
          <Film className="h-6 w-6 text-zinc-600" />
          <span className="text-[11px] font-medium text-zinc-600">Loading reel…</span>
        </div>
      )}
      <iframe
        src={embedSrc}
        title="Instagram reel"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        scrolling="no"
        className="absolute left-0 w-full border-0"
        style={{
          top: `-${CHROME_TOP}px`,
          height: `calc(100% + ${CHROME_TOP + IFRAME_OVERDRAW}px)`,
        }}
      />
    </div>
  )
}
