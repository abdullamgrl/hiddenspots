import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Sparkles, MapPin, Compass, Award, ExternalLink, Bookmark, Pencil } from 'lucide-react'
import { ShareButton } from '@/components/spot/share-button'
import { buttonVariants } from '@/components/ui/button'
import { first, type SpotCardRow, type SpotCardResolved } from '@/lib/spot-types'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
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

  const approvedSpotsCount = spots?.filter((s) => s.status === 'approved').length || 0
  const districtsExplored = new Set(
    (spots ?? [])
      .filter((s) => s.status === 'approved')
      .map((s) => first((s as unknown as SpotCardRow).district)?.slug)
      .filter(Boolean)
  ).size

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Profile Header Card */}
      <Card className="glass shadow-xl overflow-hidden border-border/50 mb-12">
        <CardContent className="p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-10">
          <div className="h-28 w-28 rounded-full bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-4xl shadow-md border-2 border-emerald-600/20">
            {profile.full_name?.charAt(0) || 'U'}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
                {profile.full_name || 'Traveler Contributor'}
              </h1>
              <p className="text-muted-foreground font-medium mt-0.5">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground/90 leading-relaxed mt-3 max-w-md mx-auto md:mx-0">
                  {profile.bio}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1.5">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Compass className="h-4 w-4 text-emerald-600" />
                <span>{spots?.length || 0} Submissions</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Award className="h-4 w-4 text-emerald-600" />
                <span>{approvedSpotsCount} Approved Gems</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>{districtsExplored} {districtsExplored === 1 ? 'District' : 'Districts'} Explored</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="inline-flex items-center space-x-2 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-400 px-4 py-2 text-sm font-semibold border border-amber-500/20">
                <Sparkles className="h-4 w-4" />
                <span>{profile.reputation_score} Reputation Score</span>
              </div>
              <ShareButton
                title={`${profile.full_name || profile.username} on HiddenSpot`}
                text={`Hidden gems shared by @${profile.username}`}
              />
              {isOwner && (
                <>
                  <Link href="/saved" className={`${buttonVariants({ variant: 'outline', size: 'sm' })} gap-1.5 border-border/50 font-medium text-muted-foreground hover:text-foreground`}>
                    <Bookmark className="h-4 w-4" />
                    Saved Spots
                  </Link>
                  <Link href="/settings" className={`${buttonVariants({ variant: 'outline', size: 'sm' })} gap-1.5 border-border/50 font-medium text-muted-foreground hover:text-foreground`}>
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                  </Link>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contributions Grid */}
      <div className="space-y-6">
        <h2 className="font-heading text-2xl font-bold border-b border-border/50 pb-3">
          {isOwner ? 'Your Submissions' : `Gems Shared by ${profile.full_name || username}`}
        </h2>

        {spots && spots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(spots as unknown as SpotCardResolved[]).map((spot) => (
              <Card key={spot.id} className="glass overflow-hidden shadow-md border-border/50 group hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 w-full">
                  <Image
                    src={spot.cover_image}
                    alt={spot.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Verification float */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1 rounded-full bg-emerald-600/90 text-white px-2 py-0.5 text-xs font-semibold">
                    <Sparkles className="h-3 w-3" />
                    <span>{spot.verification_score} Score</span>
                  </div>

                  {/* Status Badge for Owner view */}
                  {isOwner && (
                    <div className="absolute top-3 right-3">
                      {spot.status === 'approved' && (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Approved</Badge>
                      )}
                      {spot.status === 'pending' && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Pending Review</Badge>
                      )}
                      {spot.status === 'rejected' && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white">Rejected</Badge>
                      )}
                      {spot.status === 'draft' && (
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-md">Draft</Badge>
                      )}
                    </div>
                  )}
                </div>

                <CardContent className="p-5 space-y-3">
                  <span className="text-xs text-emerald-600 dark:text-teal-400 font-semibold uppercase tracking-wider">
                    {spot.category.name}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-foreground line-clamp-1">
                    {spot.title}
                  </h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>{spot.district.name}, {spot.state.name}</span>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                    <span>Added {new Date(spot.created_at!).toLocaleDateString('en-IN')}</span>
                    {spot.status === 'approved' && (
                      <Link
                        href={`/${spot.state.slug}/${spot.district.slug}/${spot.slug}`}
                        className="inline-flex items-center text-emerald-600 dark:text-teal-400 font-semibold hover:underline"
                      >
                        <span>View Gem</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl bg-muted/20 border border-dashed border-border/50 glass">
            <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
            <h3 className="font-heading text-lg font-bold">No Gems Shared Yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
              {isOwner
                ? 'Share your first hidden gem and start building your explorer reputation.'
                : `${profile.full_name || username} hasn’t shared any spots yet.`}
            </p>
            {isOwner && (
              <Link
                href="/add-spot"
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-500"
              >
                <Compass className="h-4 w-4" />
                Add Your First Spot
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
