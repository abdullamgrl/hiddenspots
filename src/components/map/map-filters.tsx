'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SlidersHorizontal } from 'lucide-react'

interface MapFiltersProps {
  categories: { id: string; name: string; slug: string }[]
  value: string | null
  onChange: (slug: string | null) => void
}

const ALL = 'all'

export function MapFilters({ categories, value, onChange }: MapFiltersProps) {
  const activeName = value ? categories.find((c) => c.slug === value)?.name : undefined

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/80 p-1.5 shadow-lg backdrop-blur-md glass">
      <SlidersHorizontal className="ml-1.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <Select
        value={value ?? ALL}
        onValueChange={(v) => onChange(v === ALL ? null : v)}
      >
        <SelectTrigger className="h-9 w-44 border-0 bg-transparent shadow-none focus:ring-0">
          <SelectValue placeholder="All categories">{activeName ?? 'All categories'}</SelectValue>
        </SelectTrigger>
        <SelectContent className="glass">
          <SelectItem value={ALL}>All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
