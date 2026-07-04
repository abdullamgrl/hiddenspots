import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
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
} from 'lucide-react'
import DynamicMap from '@/components/map/map-wrapper'
import { ReelsSection } from '@/components/spot/reels-section'
import { SaveButton } from '@/components/spot/save-button'
import { ReportDialog } from '@/components/spot/report-dialog'
import { SuggestEditDialog } from '@/components/spot/suggest-edit-dialog'
import { ShareButton } from '@/components/spot/share-button'
import { CoordsCard } from '@/components/spot/coords-card'
import type { SpotCardResolved } from '@/lib/spot-types'

interface SpotImage {
  id: string
  image_url: string
  is_cover: boolean
}

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

  const socialLinks = spot.spot_social_links ?? []

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

        {/* Hero Section — immersive cover, content only (actions live below) */}
        <div className="relative h-[340px] md:h-[480px] w-full rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src={spot.cover_image}
            alt={spot.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30" />

          <div className="absolute top-6 left-6">
            <Link href="/" className="inline-flex items-center space-x-2 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 text-white px-4 py-2 text-sm font-semibold transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest">
                {spot.category.name}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-md px-2.5 py-0.5 text-xs font-semibold">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>{spot.verification_score} Verified</span>
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl">
              {spot.title}
            </h1>
            <div className="flex items-center text-sm text-white/75">
              <MapPin className="h-4 w-4 mr-1.5 text-emerald-400 flex-shrink-0" />
              <span className="line-clamp-1">{spot.address}</span>
            </div>
          </div>
        </div>

        {/* Action toolbar */}
        <div className="mt-4 mb-10 flex flex-wrap items-center gap-3">
          <SaveButton spotId={spot.id} userId={user?.id} />
          <ShareButton title={spot.title} text={spot.short_description} />
          <SuggestEditDialog
            spotId={spot.id}
            userId={user?.id}
            current={{
              description: spot.description ?? '',
              short_description: spot.short_description ?? '',
              address: spot.address ?? '',
              best_time_to_visit: spot.best_time_to_visit ?? '',
              estimated_visit_duration: spot.estimated_visit_duration ?? '',
              difficulty_level: spot.difficulty_level ?? '',
              entry_fee: Number(spot.entry_fee ?? 0),
              parking_available: !!spot.parking_available,
              family_friendly: !!spot.family_friendly,
              pet_friendly: !!spot.pet_friendly,
              requires_trek: !!spot.requires_trek,
              trek_distance_km: Number(spot.trek_distance_km ?? 0),
              safety_notes: spot.safety_notes ?? '',
            }}
          />
          <ReportDialog spotId={spot.id} userId={user?.id} />
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-14">
            {/* Description */}
            <section className="space-y-4">
              <SectionHeader eyebrow="The story" title="About this Gem" />
              <p className="max-w-prose text-[15px] leading-7 text-muted-foreground whitespace-pre-line">
                {spot.description}
              </p>
            </section>

            {/* Gallery images — first shot featured, rest tile around it */}
            {spot.spot_images && spot.spot_images.length > 1 && (
              <section className="space-y-4">
                <SectionHeader eyebrow="Gallery" title="Location Photos" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 [grid-auto-rows:110px] md:[grid-auto-rows:130px]">
                  {spot.spot_images
                    .filter((img: SpotImage) => !img.is_cover)
                    .map((img: SpotImage, idx: number) => (
                      <div
                        key={img.id}
                        className={`group relative overflow-hidden rounded-2xl ${
                          idx === 0 ? 'col-span-2 row-span-2' : ''
                        }`}
                      >
                        <Image
                          src={img.image_url}
                          alt={`${spot.title} photo ${idx + 1}`}
                          fill
                          sizes={idx === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Travel Information — one quiet facts panel, hairline dividers */}
            <section className="space-y-4">
              <SectionHeader eyebrow="Know before you go" title="Traveler Information" />
              <div className="overflow-hidden rounded-2xl border border-border/40">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border/40">
                  <FactCell icon={<Calendar className="h-4 w-4" />} label="Best Time" value={spot.best_time_to_visit || 'Anytime'} />
                  <FactCell icon={<Clock className="h-4 w-4" />} label="Visit Duration" value={spot.estimated_visit_duration || '1-2 Hours'} />
                  <FactCell icon={<DollarSign className="h-4 w-4" />} label="Entry Fee" value={spot.entry_fee > 0 ? `₹${spot.entry_fee}` : 'Free Entry'} />
                  <FactCell icon={<Car className="h-4 w-4" />} label="Parking" value={spot.parking_available ? 'Available' : 'No Dedicated Space'} />
                  <FactCell icon={<Users className="h-4 w-4" />} label="Family & Pets" value={spot.family_friendly ? 'Family Friendly' : 'Adventure Only'} />
                  <FactCell icon={<HikeIcon className="h-4 w-4" />} label="Requires Trek" value={spot.requires_trek ? `Yes (${spot.trek_distance_km} km)` : 'Road Accessible'} />
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

            {/* All reels + social links for this spot */}
            <ReelsSection links={socialLinks} />
          </div>

          {/* Right Sidebar — sticks alongside the long content column */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Map Preview */}
            <section className="space-y-3">
              <h3 className="font-heading text-lg font-bold">Interactive Location</h3>
              <div className="h-80 w-full rounded-2xl overflow-hidden border border-border/40 shadow-md">
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
              <CoordsCard latitude={spot.latitude} longitude={spot.longitude} />
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
                  {(nearbySpots as unknown as SpotCardResolved[]).map((nSpot) => (
                    <Link
                      key={nSpot.id}
                      href={`/${nSpot.state.slug}/${nSpot.district.slug}/${nSpot.slug}`}
                      className="flex items-center space-x-3 group"
                    >
                      <div className="relative h-16 w-16 rounded-2xl overflow-hidden flex-shrink-0">
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

// Consistent section header: script eyebrow (brand accent) above the title.
function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="font-script text-xl text-emerald-500">{eyebrow.toLowerCase()}</div>
      <h2 className="font-heading text-2xl font-bold">{title}</h2>
    </div>
  )
}

// One cell of the traveler-facts panel.
function FactCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 bg-card p-4 md:p-5">
      <span className="mt-0.5 text-emerald-500">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="mt-1 block text-sm font-semibold text-foreground">{value}</span>
      </span>
    </div>
  )
}
