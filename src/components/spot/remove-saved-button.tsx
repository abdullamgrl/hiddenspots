'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { BookmarkX, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface RemoveSavedButtonProps {
  savedId: string
  spotTitle: string
}

export function RemoveSavedButton({ savedId, spotTitle }: RemoveSavedButtonProps) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  const handleRemove = async (e: React.MouseEvent) => {
    // The button sits inside the card link — don't navigate.
    e.preventDefault()
    e.stopPropagation()
    setRemoving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('saved_spots').delete().eq('id', savedId)
      if (error) throw error
      toast.success(`Removed “${spotTitle}” from saved spots`)
      router.refresh()
    } catch {
      toast.error('Could not remove the spot. Try again.')
      setRemoving(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRemove}
      disabled={removing}
      aria-label={`Remove ${spotTitle} from saved spots`}
      className="h-8 w-8 rounded-full bg-black/60 p-0 text-white hover:bg-black/80 hover:text-red-400"
    >
      {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkX className="h-4 w-4" />}
    </Button>
  )
}
