import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Sparkles, Compass } from 'lucide-react'
import DynamicMap from '@/components/map/map-wrapper'

interface DistrictPageProps {
  params: Promise<{
    state: string
    district: string
  }>
}

async function getDistrictAndState(stateSlug: string, districtSlug: string) {
  const supabase = await createClient()
  
  const { data: state } = await supabase
    .from('states')
    .select('*')
    .eq('slug', stateSlug)
    .maybeSingle()

  if (!state) return null

  const { data: district } = await supabase
    .from('districts')
    .select('*')
    .eq('state_id', state.id)
    .eq('slug', districtSlug)
    .maybeSingle()

  if (!district) return null

  return { state, district }
}

export async function generateMetadata({ params }: DistrictPageProps) {
  const { state, district } = await params
  const data = await getDistrictAndState(state, district)
  if (!data) return { title: 'District Not Found | HiddenSpot' }

  return {
    title: `Offbeat Travel Spots in ${data.district.name}, ${data.state.name} — HiddenSpot.in`,
    description: `Discover waterfalls, viewpoints, and campsites in ${data.district.name} district. Real pictures, coordinate directions, and travel details.`,
    alternates: {
      canonical: `/${state}/${district}`,
    },
  }
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const { state, district } = await params
  const data = await getDistrictAndState(state, district)

  if (!data) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch approved spots in this district
  const { data: spots } = await supabase
    .from('spots')
    .select(`
      id, title, slug, cover_image, verification_score, latitude, longitude,
      state:states(name, slug),
      district:districts(name, slug),
      category:categories(name)
    `)
    .eq('district_id', data.district.id)
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

  // Calculate average coordinates for centering the map
  const hasSpots = mappedSpots.length > 0
  const avgLat = hasSpots ? mappedSpots.reduce((acc, s) => acc + s.latitude, 0) / mappedSpots.length : 11.68
  const avgLng = hasSpots ? mappedSpots.reduce((acc, s) => acc + s.longitude, 0) / mappedSpots.length : 76.13

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Explore</Link>
        <span>/</span>
        <Link href={`/${data.state.slug}`} className="hover:text-emerald-600 transition-colors">
          {data.state.name}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{data.district.name}</span>
      </nav>

      {/* Header */}
      <div className="space-y-2 border-b border-border/50 pb-6">
        <div className="text-emerald-600 dark:text-teal-400 text-sm font-semibold uppercase tracking-wider">
          District Directory
        </div>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">
          Gems in {data.district.name}
        </h1>
        <p className="text-muted-foreground">
          Browse {spots?.length || 0} community-contributed secret locations and scenic getaways in {data.district.name}, {data.state.name}.
        </p>
      </div>

      {/* Mapbox centered on district */}
      {hasSpots && (
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold">Map of {data.district.name}</h2>
          <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-border/50 shadow-md">
            <DynamicMap spots={mappedSpots} center={[avgLng, avgLat]} zoom={10} />
          </div>
        </section>
      )}

      {/* Spot Grid */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-bold">Destinations worth visiting</h2>
        {hasSpots ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mappedSpots.map((spot: any) => (
              <Link
                key={spot.id}
                href={`/${data.state.slug}/${data.district.slug}/${spot.slug}`}
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
            <h3 className="font-heading text-lg font-bold">No Spots in {data.district.name}</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
              Be the first to share a beautiful travel spot in {data.district.name}!
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
