import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Sparkles,
  MapPin,
  Compass,
  Award,
  Bookmark,
  Pencil,
  Mountain,
  Flag,
} from 'lucide-react'
import { ShareButton } from '@/components/spot/share-button'
import { buttonVariants } from '@/components/ui/button'
import { first, type SpotCardRow, type SpotCardResolved } from '@/lib/spot-types'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

// Explorer ranks derived purely from reputation_score — no schema changes.
// Visible progression is the cheapest retention mechanic there is.
const LEVELS = [
  { name: 'Wanderer', min: 0 },
  { name: 'Pathfinder', min: 50 },
  { name: 'Trailblazer', min: 150 },
  { name: 'Local Legend', min: 300 },
] as const

function explorerLevel(rep: number) {
  let idx = 0
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (rep >= LEVELS[i].min) {
      idx = i
      break
    }
  }
  const current = LEVELS[idx]
  const next = LEVELS[idx + 1] ?? null
  const progress = next
    ? Math.min(100, Math.round(((rep - current.min) / (next.min - current.min)) * 100))
    : 100
  return { current, next, progress }
}

async function getProfile(username: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  return profile
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params
  const profile = await getProfile(username)
  if (!profile) return { title: 'Profile Not Found | HiddenSpot' }

  return {
    title: `${profile.full_name || username} (@${profile.username}) — Traveler Profile`,
    description: `Discover travel spots contributed by ${profile.full_name || username} on HiddenSpot.in.`,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const profile = await getProfile(username)

  if (!profile) {
    notFound()
  }

  const supabase = await createClient()

  // Authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === profile.id

  // Fetch spots contributed by this profile
  // If owner, see all spots (including draft, pending, rejected). Else, see only approved spots.
  const query = supabase
    .from('spots')
    .select(`
      id, title, slug, cover_image, status, verification_score, created_at,
      state:states(name, slug),
      district:districts(name, slug),
      category:categories(name)
    `)
    .eq('created_by', profile.id)
    .eq('is_deleted', false)

  if (!isOwner) {
    query.eq('status', 'approved')
  }

  const { data: spots } = await query.order('created_at', { ascending: false })

  const statusCount = (status: string) =>
    spots?.filter((s) => s.status === status).length || 0
  const approvedSpotsCount = statusCount('approved')
  const districtsExplored = new Set(
    (spots ?? [])
      .filter((s) => s.status === 'approved')
      .map((s) => first((s as unknown as SpotCardRow).district)?.slug)
      .filter(Boolean)
  ).size

  const level = explorerLevel(profile.reputation_score)
  const joined = new Date(profile.created_at).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const stats = [
    { icon: Award, value: approvedSpotsCount, label: 'Approved Gems' },
    { icon: MapPin, value: districtsExplored, label: districtsExplored === 1 ? 'District Explored' : 'Districts Explored' },
    { icon: Compass, value: spots?.length || 0, label: 'Submissions' },
    { icon: Sparkles, value: profile.reputation_score, label: 'Reputation' },
  ]

  return (
    <div className="pb-16">
      {/* ---- Identity hero: full-bleed banner, avatar overlapping its edge ---- */}
      <div className="relative h-44 sm:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-[#22343c] to-[#3A4B63]" />
        <div className="absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-sunset/15 blur-[90px]" />
        <div className="absolute -top-10 left-1/4 h-48 w-48 rounded-full bg-primary/10 blur-[80px]" />
        {/* faint contour texture */}
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:22px_22px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-14 sm:-mt-16 flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:justify-between">
          {/* Avatar + name */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || profile.username}
                width={112}
                height={112}
                className="h-28 w-28 rounded-full border-4 border-background object-cover shadow-xl"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-secondary to-[#22343c] font-heading text-4xl font-bold text-primary shadow-xl">
                {(profile.full_name || profile.username)?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="pb-1 text-center sm:text-left">
              <div className="eyebrow-script">exploring since {joined.toLowerCase()}</div>
              <h1 className="mt-1 font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
                {profile.full_name || 'Traveler Contributor'}
              </h1>
              <p className="mt-0.5 font-medium text-muted-foreground">@{profile.username}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pb-1">
            <ShareButton
              title={`${profile.full_name || profile.username} on HiddenSpot`}
              text={`Hidden gems shared by @${profile.username}`}
            />
            {isOwner && (
              <>
                <Link
                  href="/saved"
                  className={`${buttonVariants({ variant: 'outline', size: 'sm' })} gap-1.5 border-border/50 font-medium text-muted-foreground hover:text-foreground`}
                >
                  <Bookmark className="h-4 w-4" />
                  Saved
                </Link>
                <Link
                  href="/settings"
                  className={`${buttonVariants({ variant: 'outline', size: 'sm' })} gap-1.5 border-border/50 font-medium text-muted-foreground hover:text-foreground`}
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </Link>
              </>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed text-muted-foreground sm:mx-0 sm:text-left">
            {profile.bio}
          </p>
        )}

        {/* ---- Explorer level ---- */}
        <div className="mt-8 rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sunset/15 text-sunset">
                <Mountain className="h-4.5 w-4.5" />
              </span>
              <div>
                <div className="font-heading text-base font-bold">{level.current.name}</div>
                <div className="text-xs text-muted-foreground">
                  {level.next
                    ? `${level.next.min - profile.reputation_score} rep to ${level.next.name}`
                    : 'Highest explorer rank'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Joined {joined}
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-sunset transition-all duration-700"
              style={{ width: `${level.progress}%` }}
            />
          </div>
        </div>

        {/* ---- Stat tiles ---- */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-border/50 bg-card p-4 text-center transition-colors hover:border-primary/40"
            >
              <Icon className="mx-auto h-4.5 w-4.5 text-primary" />
              <div className="mt-2 font-heading text-2xl font-extrabold tabular-nums">{value}</div>
              <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ---- Contributions ---- */}
        <div className="mt-12 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/50 pb-4">
            <div>
              <div className="eyebrow-script">gems on the map</div>
              <h2 className="mt-1 font-heading text-2xl font-bold">
                {isOwner ? 'Your Submissions' : `Shared by ${profile.full_name || username}`}
              </h2>
            </div>
            {/* Owner: status at a glance */}
            {isOwner && (spots?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {approvedSpotsCount > 0 && (
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-brand dark:text-brand-cream">
                    {approvedSpotsCount} approved
                  </span>
                )}
                {statusCount('pending') > 0 && (
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-500">
                    {statusCount('pending')} pending
                  </span>
                )}
                {statusCount('rejected') > 0 && (
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-red-400">
                    {statusCount('rejected')} rejected
                  </span>
                )}
              </div>
            )}
          </div>

          {spots && spots.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(spots as unknown as SpotCardResolved[]).map((spot) => {
                const approved = spot.status === 'approved'
                const card = (
                  <div
                    className={`glass h-full overflow-hidden rounded-2xl border border-white/5 bg-card transition-all duration-300 ${
                      approved
                        ? 'group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-sunset/10 group-hover:brightness-[1.06] hover:border-brand/35'
                        : 'opacity-90'
                    }`}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={spot.cover_image}
                        alt={spot.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={`object-cover transition-transform duration-500 ${approved ? 'group-hover:scale-105' : ''}`}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center space-x-1 rounded-full bg-brand/90 px-2 py-0.5 text-xs font-semibold text-white">
                        <Sparkles className="h-3 w-3" />
                        <span>{spot.verification_score} Score</span>
                      </div>
                      {isOwner && !approved && (
                        <div className="absolute top-3 right-3">
                          {spot.status === 'pending' && (
                            <Badge className="bg-amber-500 text-white hover:bg-amber-600">Pending Review</Badge>
                          )}
                          {spot.status === 'rejected' && (
                            <Badge className="bg-red-500 text-white hover:bg-red-600">Rejected</Badge>
                          )}
                          {spot.status === 'draft' && (
                            <Badge variant="outline" className="bg-background/80 backdrop-blur-md">Draft</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 p-5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-brand-cream">
                        {spot.category.name}
                      </span>
                      <h3 className="line-clamp-1 font-heading text-lg font-bold text-foreground transition-colors group-hover:text-brand">
                        {spot.title}
                      </h3>
                      <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="mr-1 h-3.5 w-3.5" />
                          {spot.district.name}, {spot.state.name}
                        </span>
                        <span>{new Date(spot.created_at!).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                )

                // Approved spots: the whole card is the tap target.
                return approved ? (
                  <Link
                    key={spot.id}
                    href={`/${spot.state.slug}/${spot.district.slug}/${spot.slug}`}
                    className="group"
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={spot.id}>{card}</div>
                )
              })}
            </div>
          ) : (
            <div className="glass rounded-2xl border border-dashed border-border/50 bg-muted/20 py-20 text-center">
              <Flag className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="font-heading text-lg font-bold">No Gems Shared Yet</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                {isOwner
                  ? 'Share your first hidden gem and start climbing the explorer ranks.'
                  : `${profile.full_name || username} hasn’t shared any spots yet.`}
              </p>
              {isOwner && (
                <Link
                  href="/add-spot"
                  className={`${buttonVariants({ variant: 'default' })} gradient-btn mt-5 gap-1.5`}
                >
                  <Compass className="h-4 w-4" />
                  Add Your First Spot
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
