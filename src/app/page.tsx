import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import {
  MapPin,
  Sparkles,
  Award,
  UploadCloud,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { SearchBox } from '@/components/navigation/search-box'
import DynamicMap from '@/components/map/map-wrapper'
import { HeroReelsCarousel, ReelItem } from '@/components/spot/hero-reels-carousel'
import { first, type SpotCardRow } from '@/lib/spot-types'
import { CategoryIcon } from '@/components/spot/category-icon'
import { CountUpStat } from '@/components/home/count-up-stat'
import { section } from 'framer-motion/client'

export default async function HomePage() {
  const supabase = await createClient()

  // 1. Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })
    .limit(6)

  // 2. Fetch featured spots (highest verification scores)
  const { data: featuredSpots } = await supabase
    .from('spots')
    .select(`
      id, title, slug, cover_image, verification_score, best_time_to_visit,
      state:states(name, slug),
      district:districts(name, slug),
      category:categories(name)
    `)
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .order('verification_score', { ascending: false })
    .limit(3)

  // 3. Fetch newest spots
  const { data: newestSpots } = await supabase
    .from('spots')
    .select(`
      id, title, slug, cover_image, verification_score, best_time_to_visit, created_at,
      state:states(name, slug),
      district:districts(name, slug),
      category:categories(name)
    `)
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(3)

  // 4. Fetch all spots for the Map Preview
  const { data: mapSpots } = await supabase
    .from('spots')
    .select(`
      id, title, slug, cover_image, verification_score, latitude, longitude,
      state:states(name, slug),
      district:districts(name, slug),
      category:categories(name)
    `)
    .eq('status', 'approved')
    .eq('is_deleted', false)

  // 5. Fetch approved spots with Instagram Reels for the Hero Carousel
  const { data: reelLinks } = await supabase
    .from('spot_social_links')
    .select(`
      url,
      spot:spots!inner(
        id, title, slug, cover_image, status, is_deleted,
        state:states(name, slug),
        district:districts(name, slug)
      )
    `)
    .eq('platform', 'instagram')
    .eq('spot.status', 'approved')
    .eq('spot.is_deleted', false)

  // Map raw supabase joins to safe objects for dynamic map typing
  const mappedMapSpots = ((mapSpots ?? []) as SpotCardRow[]).map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    cover_image: s.cover_image,
    verification_score: s.verification_score,
    latitude: s.latitude!,
    longitude: s.longitude!,
    state: first(s.state)!,
    district: first(s.district)!,
    category: first(s.category)!,
  }))

  // Define premium fallback reels to ensure we always have 11 items
  const fallbackReels: ReelItem[] = [
    {
      id: 'fallback-1',
      title: 'Cheengeri Hills',
      cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=600',
      video_url: 'https://www.instagram.com/reel/DZ9MQPVTN3n/',
      detail_link: '/kerala/wayanad/cheengeri-hills',
      district: 'Wayanad',
      state: 'Kerala',
    },
    {
      id: 'fallback-2',
      title: 'Vagamon Pine Forest',
      cover_image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600',
      video_url: 'https://www.instagram.com/reel/DZ9MQPVTN3n/',
      detail_link: '/kerala/idukki/vagamon-pine-forest',
      district: 'Idukki',
      state: 'Kerala',
    },
    {
      id: 'fallback-3',
      title: 'Kappad Beach',
      cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600',
      video_url: 'https://www.instagram.com/reel/DZ9MQPVTN3n/',
      detail_link: '/kerala/kozhikode/kappad-beach',
      district: 'Kozhikode',
      state: 'Kerala',
    },
    {
      id: 'fallback-4',
      title: 'Athirappilly Waterfalls',
      cover_image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600',
      video_url: 'https://www.instagram.com/reel/DZ9MQPVTN3n/',
      detail_link: '/kerala/thrissur/athirappilly-waterfalls',
      district: 'Thrissur',
      state: 'Kerala',
    },
    {
      id: 'fallback-5',
      title: 'Munnar Tea Estate',
      cover_image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600',
      video_url: 'https://www.instagram.com/reel/DZ9MQPVTN3n/',
      detail_link: '/kerala/idukki/munnar-tea-gardens',
      district: 'Idukki',
      state: 'Kerala',
    },
    {
      id: 'fallback-6',
      title: 'Bekal Fort Beach',
      cover_image: 'https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=600',
      video_url: 'https://www.instagram.com/reel/DZ9MQPVTN3n/',
      detail_link: '/kerala/kasaragod/bekal-fort-beach',
      district: 'Kasaragod',
      state: 'Kerala',
    },
    {
      id: 'fallback-7',
      title: 'Lakkidi Viewpoint',
      cover_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600',
      video_url: 'https://www.instagram.com/reel/DZ9MQPVTN3n/',
      detail_link: '/kerala/wayanad/lakkidi-viewpoint',
      district: 'Wayanad',
      state: 'Kerala',
    },
    {
      id: 'fallback-8',
      title: 'Silent Valley',
      cover_image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600',
      video_url: 'https://www.instagram.com/reel/DZ9MQPVTN3n/',
      detail_link: '/kerala/palakkad/silent-valley',
      district: 'Palakkad',
      state: 'Kerala',
    },
    {
      id: 'fallback-9',
      title: 'Kumarakom Backwaters',
      cover_image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80&w=600',
      video_url: 'https://www.instagram.com/reel/DZ9MQPVTN3n/',
      detail_link: '/kerala/kottayam/kumarakom-backwaters',
      district: 'Kottayam',
      state: 'Kerala',
    },
    {
      id: 'fallback-10',
      title: 'Muzhappilangad Beach',
      cover_image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=600',
      video_url: 'https://www.instagram.com/reel/DZ9MQPVTN3n/',
      detail_link: '/kerala/kannur/muzhappilangad-drive-in-beach',
      district: 'Kannur',
      state: 'Kerala',
    },
    {
      id: 'fallback-11',
      title: 'Illikkal Kallu Peak',
      cover_image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=600',
      video_url: 'https://www.instagram.com/reel/DZ9MQPVTN3n/',
      detail_link: '/kerala/kottayam/illikkal-kallu',
      district: 'Kottayam',
      state: 'Kerala',
    }
  ]

  // Map database reels
  type ReelLinkRow = { url: string; spot: SpotCardRow }
  const databaseReels = ((reelLinks ?? []) as unknown as ReelLinkRow[]).map((rl, idx) => {
    const spot = rl.spot
    const stateObj = first(spot.state)!
    const districtObj = first(spot.district)!
    return {
      // A spot can carry multiple reels — key must be unique per reel, not per spot.
      id: `${spot.id}-${idx}`,
      title: spot.title,
      cover_image: spot.cover_image,
      video_url: rl.url,
      detail_link: `/${stateObj.slug}/${districtObj.slug}/${spot.slug}`,
      district: districtObj.name,
      state: stateObj.name,
    }
  })

  // Once the community has a healthy set of real reels, the carousel is purely
  // DB-driven; curated fallbacks (linking to the discovery map, since their
  // detail pages don't exist) only pad out a cold start.
  const MIN_REAL_REELS = 5
  const combinedReels =
    databaseReels.length >= MIN_REAL_REELS
      ? databaseReels.slice(0, 11)
      : [
          ...databaseReels,
          ...fallbackReels.map((r) => ({ ...r, detail_link: '/map' })),
        ].slice(0, 11)

  // Real stats derived from data already fetched above — no vanity numbers.
  const spotCount = mappedMapSpots.length
  const districtCount = new Set(
    mappedMapSpots.map((s) => s.district?.slug).filter(Boolean)
  ).size
  const reelCount = databaseReels.length

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'HiddenSpot.in — Discover & Share Secluded Travel Spots & Hidden Gems',
    description: 'Explore community-sourced viewpoints, lakes, beaches, and secret travel spots across India.',
    url: 'https://hiddenspot.in',
  }

  return (
    <main className="space-y-24 pb-24 overflow-hidden bg-background text-foreground">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Floating Animations CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) scale(1.05); }
          50% { transform: translateY(20px) scale(1); }
        }
        .animate-float-1 { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-2 { animation: float-reverse 10s ease-in-out infinite; }
      `}} />

      {/* Hero Section */}
      <section className="relative min-h-[95vh] lg:min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden border-b border-white/5">
        {/* Ambient Glows */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-12 left-12 h-80 w-80 rounded-full bg-brand/10 blur-[130px] animate-float-1" />
          <div className="absolute bottom-12 right-12 h-96 w-96 rounded-full bg-sunset/10 blur-[140px] animate-float-2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#3A4B63]/15 blur-[160px] animate-float-1" />
          <div className="absolute inset-0 bg-background/20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Branding & Search (5 cols) */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-8 px-4 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 rounded-full bg-brand/10 border border-brand/20 px-4 py-1.5 text-xs font-semibold text-brand dark:text-brand-cream backdrop-blur-md w-fit mx-auto lg:mx-0">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Explore Vetted Secluded Gems</span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Find the{' '}
                <span className="font-script font-bold text-[1.18em] gradient-text pr-3">
                  Unseen
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                HiddenSpot.in is a community-vetted map directory of secret waterfalls, misty viewpoints, and offbeat trails. Exact coordinates, zero filler.
              </p>
            </div>

            {/* Trust badge — real numbers only */}
            <div className="flex items-center space-x-2 bg-card/60 backdrop-blur-md border border-border/50 px-4 py-2 rounded-full w-fit mx-auto lg:mx-0 shadow-lg">
              <CheckCircle className="h-4 w-4 text-brand dark:text-brand-cream" />
              <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                {spotCount > 0
                  ? `${spotCount} GPS-verified ${spotCount === 1 ? 'spot' : 'spots'} across ${districtCount} ${districtCount === 1 ? 'district' : 'districts'} — growing weekly`
                  : 'Every spot GPS-verified before it goes live'}
              </span>
            </div>

            <div className="max-w-md mx-auto lg:mx-0 w-full space-y-3">
              <SearchBox variant="hero" />
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {[
                  { label: 'Waterfalls', slug: 'waterfalls' },
                  { label: 'Viewpoints', slug: 'viewpoints' },
                  { label: 'Beaches', slug: 'beaches' },
                  { label: 'Camping', slug: 'camping-spots' },
                ].map((chip) => (
                  <Link
                    key={chip.slug}
                    href={`/category/${chip.slug}`}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-card/60 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-md transition-colors hover:border-sunset/50 hover:text-sunset"
                  >
                    <CategoryIcon slug={chip.slug} className="h-3.5 w-3.5" />
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 flex items-center justify-center lg:justify-start gap-1">
              <span className="h-1.4 w-1.5 rounded-full bg-brand animate-ping" />
              <span>100% community vetted with coordinate verification checks</span>
            </div>
          </div>

          {/* Right: Immersive Reels Carousel (7 cols) */}
          <div className="lg:col-span-7 w-full flex items-center justify-center">
            <HeroReelsCarousel reels={combinedReels} />
          </div>
        </div>
      </section>

      {/* Quick Categories Section */}
      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="font-script text-2xl text-sunset">find your kind of place</div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight">Browse Popular Categories</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Explore destinations categorized by adventure terrain.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="group">
                <Card className="glass h-full border border-white/5 hover:border-brand/50 hover:bg-brand-green/10 text-center p-6 flex flex-col items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-brand-green/20">
                  <div className="h-12 w-12 rounded-2xl bg-brand/10 text-brand dark:text-brand-cream flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-sunset/10 group-hover:text-sunset transition-all duration-300">
                    <CategoryIcon slug={cat.slug} className="h-6 w-6" />
                  </div>
                  <span className="font-heading text-sm font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-brand transition-colors">
                    {cat.name}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Spots Section */}
      {featuredSpots && featuredSpots.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/5 pb-5 gap-4">
            <div>
              <div className="font-script text-xl text-sunset flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                <span>trending right now</span>
              </div>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight mt-1">Featured Hidden Gems</h2>
            </div>
            <Link
              href="/map"
              className={`${buttonVariants({ variant: "ghost" })} text-sunset hover:text-sunset hover:bg-sunset/10 font-semibold gap-1 inline-flex items-center`}
            >
              <span>Explore the Map</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSpots.map((spot: SpotCardRow) => {
              const stateObj = first(spot.state)!
              const districtObj = first(spot.district)!
              const categoryObj = first(spot.category)!
              return (
                <Link
                  key={spot.id}
                  href={`/${stateObj.slug}/${districtObj.slug}/${spot.slug}`}
                  className="group"
                >
                  <Card className="glass overflow-hidden border border-border/30 hover:border-brand/35 group-hover:shadow-xl group-hover:shadow-sunset/10 group-hover:brightness-[1.06] transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1">
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image
                        src={spot.cover_image}
                        alt={spot.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center space-x-1 rounded-full bg-brand/90 text-white px-2.5 py-0.5 text-xs font-semibold">
                        <Sparkles className="h-3 w-3" />
                        <span>{spot.verification_score} Score</span>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-xs text-brand dark:text-brand-cream font-semibold uppercase tracking-wider">
                          {categoryObj.name}
                        </span>
                        <h3 className="font-heading text-lg font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1 group-hover:text-brand transition-colors mt-1">
                          {spot.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-3 border-t border-border/50">
                        <span className="flex items-center min-w-0">
                          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-zinc-500" />
                          <span className="truncate">
                            {districtObj.name}, {stateObj.name}
                          </span>
                        </span>
                        {spot.best_time_to_visit && (
                          <span className="flex items-center flex-shrink-0 gap-1 rounded-full bg-brand/10 px-2 py-0.5 font-semibold text-brand dark:text-brand-cream">
                            <Calendar className="h-3 w-3" />
                            {spot.best_time_to_visit}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Fullscreen Map Explorer Preview */}
      {mappedMapSpots.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="font-script text-2xl text-sunset">wander the map</div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight">Interactive Map Explorer</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Click markers or zoom in on clusters to inspect nearby spots.</p>
          </div>
          <div className="h-[480px] w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-zinc-900/10 backdrop-blur-md">
            <DynamicMap spots={mappedMapSpots} />
          </div>
        </section>
      )}

      {/* Newest Submissions Section */}
      {newestSpots && newestSpots.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/5 pb-5 gap-4">
            <div>
              <div className="font-script text-xl text-sunset">
                fresh discoveries
              </div>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight mt-1">Newest Travel Submissions</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {newestSpots.map((spot: SpotCardRow) => {
              const stateObj = first(spot.state)!
              const districtObj = first(spot.district)!
              const categoryObj = first(spot.category)!
              return (
                <Link
                  key={spot.id}
                  href={`/${stateObj.slug}/${districtObj.slug}/${spot.slug}`}
                  className="group"
                >
                  <Card className="glass overflow-hidden border border-border/30 hover:border-brand/35 group-hover:shadow-xl group-hover:shadow-sunset/10 group-hover:brightness-[1.06] transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1">
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image
                        src={spot.cover_image}
                        alt={spot.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center space-x-1 rounded-full bg-brand/90 text-white px-2.5 py-0.5 text-xs font-semibold">
                        <Sparkles className="h-3 w-3" />
                        <span>{spot.verification_score} Score</span>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-xs text-brand dark:text-brand-cream font-semibold uppercase tracking-wider">
                          {categoryObj.name}
                        </span>
                        <h3 className="font-heading text-lg font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1 group-hover:text-brand transition-colors mt-1">
                          {spot.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-3 border-t border-border/50">
                        <span className="flex items-center min-w-0">
                          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-zinc-500" />
                          <span className="truncate">
                            {districtObj.name}, {stateObj.name}
                          </span>
                        </span>
                        {spot.best_time_to_visit && (
                          <span className="flex items-center flex-shrink-0 gap-1 rounded-full bg-brand/10 px-2 py-0.5 font-semibold text-brand dark:text-brand-cream">
                            <Calendar className="h-3 w-3" />
                            {spot.best_time_to_visit}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* How it Works / Steps */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <div className="font-script text-2xl text-sunset">simple as one, two, three</div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight">How It Works</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Three simple steps to build the leading travel community directory.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 space-y-4">
            <div className="h-16 w-16 rounded-full bg-brand/10 border border-brand/20 text-brand dark:text-brand-cream flex items-center justify-center mx-auto text-xl font-bold shadow-md">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-zinc-800 dark:text-zinc-100">1. Submit a Spot</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sign in with your mobile number, drop a pin on the exact location, add photos and the reel that inspired you — done in under two minutes.
            </p>
          </div>

          <div className="text-center p-6 space-y-4">
            <div className="h-16 w-16 rounded-full bg-brand/10 border border-brand/20 text-brand dark:text-brand-cream flex items-center justify-center mx-auto text-xl font-bold shadow-md">
              <Award className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-zinc-800 dark:text-zinc-100">2. Moderation & Vetting</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Moderators check the coordinates on a map, catch duplicates automatically, and approve only spots that are genuinely worth the trip.
            </p>
          </div>

          <div className="text-center p-6 space-y-4">
            <div className="h-16 w-16 rounded-full bg-brand/10 border border-brand/20 text-brand dark:text-brand-cream flex items-center justify-center mx-auto text-xl font-bold shadow-md">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-zinc-800 dark:text-zinc-100">3. Earn Reputation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every approved spot builds your explorer reputation. Top contributors get featured placements and trusted-moderator privileges.
            </p>
          </div>
        </div>
      </section>

      {/* Community stats — live counts, not vanity numbers */}
      <section className="section-alt py-16 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center ">
          <CountUpStat value={spotCount} label="Hidden Spots" />
          <CountUpStat value={districtCount} label="Districts Covered" />
          <CountUpStat value={reelCount} label="Reels Curated" />
          <CountUpStat value={100} suffix="%" label="Community Vetted" />
        </div>
      </section>

      {/* CTA section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-green to-brand text-white p-8 sm:p-12 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(243,243,217,0.3)_0,transparent_50%)]" />
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
              Know a <span className="font-script font-bold text-[1.18em] text-amber-300">secluded spot</span> ?
            </h2>
            <p className="text-brand-cream text-sm sm:text-base leading-relaxed">
              Help your fellow travelers. Register instantly, drop the coordinate pin, upload cover photos, and submit.
            </p>
            <div className="pt-2">
              <Link
                href="/add-spot"
                className={`${buttonVariants({ variant: "default", size: "lg" })} bg-white hover:bg-brand-green !text-brand-green hover:!text-white font-semibold px-8 shadow-md transition-all`}
              >
                Share Hidden Spot
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
