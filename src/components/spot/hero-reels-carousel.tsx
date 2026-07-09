'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Play, ChevronLeft, ChevronRight, Sparkles, MapPin } from 'lucide-react'

export interface ReelItem {
  id: string
  title: string
  cover_image: string
  video_url: string
  detail_link: string
  district?: string
  state?: string
}

interface HeroReelsCarouselProps {
  reels: ReelItem[]
}

const getReelCode = (url: string) => {
  const match = url.match(/(?:\/p\/|\/reel\/|\/reels\/)([A-Za-z0-9_-]+)/)
  return match ? match[1] : null
}

export function HeroReelsCarousel({ reels }: HeroReelsCarouselProps) {
  const reduceMotion = useReducedMotion()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardOffset, setCardOffset] = useState(120)
  const [isMobile, setIsMobile] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState<Record<string, boolean>>({})
  // Mobile facade: the live IG iframe swallows touches (breaking swipe) and
  // IG treats media taps as open-on-Instagram. So on phones the active card
  // rests as our own cover + play button; the first tap mounts the iframe.
  const [activated, setActivated] = useState<Record<string, boolean>>({})

  const total = reels.length

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setCardOffset(mobile ? 65 : 125)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-advance every 20 seconds — but never while the viewer has started a
  // reel (yanking a playing video away is worse than a static carousel), and
  // never under reduced-motion (unprompted movement is exactly what it opts out
  // of; framer's JS animation ignores the CSS motion guard, so gate it here).
  const activeReelStarted = !!(reels[currentIndex] && activated[reels[currentIndex].id])
  useEffect(() => {
    if (total === 0 || activeReelStarted || reduceMotion) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total)
    }, 20000)

    return () => clearInterval(timer)
  }, [currentIndex, total, activeReelStarted, reduceMotion])

  if (total === 0) return null

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    setTouchEnd(null)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const swipeDiff = touchStart - touchEnd
    const minSwipeDistance = 50

    if (swipeDiff > minSwipeDistance) {
      handleNext()
    } else if (swipeDiff < -minSwipeDistance) {
      handlePrev()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  const handleTouchCancel = () => {
    setTouchStart(null)
    setTouchEnd(null)
  }

  const getCardStyle = (index: number) => {
    let diff = index - currentIndex

    // Wrap around for circular loop
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total

    const absDiff = Math.abs(diff)
    const isVisible = absDiff <= 2 // Show center + 2 on left + 2 on right

    const scale = isVisible ? 1 - absDiff * 0.15 : 0.5
    const opacity = isVisible ? (absDiff === 0 ? 1 : 0.5) : 0
    const zIndex = 10 - absDiff
    const xOffset = diff * cardOffset
    const rotateY = diff * -15 // 3D Perspective angle

    return {
      xOffset,
      scale,
      opacity,
      zIndex,
      rotateY,
      isVisible,
      diff,
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-5xl mx-auto py-12 px-4 select-none">
      {/* 3D Carousel Stage */}
      <div 
        className="relative w-full h-[450px] flex items-center justify-center overflow-hidden md:overflow-visible"
        style={{ perspective: 1200, touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >

        {/* Carousel Cards */}
        {reels.map((item, index) => {
          const { xOffset, scale, opacity, zIndex, rotateY, isVisible, diff } = getCardStyle(index)
          const reelCode = getReelCode(item.video_url)

          if (!isVisible) return null

          return (
            <motion.div
              key={item.id}
              animate={{
                // Full transform string stays on the GPU compositor; the
                // x/scale/rotateY shorthands run on the main thread via rAF and
                // drop frames animating up to five cards at once under load.
                transform: `translateX(${xOffset}px) scale(${scale}) rotateY(${rotateY}deg)`,
                opacity: opacity,
                zIndex: zIndex,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 260, damping: 26 }
              }
              onClick={() => {
                if (diff !== 0) {
                  setCurrentIndex(index)
                }
              }}
              className={`absolute w-[240px] h-[380px] md:w-[260px] md:h-[420px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-shadow duration-300 ${
                diff === 0 
                  ? 'shadow-brand/20 ring-2 ring-brand/30' 
                  : 'hover:shadow-lg hover:shadow-black/40 cursor-pointer'
              }`}
            >
              {diff === 0 && isMobile && !activated[item.id] ? (
                // Active card, phone, untapped: facade keeps swipe working and
                // defers Instagram's player until the user asks for it.
                <button
                  type="button"
                  onClick={() => setActivated((prev) => ({ ...prev, [item.id]: true }))}
                  className="relative block w-full h-full text-left"
                  aria-label={`Play reel: ${item.title}`}
                >
                  <Image
                    src={item.cover_image}
                    alt={item.title}
                    fill
                    sizes="260px"
                    priority={diff === 0}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sunset/90 border border-sunset/40 text-sunset-foreground shadow-lg shadow-sunset/30">
                      <Play className="h-6 w-6 fill-white ml-0.5" />
                    </span>
                    <span className="text-[11px] font-semibold text-white/90">Tap to load reel</span>
                  </div>
                  <div className="absolute bottom-4 left-3 right-3 z-30">
                    <Link
                      href={item.detail_link}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between w-full bg-black/75 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-semibold shadow-lg"
                    >
                      <div className="text-left max-w-[150px]">
                        <p className="truncate font-heading text-xs font-bold leading-tight">{item.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5 flex items-center">
                          <MapPin className="h-2.5 w-2.5 mr-0.5" />
                          {item.district}, {item.state}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-brand dark:text-brand-cream" />
                    </Link>
                  </div>
                </button>
              ) : diff === 0 ? (
                // Active Card - Renders Instagram Video Player
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  {!iframeLoaded[item.id] && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-zinc-950/90 text-center px-4 pointer-events-none">
                      <Image
                        src={item.cover_image}
                        alt={item.title}
                        fill
                        sizes="260px"
                        priority={diff === 0}
                        className="object-cover opacity-40 blur-xs"
                      />
                      <Sparkles className="h-6 w-6 text-sunset animate-pulse mb-2" />
                      <span className="text-xs text-zinc-300 font-medium">Loading local secret...</span>
                    </div>
                  )}

                  {reelCode ? (
                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                      {/* Wrapper centered horizontally, matching 4:5 aspect ratio of the IG media box */}
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 aspect-[4/5] overflow-hidden scale-110">
                        <iframe
                          src={`https://www.instagram.com/p/${reelCode}/embed/`}
                          className="absolute left-0 w-full border-0"
                          style={{
                            top: '-54px',
                            height: 'calc(100% + 150px)',
                          }}
                          title={`Instagram reel: ${item.title}`}
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          scrolling="no"
                          onLoad={() => {
                            setIframeLoaded((prev) => ({ ...prev, [item.id]: true }))
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-sm text-red-500">Failed to load Reel</p>
                    </div>
                  )}

                  {/* Redirection Overlay Glass Banner */}
                  <div className="absolute bottom-4 left-3 right-3 z-30 animate-in fade-in slide-in-from-bottom-3 duration-300">
                    <Link
                      href={item.detail_link}
                      className="flex items-center justify-between w-full bg-black/75 hover:bg-brand/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 text-white transition-all text-xs font-semibold shadow-lg group/btn"
                    >
                      <div className="text-left max-w-[150px]">
                        <p className="truncate font-heading text-xs font-bold leading-tight group-hover/btn:text-white">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5 group-hover/btn:text-brand-cream flex items-center">
                          <MapPin className="h-2.5 w-2.5 mr-0.5" />
                          {item.district}, {item.state}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-brand dark:text-brand-cream group-hover/btn:text-white group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ) : (
                // Waiting/Queue Card - Renders Blurred Thumbnail with Play Overlay
                <div className="relative w-full h-full group">
                  <Image
                    src={item.cover_image}
                    alt={item.title}
                    fill
                    sizes="260px"
                    priority={diff === 0}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Subtle info label */}
                  <div className="absolute top-4 left-4 right-4 z-10">
                    <span className="text-[10px] bg-black/40 backdrop-blur-xs border border-white/10 rounded-full px-2.5 py-1 text-white font-semibold flex items-center w-fit">
                      <Sparkles className="h-3 w-3 mr-1 text-brand dark:text-brand-cream" />
                      Local Secret
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-sunset/90 border border-sunset/40 text-sunset-foreground flex items-center justify-center shadow-lg shadow-sunset/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-sunset">
                      <Play className="h-5 w-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <p className="font-heading text-sm font-bold text-white line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-zinc-300 truncate mt-0.5 flex items-center">
                      <MapPin className="h-3 w-3 mr-0.5 text-zinc-400" />
                      {item.district}, {item.state}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Nav Controls */}
      <div className="flex items-center space-x-6 mt-6 z-30">
        <button
          aria-label="Previous Reel"
          onClick={handlePrev}
          className="h-10 w-10 rounded-full border border-border bg-zinc-900/50 hover:bg-brand hover:text-white transition-colors duration-300 flex items-center justify-center cursor-pointer shadow-md text-muted-foreground hover:border-brand"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          {currentIndex + 1} <span className="opacity-50">/</span> {total} Reels
        </span>
        <button
          aria-label="Next Reel"
          onClick={handleNext}
          className="h-10 w-10 rounded-full border border-border bg-zinc-900/50 hover:bg-brand hover:text-white transition-colors duration-300 flex items-center justify-center cursor-pointer shadow-md text-muted-foreground hover:border-brand"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
