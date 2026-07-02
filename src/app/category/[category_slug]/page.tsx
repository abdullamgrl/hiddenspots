import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Sparkles, Compass } from 'lucide-react'

interface CategoryPageProps {
  params: Promise<{
    category_slug: string
  }>
}

async function getCategory(slug: string) {
  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  return category
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category_slug } = await params
  const category = await getCategory(category_slug)
  if (!category) return { title: 'Category Not Found | HiddenSpot' }

  return {
    title: `Best Hidden ${category.name} in India — Discover Secluded Spots`,
    description: category.description || `Browse community-vetted, offbeat hidden ${category.name.toLowerCase()} in India. View photos, details, maps and directions.`,
    alternates: {
      canonical: `/category/${category_slug}`,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category_slug } = await params
  const category = await getCategory(category_slug)

  if (!category) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch approved spots under this category
  const { data: spots } = await supabase
    .from('spots')
    .select(`
      id, title, slug, cover_image, verification_score, created_at,
      state:states(name, slug),
      district:districts(name, slug),
      category:categories(name)
    `)
    .eq('category_id', category.id)
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .order('verification_score', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Title block */}
      <div className="space-y-2 border-b border-border/50 pb-6">
        <div className="text-emerald-600 dark:text-teal-400 text-sm font-semibold uppercase tracking-wider">
          Category Directory
        </div>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">
          Hidden {category.name}
        </h1>
        <p className="text-muted-foreground max-w-xl">
          {category.description || `Explore offbeat, community-curated travel ${category.name.toLowerCase()} worth visiting.`}
        </p>
      </div>

      {/* Grid List */}
      {spots && spots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {spots.map((spot: any) => (
            <Link
              key={spot.id}
              href={`/${spot.state.slug}/${spot.district.slug}/${spot.slug}`}
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
          <h3 className="font-heading text-lg font-bold">No Spots in {category.name} Yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
            Be the first to share a beautiful {category.name.toLowerCase()} spot in this category!
          </p>
          <Link
            href="/add-spot"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-500"
          >
            <Compass className="h-4 w-4" />
            Add the First Spot
          </Link>
        </div>
      )}
    </div>
  )
}
