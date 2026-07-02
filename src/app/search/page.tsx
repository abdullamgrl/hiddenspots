import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { SearchBox } from '@/components/navigation/search-box'
import { buttonVariants } from '@/components/ui/button'
import { Compass, Landmark, MapPin, Film, PlusCircle, Map as MapIcon } from 'lucide-react'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

interface SearchResult {
  kind: 'spot' | 'district' | 'state' | 'category'
  title: string
  subtitle: string | null
  url: string
  image: string | null
  rank: number
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search: ${q} | HiddenSpot` : 'Search | HiddenSpot',
    robots: { index: false },
  }
}

const KIND_ICON = {
  district: MapPin,
  state: Landmark,
  category: Compass,
} as const

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = (q ?? '').trim()

  let results: SearchResult[] = []
  let searchFailed = false

  if (query.length >= 2) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('search_site', { q: query, max_results: 30 })
    if (error) {
      searchFailed = true
    } else {
      results = (data ?? []) as SearchResult[]
    }
  }

  const spots = results.filter((r) => r.kind === 'spot')
  const places = results.filter((r) => r.kind !== 'spot')

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto mb-10 max-w-2xl space-y-4 text-center">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">
          {query ? <>Results for “{query}”</> : 'Search HiddenSpot'}
        </h1>
        <SearchBox variant="compact" initialQuery={query} autoFocus={!query} />
      </div>

      {searchFailed ? (
        <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-card p-8 text-center">
          <h2 className="font-heading text-lg font-bold">Search is taking a break</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong on our end. Try again in a moment, or browse the map instead.
          </p>
          <Link href="/map" className={`${buttonVariants({ variant: 'default' })} gradient-btn mt-4`}>
            <MapIcon className="mr-1.5 h-4 w-4" />
            Explore the Map
          </Link>
        </div>
      ) : !query ? (
        <p className="text-center text-sm text-muted-foreground">
          Try a place (“Wayanad”), a category (“waterfalls”), or a spot name.
        </p>
      ) : results.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-card p-8 text-center">
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h2 className="mt-3 font-heading text-lg font-bold">No matches yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            “{query}” isn’t on the map yet — hidden gems stay hidden until someone shares them.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/add-spot" className={`${buttonVariants({ variant: 'default' })} gradient-btn`}>
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Add this spot
            </Link>
            <Link href="/map" className={buttonVariants({ variant: 'outline' })}>
              <MapIcon className="mr-1.5 h-4 w-4" />
              Browse the map
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Matching places / categories */}
          {places.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Places & Categories
              </h2>
              <div className="flex flex-wrap gap-3">
                {places.map((r) => {
                  const Icon = KIND_ICON[r.kind as keyof typeof KIND_ICON] ?? Compass
                  return (
                    <Link
                      key={`${r.kind}-${r.url}`}
                      href={r.url}
                      className="group flex items-center gap-2.5 rounded-full border border-border/50 bg-card px-4 py-2 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5"
                    >
                      <Icon className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-semibold group-hover:text-emerald-500">{r.title}</span>
                      {r.subtitle && <span className="text-xs text-muted-foreground">{r.subtitle}</span>}
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Matching spots */}
          {spots.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {spots.length} {spots.length === 1 ? 'Spot' : 'Spots'}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {spots.map((r) => (
                  <Link key={r.url} href={r.url} className="group">
                    <div className="glass h-full overflow-hidden rounded-2xl border border-white/5 bg-card transition-all duration-300 hover:border-emerald-500/35 group-hover:-translate-y-1 group-hover:shadow-xl">
                      <div className="relative h-44 w-full overflow-hidden">
                        {r.image ? (
                          <Image
                            src={r.image}
                            alt={r.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-muted">
                            <Film className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="line-clamp-1 font-heading text-base font-bold transition-colors group-hover:text-emerald-500">
                          {r.title}
                        </h3>
                        {r.subtitle && (
                          <div className="mt-1 flex items-center text-xs text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {r.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
