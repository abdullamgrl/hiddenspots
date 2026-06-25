'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const cleanQuery = query.toLowerCase().trim()
    
    // Redirect logic: check if query matches some basic categories
    if (['waterfall', 'waterfalls'].includes(cleanQuery)) {
      router.push('/category/waterfalls')
    } else if (['beach', 'beaches'].includes(cleanQuery)) {
      router.push('/category/beaches')
    } else if (['viewpoint', 'viewpoints', 'sunset', 'sunrise'].includes(cleanQuery)) {
      router.push('/category/viewpoints')
    } else if (['kerala', 'kl'].includes(cleanQuery)) {
      router.push('/kerala')
    } else if (['karnataka', 'ka'].includes(cleanQuery)) {
      router.push('/karnataka')
    } else {
      // Default to general search or category waterfalls
      router.push('/category/waterfalls')
    }
  }

  return (
    <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 p-2 shadow-2xl">
        <div className="flex items-center flex-1 px-3">
          <MapPin className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search Wayanad, waterfalls, viewpoints, beaches..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-foreground placeholder-muted-foreground w-full font-medium"
          />
        </div>
        <Button type="submit" className="gradient-btn px-6 py-6 rounded-xl flex items-center space-x-1">
          <Search className="h-4 w-4" />
          <span className="font-semibold text-sm">Discover</span>
        </Button>
      </div>
    </form>
  )
}
