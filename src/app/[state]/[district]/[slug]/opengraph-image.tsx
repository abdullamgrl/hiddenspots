import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

// Image metadata
export const alt = 'HiddenSpots.in - Discover & Share Secluded Travel Spots & Hidden Gems'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ state: string; district: string; slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch data
  const { data: spot } = await supabase
    .from('spots')
    .select('title, cover_image, verification_score, district:districts(name)')
    .eq('slug', slug)
    .single()

  if (!spot) {
    return new Response('Not Found', { status: 404 })
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1F3D2E',
          position: 'relative',
        }}
      >
        <img
          src={spot.cover_image}
          alt={spot.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            opacity: 0.5,
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(to top, rgba(31, 61, 46, 0.9), rgba(31, 61, 46, 0.4))',
          }}
        />
        
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            width: '100%',
            height: '100%',
            padding: 60,
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: '6px 16px',
              borderRadius: 9999,
              fontSize: 24,
              fontWeight: 800,
              color: '#1F3D2E',
              marginBottom: 24,
            }}
          >
            ⭐ {spot.verification_score} Verified
          </div>
          
          <h1
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              margin: '0 0 20px 0',
              textShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {spot.title}
          </h1>

          <div
            style={{
              fontSize: 36,
              color: '#F3F3D9',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            📍 {
              // @ts-ignore
              spot.district.name
            }, India
          </div>
          
          <div
            style={{
              position: 'absolute',
              top: 60,
              left: 60,
              fontSize: 48,
              fontWeight: 900,
              color: '#F3F3D9',
              letterSpacing: '-0.02em',
            }}
          >
            HiddenSpot
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
