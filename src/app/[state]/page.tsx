import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Sparkles, Compass } from 'lucide-react'
import DynamicMap from '@/components/map/map-wrapper'

interface StatePageProps {
  params: Promise<{
    state: string
  }>
}

async function getState(slug: string) {
  const supabase = await createClient()
  const { data: state } = await supabase
    .from('states')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  return state
}

export async function generateMetadata({ params }: StatePageProps) {
  const { state } = await params
  const stateData = await getState(state)
  if (!stateData) return { title: 'State Not Found | HiddenSpot' }

  return {
    title: `Discover Secluded Travel Gems in ${stateData.name} — HiddenSpot.in`,
    description: `Find community-sourced waterfalls, viewpoints, campsites, and offbeat travel spots in ${stateData.name}. View location maps and photos.`,
    alternates: {
      canonical: `/${state}`,
    },
  }
}

export default async function StatePage({ params }: StatePageProps) {
  const { state } = await params
  const stateData = await getState(state)

  if (!stateData) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch all districts in this state
  const { data: districts } = await supabase
    .from('districts')
    .select('*')
    .eq('state_id', stateData.id)
    .order('name', { ascending: true })

  // Fetch all approved spots in this state
  const { data: spots } = await supabase
    .from('spots')
    .select(`
      id, title, slug, cover_image, verification_score, latitude, longitude,
      state:states(name, slug),
      district:districts(name, slug),
      category:categories(name)
    `)
    .eq('state_id', stateData.id)
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .order('verification_score', { ascending: false })

  // Map raw supabase joins to safe objects for dynamic map typing
  const mappedSpots = spots?.map((s: any) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    cover_image: s.cover_image,
    verification_score: s.verification_score,
    latitude: s.latitude,
    longitude: s.longitude,
    state: Array.isArray(s.state) ? s.state[0] : s.state,
    district: Array.isArray(s.district) ? s.district[0] : s.district,
    category: Array.isArray(s.category) ? s.category[0] : s.category,
  })) || []

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Title */}
      <div className="space-y-2 border-b border-border/50 pb-6">
        <div className="text-emerald-600 dark:text-teal-400 text-sm font-semibold uppercase tracking-wider">
          State Directory
        </div>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">
          Explore {stateData.name}
        </h1>
        <p className="text-muted-foreground">
          Discover {spots?.length || 0} offbeat destinations, visual viewpoints, and hidden treasures in the state of {stateData.name}.
        </p>
      </div>

      {/* Grid: Districts List (Links) */}
      {districts && districts.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold">Select a District</h2>
          <div className="flex flex-wrap gap-2.5">
            {districts.map((dist) => (
              <Link
                key={dist.id}
                href={`/${stateData.slug}/${dist.slug}`}
                className="px-4 py-2 rounded-xl border border-border/50 bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 font-medium text-sm transition-all"
              >
                {dist.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Map displaying all spots in the State */}
      {mappedSpots.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold">Map of {stateData.name} Gems</h2>
          <div className="h-96 w-full rounded-3xl overflow-hidden border border-border/50 shadow-md">
            <DynamicMap spots={mappedSpots} zoom={7} />
          </div>
        </section>
      )}

      {/* Grid: Spot Cards */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-bold">Top Vetted Gems in {stateData.name}</h2>
        {mappedSpots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mappedSpots.map((spot: any) => (
              <Link
                key={spot.id}
                href={`/${stateData.slug}/${spot.district.slug}/${spot.slug}`}
                className="group"
              >
                <Card className="glass overflow-hidden shadow-md border-border/50 group-hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48 w-full">
                    <Image
                      src={spot.cover_image}
                      alt={spot.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center space-x-1 rounded-full bg-emerald-600/90 text-white px-2 py-0.5 text-xs font-semibold">
                      <Sparkles className="h-3 w-3" />
                      <span>{spot.verification_score} Score</span>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <span className="text-xs text-emerald-600 dark:text-teal-400 font-semibold uppercase tracking-wider">
                      {spot.category.name}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-foreground line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {spot.title}
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {spot.district.name}, {spot.state.name}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl bg-muted/20 border border-dashed border-border/50 glass">
            <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
            <h3 className="font-heading text-lg font-bold">No Spots Seeded Yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
              Be the first to share a beautiful travel spot in the state of {stateData.name}!
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
