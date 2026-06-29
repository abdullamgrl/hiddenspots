import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { MapExplorer } from '@/components/map/map-explorer'

export const metadata = {
  title: 'Explore the Map | HiddenSpot.in',
  description:
    'Discover hidden travel spots geographically. Browse community reels on an interactive map of secret waterfalls, viewpoints, and offbeat trails across India.',
  alternates: { canonical: '/map' },
}

export default async function MapPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh_-_4rem)] items-center justify-center text-sm text-muted-foreground">
          Loading map...
        </div>
      }
    >
      <MapExplorer categories={categories || []} />
    </Suspense>
  )
}
