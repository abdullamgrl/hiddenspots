'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthDialog } from '@/components/auth/auth-dialog-provider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Pencil, Loader2 } from 'lucide-react'
import { errMessage } from '@/lib/utils'

// Values a visitor can propose fixes for — mirrors editable_spot_fields() in
// the edit-suggestions migration.
export interface EditableSpotValues {
  description: string
  short_description: string
  address: string
  best_time_to_visit: string
  estimated_visit_duration: string
  difficulty_level: string
  entry_fee: number
  parking_available: boolean
  family_friendly: boolean
  pet_friendly: boolean
  requires_trek: boolean
  trek_distance_km: number
  safety_notes: string
}

interface SuggestEditDialogProps {
  spotId: string
  userId?: string | null
  current: EditableSpotValues
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy (Family stroll)',
  moderate: 'Moderate (Some climbing)',
  challenging: 'Challenging (Steep trail)',
  extreme: 'Extreme (For experts only)',
}

export function SuggestEditDialog({ spotId, userId, current }: SuggestEditDialogProps) {
  const supabase = createClient()
  const { openAuthDialog } = useAuthDialog()

  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<EditableSpotValues>(current)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof EditableSpotValues>(key: K, val: EditableSpotValues[K]) =>
    setValues((v) => ({ ...v, [key]: val }))

  // Diff against the page's current data — only real changes are submitted.
  const changes = useMemo(() => {
    const diff: Record<string, { from: unknown; to: unknown }> = {}
    for (const key of Object.keys(current) as (keyof EditableSpotValues)[]) {
      if (values[key] !== current[key]) {
        diff[key] = { from: current[key], to: values[key] }
      }
    }
    return diff
  }, [values, current])

  const changedCount = Object.keys(changes).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (changedCount === 0) {
      toast.error('Nothing changed yet — edit at least one field')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('spot_edit_suggestions').insert({
        spot_id: spotId,
        suggested_by: userId,
        changes,
        note: note.trim() || null,
      })

      if (error) {
        if (error.code === '23505') {
          toast.error('You already have a pending suggestion for this spot — a moderator will review it soon')
          return
        }
        throw error
      }

      toast.success('Thanks! Your suggestion is queued for moderator review.')
      setOpen(false)
      setNote('')
    } catch (err) {
      toast.error(errMessage(err, 'Could not submit the suggestion'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o && !userId) {
          toast.info('Please sign in to suggest edits')
          openAuthDialog()
          return
        }
        setOpen(o)
        if (o) setValues(current) // fresh diff every time it opens
      }}
    >
      <DialogTrigger render={
        <Button
          variant="outline"
          size="sm"
          className="border-border/50 gap-1.5 font-medium text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
          <span>Suggest Edit</span>
        </Button>
      } />

      <DialogContent className="sm:max-w-[560px] glass max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold flex items-center gap-2">
            <Pencil className="h-4 w-4 text-emerald-600" />
            Suggest an edit
          </DialogTitle>
          <DialogDescription>
            Spotted something outdated? Correct the fields below — only what you change is sent
            for moderator review, and approved fixes earn reputation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Short Description</label>
            <Input
              value={values.short_description}
              onChange={(e) => set('short_description', e.target.value)}
              maxLength={250}
              className="glass"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
            <Textarea
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              className="glass"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</label>
            <Input value={values.address} onChange={(e) => set('address', e.target.value)} className="glass" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Best Time To Visit</label>
              <Input
                value={values.best_time_to_visit}
                onChange={(e) => set('best_time_to_visit', e.target.value)}
                placeholder="E.g., Oct to Mar"
                className="glass"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visit Duration</label>
              <Input
                value={values.estimated_visit_duration}
                onChange={(e) => set('estimated_visit_duration', e.target.value)}
                placeholder="E.g., 1-2 Hours"
                className="glass"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty</label>
              <Select
                value={values.difficulty_level || undefined}
                onValueChange={(v) => set('difficulty_level', v as string)}
              >
                <SelectTrigger className="glass">
                  <SelectValue placeholder="Difficulty">
                    {DIFFICULTY_LABELS[values.difficulty_level] ?? undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="glass">
                  {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entry Fee (₹)</label>
              <Input
                type="number"
                min={0}
                step="any"
                value={Number.isFinite(values.entry_fee) ? values.entry_fee : 0}
                onChange={(e) => set('entry_fee', e.target.value === '' ? 0 : Number(e.target.value))}
                className="glass"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ['parking_available', 'Parking Available'],
                ['family_friendly', 'Family Friendly'],
                ['pet_friendly', 'Pet Friendly'],
                ['requires_trek', 'Requires Trek'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-3 rounded-lg border border-border p-3 glass">
                <Switch
                  id={`se-${key}`}
                  checked={values[key]}
                  onCheckedChange={(checked) => set(key, checked)}
                />
                <label htmlFor={`se-${key}`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                  {label}
                </label>
              </div>
            ))}
          </div>

          {values.requires_trek && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trek Distance (km)</label>
              <Input
                type="number"
                min={0}
                step="any"
                value={Number.isFinite(values.trek_distance_km) ? values.trek_distance_km : 0}
                onChange={(e) => set('trek_distance_km', e.target.value === '' ? 0 : Number(e.target.value))}
                className="glass"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Safety Notes</label>
            <Textarea
              value={values.safety_notes}
              onChange={(e) => set('safety_notes', e.target.value)}
              rows={2}
              placeholder="Anything travelers should know"
              className="glass"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              How do you know? <span className="normal-case font-normal">(optional, helps moderators)</span>
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              placeholder="E.g., Visited last weekend — fee went up to ₹50"
              className="glass"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {changedCount === 0
                ? 'No changes yet'
                : `${changedCount} field${changedCount === 1 ? '' : 's'} changed`}
            </span>
            <Button type="submit" disabled={submitting || changedCount === 0} className="gradient-btn px-5">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit Suggestion'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
