import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // 1. Fetch approved spots
  const { data: spots } = await supabase
    .from('spots')
    .select('slug, updated_at, state:states(slug), district:districts(slug)')
    .eq('status', 'approved')
    .eq('is_deleted', false)

  // 2. Fetch states
  const { data: states } = await supabase.from('states').select('slug')

  // 3. Fetch districts
  const { data: districts } = await supabase
    .from('districts')
    .select('slug, state:states(slug)')

  // 4. Fetch categories
  const { data: categories } = await supabase.from('categories').select('slug')

  const baseUrl = 'https://hiddenspot.in'

  const staticUrls = [
    { url: baseUrl, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/map`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/nearby`, lastmod: new Date().toISOString() },
  ]

  const categoryUrls =
    categories?.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastmod: new Date().toISOString(),
    })) || []

  const stateUrls =
    states?.map((st) => ({
      url: `${baseUrl}/${st.slug}`,
      lastmod: new Date().toISOString(),
    })) || []

  const districtUrls =
    (districts as { slug: string; state: { slug: string } }[] | null)?.map((dst) => ({
      url: `${baseUrl}/${dst.state.slug}/${dst.slug}`,
      lastmod: new Date().toISOString(),
    })) || []

  const spotUrls =
    (spots as { slug: string; updated_at: string; state: { slug: string }; district: { slug: string } }[] | null)?.map((spot) => ({
      url: `${baseUrl}/${spot.state.slug}/${spot.district.slug}/${spot.slug}`,
      lastmod: new Date(spot.updated_at).toISOString(),
    })) || []

  const allUrls = [...staticUrls, ...categoryUrls, ...stateUrls, ...districtUrls, ...spotUrls]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map(
      (item) => `
    <url>
      <loc>${item.url}</loc>
      <lastmod>${item.lastmod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${item.url === baseUrl ? '1.0' : '0.8'}</priority>
    </url>`
    )
    .join('')}
</urlset>`

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600',
    },
  })
}
