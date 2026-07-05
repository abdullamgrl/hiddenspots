'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, MapPin, Compass, Landmark, Loader2, Film } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSiteSearch, type SearchResult } from '@/hooks/use-site-search'

const KIND_ICON: Record<SearchResult['kind'], typeof MapPin> = {
  spot: Film,
  district: MapPin,
  state: Landmark,
  category: Compass,
}

const KIND_LABEL: Record<SearchResult['kind'], string> = {
  spot: 'Spot',
  district: 'District',
  state: 'State',
  category: 'Category',
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

interface SearchBoxProps {
  /** Larger hero styling vs compact inline styling. */
  variant?: 'hero' | 'compact'
  autoFocus?: boolean
  initialQuery?: string
}

/**
 * Live search box with a debounced results dropdown (keyboard navigable).
 * Enter with no highlighted result goes to /search?q=… for the full list.
 */
export function SearchBox({ variant = 'hero', autoFocus = false, initialQuery = '' }: SearchBoxProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounced(query, 250)
  const { data: results, isFetching, isError } = useSiteSearch(debouncedQuery)

  const showDropdown = open && query.trim().length >= 2

  // Close on outside click.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const go = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    if (highlighted >= 0 && results?.[highlighted]) {
      go(results[highlighted].url)
    } else {
      go(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || !results?.length) {
      if (e.key === 'Escape') setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => (h + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => (h <= 0 ? results.length - 1 : h - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
  }

  const hero = variant === 'hero'

  return (
    <div ref={rootRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search" className="w-full">
        <div
          className={`relative flex items-center rounded-2xl border bg-white/90 backdrop-blur-md transition-all duration-300 focus-within:border-sunset/60 focus-within:shadow-[0_0_0_3px_rgba(232,135,58,0.15)] dark:bg-card/80 ${
            hero ? 'border-white/20 p-2 shadow-2xl dark:border-white/10' : 'border-border p-1.5 shadow-md'
          }`}
        >
          <div className="flex flex-1 items-center px-3">
            <MapPin className="mr-2 h-5 w-5 flex-shrink-0 text-emerald-600" />
            <Input
              type="text"
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls="search-results"
              aria-label="Search spots, districts, and categories"
              placeholder="Search spots, districts, categories…"
              value={query}
              autoFocus={autoFocus}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
                setHighlighted(-1)
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              className="w-full border-0 bg-transparent font-medium text-foreground placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {isFetching && <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-muted-foreground" />}
          </div>
          <Button
            type="submit"
            className={`gradient-btn flex items-center space-x-1 rounded-xl ${hero ? 'px-6 py-6' : 'px-4'}`}
          >
            <Search className="h-4 w-4" />
            <span className="text-sm font-semibold">{hero ? 'Discover' : 'Search'}</span>
          </Button>
        </div>
      </form>

      {/* Results dropdown */}
      {showDropdown && (
        <div
          id="search-results"
          role="listbox"
          className="glass absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-border/50 shadow-2xl"
        >
          {isError ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Search is unavailable right now. Press Enter to browse instead.
            </div>
          ) : results && results.length > 0 ? (
            <ul className="divide-y divide-border/40 py-1">
              {results.map((r, i) => {
                const Icon = KIND_ICON[r.kind]
                return (
                  <li key={`${r.kind}-${r.url}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={highlighted === i}
                      onClick={() => go(r.url)}
                      onMouseEnter={() => setHighlighted(i)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        highlighted === i ? 'bg-emerald-500/10' : 'hover:bg-muted/50'
                      }`}
                    >
                      {r.image ? (
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border/50">
                          <Image src={r.image} alt="" fill sizes="40px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                          <Icon className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">{r.title}</div>
                        {r.subtitle && (
                          <div className="truncate text-xs text-muted-foreground">{r.subtitle}</div>
                        )}
                      </div>
                      <span className="flex-shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {KIND_LABEL[r.kind]}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : !isFetching && debouncedQuery.trim().length >= 2 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No matches for “{debouncedQuery.trim()}” yet.
              <div className="mt-1 text-xs">Know this place? Be the first to add it.</div>
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">Searching…</div>
          )}
        </div>
      )}
    </div>
  )
}
