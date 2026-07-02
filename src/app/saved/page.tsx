import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { RemoveSavedButton } from '@/components/spot/remove-saved-button'
import { Bookmark, MapPin, Sparkles, Map as MapIcon, LogIn } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Saved Spots | HiddenSpot',
  robots: { index: false },
}

interface SavedRow {
  id: string
  collection_name: string
  spot: {
    id: string
    title: string
    slug: string
    cover_image: string
    verification_score: number
    state: { name: string; slug: string } | null
    district: { name: string; slug: string } | null
    category: { name: string } | null
  } | null
}

export default async function SavedSpotsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <Bookmark className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-extrabold">Your saved spots live here</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to build your personal shortlist of hidden gems for the next trip.
        </p>
        <Link
          href="/?auth=required"
          className={`${buttonVariants({ variant: 'default' })} gradient-btn mt-6 gap-1.5`}
        >
          <LogIn className="h-4 w-4" />
          Sign in
        </Link>
      </div>
    )
  }

  const { data } = await supabase
    .from('saved_spots')
    .select(
      `
      id, collection_name,
      spot:spots(
        id, title, slug, cover_image, verification_score,
        state:states(name, slug),
        district:districts(name, slug),
        category:categories(name)
      )
    `
    )
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  // RLS nulls out spots that are no longer publicly visible.
  const saved = ((data ?? []) as unknown as SavedRow[]).filter((row) => row.spot)

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-500">
            <Bookmark className="h-4 w-4" />
            Your Collection
          </div>
          <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight">Saved Spots</h1>
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          {saved.length} {saved.length === 1 ? 'spot' : 'spots'}
        </span>
      </div>

      {saved.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-card p-8 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h2 className="mt-3 font-heading text-lg font-bold">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap “Save Spot” on any place that catches your eye and it will wait for you here.
          </p>
          <Link
            href="/map"
            className={`${buttonVariants({ variant: 'default' })} gradient-btn mt-5`}
          >
            <MapIcon className="mr-1.5 h-4 w-4" />
            Find spots on the map
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map(({ id, spot }) => {
            if (!spot) return null
            const href = `/${spot.state?.slug}/${spot.district?.slug}/${spot.slug}`
            return (
              <Link key={id} href={href} className="group relative">
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
                    <div className="absolute right-3 top-3">
                      <RemoveSavedButton savedId={id} spotTitle={spot.title} />
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                      {spot.category?.name}
                    </span>
                    <h3 className="mt-1 line-clamp-1 font-heading text-base font-bold transition-colors group-hover:text-emerald-500">
                      {spot.title}
                    </h3>
                    <div className="mt-2 flex items-center border-t border-border/40 pt-2 text-xs text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {spot.district?.name}, {spot.state?.name}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
