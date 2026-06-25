import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import {
  Compass,
  MapPin,
  Sparkles,
  Award,
  UploadCloud,
  CheckCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { HeroSearch } from '@/components/navigation/hero-search'
import DynamicMap from '@/components/map/map-wrapper'
import { HeroReelsCarousel, ReelItem } from '@/components/spot/hero-reels-carousel'

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
      id, title, slug, cover_image, verification_score,
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
      id, title, slug, cover_image, verification_score, created_at,
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
  const mappedMapSpots = mapSpots?.map((s: any) => ({
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
  const databaseReels = reelLinks?.map((rl: any) => {
    const spot = rl.spot
    const stateObj = Array.isArray(spot.state) ? spot.state[0] : spot.state
    const districtObj = Array.isArray(spot.district) ? spot.district[0] : spot.district
    return {
      id: spot.id,
      title: spot.title,
      cover_image: spot.cover_image,
      video_url: rl.url,
      detail_link: `/${stateObj.slug}/${districtObj.slug}/${spot.slug}`,
      district: districtObj.name,
      state: stateObj.name,
    }
  }) || []

  // Combine them, placing database reels first
  const combinedReels = [...databaseReels, ...fallbackReels].slice(0, 11)

  return (
    <div className="space-y-24 pb-24 overflow-hidden bg-zinc-950 text-zinc-50">
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
      <section className="relative min-h-[95vh] lg:min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-20 text-white overflow-hidden border-b border-white/5">
        {/* Ambient Glows */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-12 left-12 h-80 w-80 rounded-full bg-emerald-600/10 blur-[130px] animate-float-1" />
          <div className="absolute bottom-12 right-12 h-96 w-96 rounded-full bg-teal-600/10 blur-[140px] animate-float-2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/5 blur-[160px] animate-float-1" />
          <div className="absolute inset-0 bg-zinc-950/20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Branding & Search (5 cols) */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-8 px-4 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md w-fit mx-auto lg:mx-0">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Explore Vetted Secluded Gems</span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500">Unseen</span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                HiddenSpot.in is a community-vetted map directory of secret waterfalls, misty viewpoints, and offbeat trails. Exact coordinates, zero filler.
              </p>
            </div>

            {/* Premium community badge */}
            <div className="flex items-center space-x-3 bg-zinc-900/40 backdrop-blur-md border border-white/5 px-4 py-2 rounded-full w-fit mx-auto lg:mx-0 shadow-lg">
              <div className="flex -space-x-2">
                <div className="relative h-6 w-6 rounded-full border border-zinc-950 bg-emerald-500 text-[9px] font-bold flex items-center justify-center text-black">U1</div>
                <div className="relative h-6 w-6 rounded-full border border-zinc-950 bg-teal-500 text-[9px] font-bold flex items-center justify-center text-black">U2</div>
                <div className="relative h-6 w-6 rounded-full border border-zinc-950 bg-indigo-500 text-[9px] font-bold flex items-center justify-center text-white">U3</div>
              </div>
              <span className="text-[11px] font-semibold text-zinc-300">Join 3,400+ offbeat explorers</span>
            </div>

            <div className="max-w-md mx-auto lg:mx-0 w-full">
              <HeroSearch />
            </div>

            <div className="text-[11px] text-zinc-500 flex items-center justify-center lg:justify-start gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
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
            <h2 className="font-heading text-3xl font-extrabold tracking-tight">Browse Popular Categories</h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">Explore destinations categorized by adventure terrain.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="group">
                <Card className="glass h-full border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-950/10 text-center p-6 flex flex-col items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-emerald-950/20">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Compass className="h-6 w-6" />
                  </div>
                  <span className="font-heading text-sm font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">
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
              <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                <span>Trending Exploration</span>
              </div>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight mt-1">Featured Hidden Gems</h2>
            </div>
            <Link
              href="/category/waterfalls"
              className={`${buttonVariants({ variant: "ghost" })} text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 font-semibold gap-1 inline-flex items-center`}
            >
              <span>View All Gems</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSpots.map((spot: any) => {
              const stateObj = Array.isArray(spot.state) ? spot.state[0] : spot.state
              const districtObj = Array.isArray(spot.district) ? spot.district[0] : spot.district
              const categoryObj = Array.isArray(spot.category) ? spot.category[0] : spot.category
              return (
                <Link
                  key={spot.id}
                  href={`/${stateObj.slug}/${districtObj.slug}/${spot.slug}`}
                  className="group"
                >
                  <Card className="glass overflow-hidden border border-white/5 hover:border-emerald-500/35 bg-zinc-900/20 backdrop-blur-md group-hover:shadow-xl group-hover:shadow-emerald-950/10 transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1">
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image
                        src={spot.cover_image}
                        alt={spot.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center space-x-1 rounded-full bg-emerald-600/90 text-white px-2.5 py-0.5 text-xs font-semibold">
                        <Sparkles className="h-3 w-3" />
                        <span>{spot.verification_score} Score</span>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                          {categoryObj.name}
                        </span>
                        <h3 className="font-heading text-lg font-bold text-zinc-100 line-clamp-1 group-hover:text-emerald-400 transition-colors mt-1">
                          {spot.title}
                        </h3>
                      </div>
                      <div className="flex items-center text-xs text-zinc-400 pt-3 border-t border-white/5">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                        <span>
                          {districtObj.name}, {stateObj.name}
                        </span>
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
            <h2 className="font-heading text-3xl font-extrabold tracking-tight">Interactive Map Explorer</h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">Click markers or zoom in on clusters to inspect nearby spots.</p>
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
              <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Fresh Discoveries
              </div>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight mt-1">Newest Travel Submissions</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {newestSpots.map((spot: any) => {
              const stateObj = Array.isArray(spot.state) ? spot.state[0] : spot.state
              const districtObj = Array.isArray(spot.district) ? spot.district[0] : spot.district
              const categoryObj = Array.isArray(spot.category) ? spot.category[0] : spot.category
              return (
                <Link
                  key={spot.id}
                  href={`/${stateObj.slug}/${districtObj.slug}/${spot.slug}`}
                  className="group"
                >
                  <Card className="glass overflow-hidden border border-white/5 hover:border-emerald-500/35 bg-zinc-900/20 backdrop-blur-md group-hover:shadow-xl group-hover:shadow-emerald-950/10 transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1">
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image
                        src={spot.cover_image}
                        alt={spot.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center space-x-1 rounded-full bg-emerald-600/90 text-white px-2.5 py-0.5 text-xs font-semibold">
                        <Sparkles className="h-3 w-3" />
                        <span>{spot.verification_score} Score</span>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                          {categoryObj.name}
                        </span>
                        <h3 className="font-heading text-lg font-bold text-zinc-100 line-clamp-1 group-hover:text-emerald-400 transition-colors mt-1">
                          {spot.title}
                        </h3>
                      </div>
                      <div className="flex items-center text-xs text-zinc-400 pt-3 border-t border-white/5">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                        <span>
                          {districtObj.name}, {stateObj.name}
                        </span>
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
          <h2 className="font-heading text-3xl font-extrabold tracking-tight">How It Works</h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">Three simple steps to build the leading travel community directory.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold shadow-md">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-zinc-100">1. Submit a Spot</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Verify your mobile number via OTP, search location coordinates via Google geocoding, compress photos on the client side, and submit.
            </p>
          </div>

          <div className="text-center p-6 space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold shadow-md">
              <Award className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-zinc-100">2. Moderation & Vetting</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Moderators verify submitted coordinates, flag duplicates via spatial checks, approve details, and update the verification score.
            </p>
          </div>

          <div className="text-center p-6 space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold shadow-md">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-zinc-100">3. Earn Reputation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              As your shared locations get approved and featured, your contributor reputation score escalates, unlocking trusted moderator privileges.
            </p>
          </div>
        </div>
      </section>

      {/* Community stats */}
      <section className="bg-zinc-900/10 backdrop-blur-md py-16 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="font-heading text-4xl sm:text-5xl font-extrabold text-emerald-400">300+</div>
            <div className="text-xs text-zinc-400 uppercase font-semibold mt-2">Vetted Locations</div>
          </div>
          <div>
            <div className="font-heading text-4xl sm:text-5xl font-extrabold text-emerald-400">10k+</div>
            <div className="text-xs text-zinc-400 uppercase font-semibold mt-2">Active Travelers</div>
          </div>
          <div>
            <div className="font-heading text-4xl sm:text-5xl font-extrabold text-emerald-400">100%</div>
            <div className="text-xs text-zinc-400 uppercase font-semibold mt-2">Community Vetted</div>
          </div>
          <div>
            <div className="font-heading text-4xl sm:text-5xl font-extrabold text-emerald-400">100m</div>
            <div className="text-xs text-zinc-400 uppercase font-semibold mt-2">GPS Accuracy</div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-700 text-white p-8 sm:p-12 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(16,185,129,0.3)_0,transparent_50%)]" />
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Know A Secluded Spot?</h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Help your fellow travelers. Register instantly via SMS, drop the coordinate pin, upload cover photos, and submit.
            </p>
            <div className="pt-2">
              <Link
                href="/add-spot"
                className={`${buttonVariants({ variant: "default", size: "lg" })} bg-white hover:bg-emerald-800 !text-emerald-800 hover:!text-white font-semibold px-8 shadow-md transition-all`}
              >
                Share Hidden Spot
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
