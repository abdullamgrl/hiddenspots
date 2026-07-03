import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { ShareButton } from '@/components/spot/share-button'
import { Globe, MapPin, Sparkles, Map as MapIcon, User } from 'lucide-react'

interface CollectionPageProps {
  params: Promise<{ username: string; slug: string }>
}

type NameSlug = { name: string; slug: string }

interface CollectionSpot {
  id: string
  title: string
  slug: string
  cover_image: string
  verification_score: number
  best_time_to_visit: string | null
  state: NameSlug | NameSlug[] | null
  district: NameSlug | NameSlug[] | null
  category: { name: string } | { name: string }[] | null
}

const first = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)

async function getCollection(username: string, slug: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .eq('username', username)
    .maybeSingle()
  if (!profile) return null

  // RLS: public collections are world-readable; owners can also see their own
  // private ones (useful for previewing before sharing).
  const { data: collection } = await supabase
    .from('collections')
    .select('id, name, slug, description, is_public, created_at')
    .eq('profile_id', profile.id)
    .eq('slug', slug)
    .maybeSingle()
  if (!collection) return null

  return { profile, collection }
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { username, slug } = await params
  const data = await getCollection(username, slug)
  if (!data) return { title: 'Collection Not Found | HiddenSpot' }
  return {
    title: `${data.collection.name} — a collection by @${data.profile.username} | HiddenSpot`,
    description:
      data.collection.description ||
      `Hidden gems hand-picked by ${data.profile.full_name || data.profile.username} on HiddenSpot.`,
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { username, slug } = await params
  const data = await getCollection(username, slug)
  if (!data) notFound()

  const { profile, collection } = data
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('saved_spots')
    .select(
      `
      id,
      spot:spots(
        id, title, slug, cover_image, verification_score, best_time_to_visit,
        state:states(name, slug),
        district:districts(name, slug),
        category:categories(name)
      )
    `
    )
    .eq('collection_id', collection.id)
    .order('created_at', { ascending: false })

  const spots = ((items ?? []) as unknown as { spot: CollectionSpot | null }[])
    .map((row) => row.spot)
    .filter((s): s is CollectionSpot => s !== null)

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 space-y-4 border-b border-border/50 pb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-500">
          <Globe className="h-4 w-4" />
          {collection.is_public ? 'Shared Collection' : 'Private Preview — only you can see this'}
        </div>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">{collection.name}</h1>
        {collection.description && (
          <p className="max-w-xl text-muted-foreground">{collection.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-2 text-sm font-semibold transition-colors hover:text-emerald-500"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 font-bold text-emerald-500">
              {(profile.full_name || profile.username)?.charAt(0).toUpperCase()}
            </span>
            Curated by {profile.full_name || `@${profile.username}`}
          </Link>
          <span className="text-sm text-muted-foreground">
            {spots.length} {spots.length === 1 ? 'spot' : 'spots'}
          </span>
          {collection.is_public && (
            <ShareButton
              title={`${collection.name} — HiddenSpot collection`}
              text={`Hidden gems hand-picked by @${profile.username}`}
            />
          )}
        </div>
      </div>

      {/* Spots */}
      {spots.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-card p-8 text-center">
          <User className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h2 className="mt-3 font-heading text-lg font-bold">Nothing here yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This collection is still being curated. Check back soon, or explore the map meanwhile.
          </p>
          <Link href="/map" className={`${buttonVariants({ variant: 'default' })} gradient-btn mt-5`}>
            <MapIcon className="mr-1.5 h-4 w-4" />
            Explore the Map
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((spot) => {
            const state = first(spot.state)
            const district = first(spot.district)
            const category = first(spot.category)
            return (
              <Link
                key={spot.id}
                href={`/${state?.slug}/${district?.slug}/${spot.slug}`}
                className="group"
              >
                <div className="glass h-full overflow-hidden rounded-2xl border border-white/5 bg-card transition-all duration-300 hover:border-emerald-500/35 group-hover:-translate-y-1 group-hover:shadow-xl">
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={spot.cover_image}
                      alt={spot.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 flex items-center space-x-1 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-xs font-semibold text-white">
                      <Sparkles className="h-3 w-3" />
                      <span>{spot.verification_score} Score</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                      {category?.name}
                    </span>
                    <h3 className="mt-1 line-clamp-1 font-heading text-base font-bold transition-colors group-hover:text-emerald-500">
                      {spot.title}
                    </h3>
                    <div className="mt-2 flex items-center border-t border-border/40 pt-2 text-xs text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {district?.name}, {state?.name}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* CTA for visitors */}
      <div className="mt-14 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
        <h2 className="font-heading text-xl font-extrabold">Build your own collection</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Save the spots you love, organise them into trips, and share them with friends — free.
        </p>
        <Link href="/map" className={`${buttonVariants({ variant: 'default' })} gradient-btn mt-5`}>
          <MapIcon className="mr-1.5 h-4 w-4" />
          Start Exploring
        </Link>
      </div>
    </div>
  )
}
