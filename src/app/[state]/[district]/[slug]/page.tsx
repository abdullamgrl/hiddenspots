import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Compass,
  MapPin,
  Clock,
  Sparkles,
  Award,
  Calendar,
  DollarSign,
  Car,
  Users,
  Compass as HikeIcon,
  ShieldAlert,
  ArrowLeft,
  Share2,
} from 'lucide-react'
import DynamicMap from '@/components/map/map-wrapper'
import { InstagramEmbed } from '@/components/spot/instagram-embed'
import { SaveButton } from '@/components/spot/save-button'
import { ReportDialog } from '@/components/spot/report-dialog'

interface PageProps {
  params: Promise<{
    state: string
    district: string
    slug: string
  }>
}

// 1. Fetch Spot Helper
async function getSpot(slug: string) {
  const supabase = await createClient()
  const { data: spot } = await supabase
    .from('spots')
    .select(`
      *,
      category:categories(id, name, slug),
      state:states(id, name, slug),
      district:districts(id, name, slug),
      creator:profiles(id, username, full_name, reputation_score),
      spot_images(*),
      spot_social_links(*)
    `)
    .eq('slug', slug)
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .maybeSingle()

  return spot
}

// 2. Generate Dynamic Metadata (SEO)
export async function generateMetadata({ params }: PageProps) {
  const { state, district, slug } = await params
  const spot = await getSpot(slug)
  if (!spot) return { title: 'Spot Not Found | HiddenSpot' }

  const url = `https://hiddenspot.in/${state}/${district}/${slug}`

  return {
    title: `${spot.title} — Hidden Gem in ${spot.district.name}, ${spot.state.name}`,
    description: spot.short_description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${spot.title} | HiddenSpot`,
      description: spot.short_description,
      url: url,
      images: [{ url: spot.cover_image }],
      type: 'article',
    },
  }
}

export default async function SpotDetailPage({ params }: PageProps) {
  const { state, district, slug } = await params
  const spot = await getSpot(slug)

  if (!spot) {
    notFound()
  }

  const supabase = await createClient()

  // Authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Fetch Nearby Spots in Same District
  const { data: nearbySpots } = await supabase
    .from('spots')
    .select(`
      id, title, slug, cover_image, verification_score,
      state:states(name, slug),
      district:districts(name, slug),
      category:categories(name)
    `)
    .eq('district_id', spot.district_id)
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .neq('id', spot.id)
    .limit(3)

  // 4. JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Place',
        '@id': `https://hiddenspot.in/${state}/${district}/${slug}#place`,
        'name': spot.title,
        'description': spot.short_description,
        'image': spot.cover_image,
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': spot.latitude,
          'longitude': spot.longitude,
        },
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': spot.district.name,
          'addressRegion': spot.state.name,
          'addressCountry': 'India',
          'streetAddress': spot.address,
        },
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://hiddenspot.in',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': spot.state.name,
            'item': `https://hiddenspot.in/${spot.state.slug}`,
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': spot.district.name,
            'item': `https://hiddenspot.in/${spot.state.slug}/${spot.district.slug}`,
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': spot.title,
            'item': `https://hiddenspot.in/${spot.state.slug}/${spot.district.slug}/${spot.slug}`,
          },
        ],
      },
    ],
  }

  // Active Social links (e.g. Instagram oEmbed)
  const instagramLink = spot.spot_social_links?.find(
    (link: any) => link.platform === 'instagram'
  )

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center space-x-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Explore</Link>
          <span>/</span>
          <Link href={`/${spot.state.slug}`} className="hover:text-emerald-600 transition-colors">
            {spot.state.name}
          </Link>
          <span>/</span>
          <Link href={`/${spot.state.slug}/${spot.district.slug}`} className="hover:text-emerald-600 transition-colors">
            {spot.district.name}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{spot.title}</span>
        </nav>

        {/* Hero Section */}
        <div className="relative h-[300px] md:h-[450px] w-full rounded-3xl overflow-hidden shadow-lg border border-border/50 mb-8">
          <Image
            src={spot.cover_image}
            alt={spot.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

          {/* Floaters on cover */}
          <div className="absolute top-6 left-6">
            <Link href="/" className="inline-flex items-center space-x-2 rounded-full bg-black/60 hover:bg-black/80 text-white px-4 py-2 text-sm font-semibold transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider">
                  {spot.category.name}
                </span>
                <span className="flex items-center space-x-1 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-xs font-semibold">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>{spot.verification_score} Score</span>
                </span>
              </div>
              <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight">
                {spot.title}
              </h1>
              <div className="flex items-center text-sm text-white/80">
                <MapPin className="h-4 w-4 mr-1.5 text-emerald-400" />
                <span>{spot.address}</span>
              </div>
            </div>

            {/* Actions for User */}
            <div className="flex items-center space-x-3">
              <SaveButton spotId={spot.id} userId={user?.id} />
              <ReportDialog spotId={spot.id} userId={user?.id} />
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold">About this Gem</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {spot.description}
              </p>
            </section>

            {/* Gallery images */}
            {spot.spot_images && spot.spot_images.length > 1 && (
              <section className="space-y-4">
                <h2 className="font-heading text-xl font-bold">Location Photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {spot.spot_images
                    .filter((img: any) => !img.is_cover)
                    .map((img: any) => (
                      <div key={img.id} className="relative h-32 md:h-40 rounded-xl overflow-hidden border border-border/50 shadow-sm hover:opacity-90 transition-opacity">
                        <Image
                          src={img.image_url}
                          alt="Spot Gallery"
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Travel Information Checklist */}
            <section className="space-y-4">
              <h2 className="font-heading text-xl font-bold">Traveler Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border/50 bg-card flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Best Time</div>
                    <div className="text-sm font-semibold mt-0.5">{spot.best_time_to_visit || 'Anytime'}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/50 bg-card flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Visit Duration</div>
                    <div className="text-sm font-semibold mt-0.5">{spot.estimated_visit_duration || '1-2 Hours'}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/50 bg-card flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Entry Fee</div>
                    <div className="text-sm font-semibold mt-0.5">
                      {spot.entry_fee > 0 ? `₹${spot.entry_fee}` : 'Free Entry'}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/50 bg-card flex items-start space-x-3">
                  <Car className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Parking</div>
                    <div className="text-sm font-semibold mt-0.5">
                      {spot.parking_available ? 'Available' : 'No Dedicated Space'}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/50 bg-card flex items-start space-x-3">
                  <Users className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Family & Pets</div>
                    <div className="text-sm font-semibold mt-0.5">
                      {spot.family_friendly ? 'Family Friendly' : 'Adventure Only'}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/50 bg-card flex items-start space-x-3">
                  <HikeIcon className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Requires Trek</div>
                    <div className="text-sm font-semibold mt-0.5">
                      {spot.requires_trek ? `Yes (${spot.trek_distance_km} km)` : 'Road Accessible'}
                    </div>
                  </div>
                </div>
              </div>

              {spot.safety_notes && (
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 flex items-start space-x-3 text-sm">
                  <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Safety & Advisory Notes</div>
                    <p className="mt-1 text-muted-foreground">{spot.safety_notes}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Instagram reel embed */}
            {instagramLink && (
              <section className="space-y-4">
                <h2 className="font-heading text-xl font-bold">Social Preview</h2>
                <InstagramEmbed url={instagramLink.url} />
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Map Preview */}
            <section className="space-y-3">
              <h3 className="font-heading text-lg font-bold">Interactive Location</h3>
              <div className="h-72 w-full rounded-2xl overflow-hidden border border-border/50 shadow-md">
                <DynamicMap
                  spots={[
                    {
                      id: spot.id,
                      title: spot.title,
                      slug: spot.slug,
                      latitude: spot.latitude,
                      longitude: spot.longitude,
                      cover_image: spot.cover_image,
                      verification_score: spot.verification_score,
                      district: spot.district.name,
                      state: spot.state.name,
                      category: { name: spot.category.name },
                    },
                  ]}
                  center={[spot.longitude, spot.latitude]}
                  zoom={11}
                  interactive={true}
                />
              </div>
            </section>

            {/* Contributor Panel */}
            {spot.creator && (
              <section className="p-6 rounded-2xl border border-border/50 bg-card shadow-sm space-y-4">
                <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">Submitted By</h4>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    {spot.creator.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <Link href={`/profile/${spot.creator.username}`} className="font-bold hover:text-emerald-600 transition-colors">
                      {spot.creator.full_name || 'Anonymous Contributor'}
                    </Link>
                    <div className="text-xs text-muted-foreground font-medium">@{spot.creator.username}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 pt-2 border-t border-border/50 text-xs">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="font-bold text-amber-500">{spot.creator.reputation_score} Reputation Points</span>
                </div>
              </section>
            )}

            {/* Nearby Spots recommendations */}
            {nearbySpots && nearbySpots.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-heading text-lg font-bold">Nearby Hidden Gems</h3>
                <div className="space-y-3">
                  {nearbySpots.map((nSpot: any) => (
                    <Link
                      key={nSpot.id}
                      href={`/${nSpot.state.slug}/${nSpot.district.slug}/${nSpot.slug}`}
                      className="flex items-center space-x-3 group"
                    >
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-border/50 flex-shrink-0">
                        <Image
                          src={nSpot.cover_image}
                          alt={nSpot.title}
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors truncate">
                          {nSpot.title}
                        </h4>
                        <div className="text-xs text-muted-foreground">{nSpot.category.name}</div>
                        <div className="flex items-center text-[10px] text-amber-500 font-semibold mt-0.5">
                          <Sparkles className="h-3 w-3 mr-0.5" />
                          <span>{nSpot.verification_score} verification score</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
