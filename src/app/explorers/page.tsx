import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { explorerLevel } from '@/lib/gamification'
import { Sparkles, Compass } from 'lucide-react'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Top Explorers | HiddenSpots',
  description:
    'The explorers putting India’s hidden gems on the map — ranked by real, community-earned reputation.',
  alternates: { canonical: '/explorers' },
}

interface ExplorerRow {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  reputation_score: number
  created_at: string
}

export default async function ExplorersPage() {
  const supabase = await createClient()

  // Base reputation is 10, so > 10 means at least one real contribution —
  // no padded leaderboard. "user\_%" excludes incomplete signups (the
  // signup trigger seeds that placeholder username; underscore escaped
  // because it's a LIKE wildcard). Join date breaks ties: earlier wins.
  const { data } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, reputation_score, created_at')
    .not('username', 'is', null)
    .not('username', 'like', 'user\\_%')
    .gt('reputation_score', 10)
    .order('reputation_score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(50)

  const explorers = (data ?? []) as ExplorerRow[]

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="eyebrow-script">the ones who wander furthest</div>
        <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          Top Explorers
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Reputation is earned the only way that counts here — approved spots, verified
          coordinates, and reels the community can trust.
        </p>
      </div>

      {explorers.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border/50 bg-muted/20 p-10 text-center">
          <Compass className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h2 className="mt-3 font-heading text-lg font-bold">The map is young</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Share a hidden spot, get it approved, and put your name here.
          </p>
          <Link
            href="/add-spot"
            className={`${buttonVariants({ variant: 'default' })} gradient-btn mt-5`}
          >
            Share a Hidden Spot
          </Link>
        </div>
      ) : (
        <ol className="space-y-2">
          {explorers.map((explorer, i) => {
            const rank = i + 1
            const level = explorerLevel(explorer.reputation_score)
            const displayName = explorer.full_name || explorer.username
            const topThree = rank <= 3
            return (
              <li key={explorer.id}>
                <Link
                  href={`/profile/${explorer.username}`}
                  className={`group flex items-center gap-3 rounded-2xl border bg-card px-4 transition-all duration-300 hover:border-brand/35 hover:shadow-lg sm:gap-4 ${
                    topThree ? 'border-sunset/25 py-4' : 'border-border/50 py-3'
                  }`}
                >
                  <span
                    className={`w-8 flex-shrink-0 text-center font-heading font-extrabold tabular-nums ${
                      topThree ? 'text-xl text-sunset' : 'text-sm text-muted-foreground'
                    }`}
                  >
                    {rank}
                  </span>

                  {explorer.avatar_url ? (
                    <Image
                      src={explorer.avatar_url}
                      alt={displayName}
                      width={44}
                      height={44}
                      className="h-11 w-11 flex-shrink-0 rounded-full border-2 border-background object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-[#22343c] font-heading text-lg font-bold text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-heading text-sm font-bold transition-colors group-hover:text-brand sm:text-base">
                      {displayName}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <level.current.icon className="h-3.5 w-3.5 text-sunset" />
                      <span className="font-semibold text-sunset">{level.current.name}</span>
                      <span className="truncate">@{explorer.username}</span>
                    </div>
                  </div>

                  <span className="flex flex-shrink-0 items-center gap-1 text-xs font-bold text-amber-500 sm:text-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="tabular-nums">{explorer.reputation_score}</span>
                    <span className="hidden font-semibold text-muted-foreground sm:inline">rep</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
