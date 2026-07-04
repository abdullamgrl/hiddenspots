'use client'

import { ReelEmbed } from './reel-embed'
import { Film, ExternalLink } from 'lucide-react'

interface SocialLink {
  id: string
  platform: string
  url: string
}

interface ReelsSectionProps {
  links: SocialLink[]
}

/**
 * All reels for a spot. Instagram links render as embeds (with the raw link
 * beneath as a ToS-safe fallback if the embed ever breaks); other platforms
 * render as outbound link chips.
 */
export function ReelsSection({ links }: ReelsSectionProps) {
  const instagram = links.filter((l) => l.platform === 'instagram')
  const others = links.filter((l) => l.platform !== 'instagram')

  if (links.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 font-heading text-xl font-bold">
        <Film className="h-5 w-5 text-emerald-500" />
        Watch the {instagram.length === 1 ? 'Reel' : 'Reels'}
        {instagram.length > 1 && (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
            {instagram.length}
          </span>
        )}
      </h2>

      {instagram.length > 0 && (
        <div className={`grid grid-cols-1 gap-6 ${instagram.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {instagram.map((link) => (
            <div key={link.id} className="space-y-2">
              <ReelEmbed url={link.url} />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-auto flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-emerald-500"
              >
                <ExternalLink className="h-3 w-3" />
                Open on Instagram
              </a>
            </div>
          ))}
        </div>
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
