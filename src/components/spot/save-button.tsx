'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthDialog } from '@/components/auth/auth-dialog-provider'
import { Button } from '@/components/ui/button'
import { Bookmark, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { errMessage } from '@/lib/utils'

interface SaveButtonProps {
  spotId: string
  userId?: string | null
}

export function SaveButton({ spotId, userId }: SaveButtonProps) {
  const supabase = createClient()
  const { openAuthDialog } = useAuthDialog()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  // Fetch initial saved status if user is logged in
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('saved_spots')
          .select('id')
          .eq('profile_id', userId)
          .eq('spot_id', spotId)
          .maybeSingle()

        if (error) throw error
        setSaved(!!data)
      } catch (err) {
        console.error('Error fetching bookmark status:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSavedStatus()
  }, [spotId, userId, supabase])

  const handleToggleSave = async () => {
    if (!userId) {
      toast.info('Please sign in to save spots to your collection')
      openAuthDialog()
      return
    }

    setToggling(true)
    try {
      if (saved) {
        // Remove bookmark
        const { error } = await supabase
          .from('saved_spots')
          .delete()
          .eq('profile_id', userId)
          .eq('spot_id', spotId)

        if (error) throw error
        setSaved(false)
        toast.success('Removed spot from your saved list')
      } else {
        // Add bookmark
        const { error } = await supabase.from('saved_spots').insert({
          profile_id: userId,
          spot_id: spotId,
          collection_name: 'Favorites',
        })

        if (error) throw error
        setSaved(true)
        toast.success('Saved spot to your collection!')
      }
    } catch (err) {
      toast.error(errMessage(err, 'Failed to toggle bookmark status'))
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="border-border/50">
        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
        <span>Saving...</span>
      </Button>
    )
  }

  return (
    <Button
      variant={saved ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggleSave}
      disabled={toggling}
      className={`border-border/50 gap-1.5 font-medium transition-all ${
        saved 
          ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
      <span>{saved ? 'Saved' : 'Save Spot'}</span>
    </Button>
  )
}
