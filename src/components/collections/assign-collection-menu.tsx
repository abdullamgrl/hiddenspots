'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { FolderInput, Check, Loader2, Bookmark } from 'lucide-react'
import type { Collection } from './collection-controls'

interface AssignCollectionMenuProps {
  savedId: string
  currentCollectionId: string | null
  collections: Collection[]
}

/** Per-card "move to collection" menu on /saved. */
export function AssignCollectionMenu({
  savedId,
  currentCollectionId,
  collections,
}: AssignCollectionMenuProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const assign = async (collectionId: string | null, label: string) => {
    if (collectionId === currentCollectionId) return
    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('saved_spots')
        .update({ collection_id: collectionId })
        .eq('id', savedId)
      if (error) throw error
      toast.success(collectionId ? `Moved to “${label}”` : 'Moved out of collections')
      router.refresh()
    } catch {
      toast.error('Could not move the spot')
    } finally {
      setBusy(false)
    }
  }

  if (collections.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label="Move to collection"
            // Inside the card link — swallow the navigation.
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="h-8 w-8 rounded-full bg-black/60 p-0 text-white hover:bg-black/80"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderInput className="h-4 w-4" />}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="glass w-52">
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Move to collection
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => assign(null, '')} className="cursor-pointer gap-2">
          <Bookmark className="h-4 w-4" />
          <span className="flex-1">All Saved</span>
          {currentCollectionId === null && <Check className="h-4 w-4 text-brand dark:text-brand-cream" />}
        </DropdownMenuItem>
        {collections.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onClick={() => assign(c.id, c.name)}
            className="cursor-pointer gap-2"
          >
            <FolderInput className="h-4 w-4" />
            <span className="flex-1 truncate">{c.name}</span>
            {currentCollectionId === c.id && <Check className="h-4 w-4 text-brand dark:text-brand-cream" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
