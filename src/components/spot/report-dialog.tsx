'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { AlertOctagon, Loader2 } from 'lucide-react'
import { errMessage } from '@/lib/utils'

interface ReportDialogProps {
  spotId: string
  userId?: string | null
}

export function ReportDialog({ spotId, userId }: ReportDialogProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [reportType, setReportType] = useState<string>('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportType) {
      toast.error('Please select a report reason')
      return
    }
    if (description.length < 10) {
      toast.error('Please describe the issue in at least 10 characters')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('spot_reports').insert({
        spot_id: spotId,
        reporter_id: userId || null,
        report_type: reportType,
        description: description,
        status: 'pending',
      })

      if (error) throw error

      toast.success('Thank you. The report was submitted for moderator review.')
      setOpen(false)
      // Reset form
      setReportType('')
      setDescription('')
    } catch (err) {
      toast.error(errMessage(err, 'Failed to submit report. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="text-muted-foreground border-border/50 hover:text-red-500 hover:border-red-500/30 gap-1.5">
          <AlertOctagon className="h-4 w-4" />
          <span>Report Spot</span>
        </Button>
      } />
      <DialogContent className="sm:max-w-[420px] glass">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-500" />
            <span>Report Spot Issue</span>
          </DialogTitle>
          <DialogDescription>
            Help keep HiddenSpot.in accurate. Let us know what is wrong with this listing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reason</label>
            <Select onValueChange={(val) => setReportType(val as string)}>
              <SelectTrigger className="glass">
                <SelectValue placeholder="Select a reason">
                  {reportType === 'incorrect_location' && 'Incorrect Coordinates / Address'}
                  {reportType === 'duplicate' && 'Duplicate Spot / Multiple Entries'}
                  {reportType === 'spam' && 'Spam / Low Quality'}
                  {reportType === 'inappropriate' && 'Inappropriate Media or Description'}
                  {reportType === 'dangerous' && 'Dangerous Location / Closed Route'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="incorrect_location">Incorrect Coordinates / Address</SelectItem>
                <SelectItem value="duplicate">Duplicate Spot / Multiple Entries</SelectItem>
                <SelectItem value="spam">Spam / Low Quality</SelectItem>
                <SelectItem value="inappropriate">Inappropriate Media or Description</SelectItem>
                <SelectItem value="dangerous">Dangerous Location / Closed Route</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Describe the issue</label>
            <Textarea
              placeholder="Provide details to help our moderators verify..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass"
              required
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-red-600 hover:bg-red-500 text-white font-medium">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Report...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
