'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSupabaseAuth } from '@/hooks/use-supabase-auth'
import { useAuthDialog } from '@/components/auth/auth-dialog-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { errMessage } from '@/lib/utils'
import { Film, Plus, Loader2 } from 'lucide-react'

const IG_URL_RE = /instagram\.com\/(reel|reels|p|tv)\/[A-Za-z0-9_-]+/

interface AddReelDialogProps {
  spotId: string
  spotTitle: string
}

/**
 * "Add a reel" for existing spots. Submissions land in
 * spot_reel_submissions and go live after moderator approval.
 */
export function AddReelDialog({ spotId, spotTitle }: AddReelDialogProps) {
  const { user } = useSupabaseAuth()
  const { openAuthDialog } = useAuthDialog()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleOpen = () => {
    if (!user) {
      toast.info('Sign in to add a reel to this spot')
      openAuthDialog()
      return
    }
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    if (!IG_URL_RE.test(trimmed)) {
      toast.error('Paste a full Instagram reel or post link')
      return
    }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('spot_reel_submissions').insert({
        spot_id: spotId,
        submitted_by: user!.id,
        url: trimmed,
        note: note.trim() || null,
      })
      if (error) {
        if (error.code === '23505') {
          toast.error('This reel has already been submitted for this spot')
        } else {
          toast.error(errMessage(error, 'Could not submit the reel. Try again.'))
        }
        return
      }
      toast.success('Reel submitted! It will appear here once a moderator approves it.')
      setOpen(false)
      setUrl('')
      setNote('')
    } catch (err) {
      toast.error(errMessage(err, 'Could not submit the reel. Try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="gap-1.5 border-border/50 font-medium text-muted-foreground hover:border-emerald-500/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="h-4 w-4" />
        Add Reel
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-xl font-bold">
              <Film className="h-5 w-5 text-emerald-500" />
              Add a Reel
            </DialogTitle>
            <DialogDescription>
              Know a great reel of {spotTitle}? Paste the Instagram link — it goes live after a
              quick moderator check, and approved reels earn you reputation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label
                htmlFor="reel-url"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Instagram Link
              </label>
              <Input
                id="reel-url"
                type="url"
                inputMode="url"
                placeholder="https://www.instagram.com/reel/…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="reel-note"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Note for moderators <span className="normal-case">(optional)</span>
              </label>
              <Textarea
                id="reel-note"
                placeholder="e.g. Shows the trail up to the falls in monsoon"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={submitting}
                rows={2}
                maxLength={300}
              />
            </div>
            <Button type="submit" disabled={submitting} className="gradient-btn w-full gap-1.5">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit for Review'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
