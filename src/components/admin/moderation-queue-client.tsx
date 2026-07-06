'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Compass,
  Check,
  X,
  AlertTriangle,
  AlertOctagon,
  Eye,
  Loader2,
  Clock,
} from 'lucide-react'
import Image from 'next/image'
import { errMessage } from '@/lib/utils'

interface PendingSpot {
  id: string
  title: string
  slug: string
  description: string
  short_description: string
  latitude: number
  longitude: number
  address: string
  cover_image: string
  category_id: string
  state_id: string
  district_id: string
  created_at: string
  category: { name: string }
  state: { name: string }
  district: { name: string }
  creator: { username: string; full_name: string }
}

interface PendingReport {
  id: string
  spot_id: string
  reporter_id: string | null
  report_type: string
  description: string
  status: string
  created_at: string
  spot: {
    id: string
    title: string
    slug: string
    cover_image: string
    state_id: string
    district_id: string
  }
}

interface PendingSuggestion {
  id: string
  spot_id: string
  changes: Record<string, { from: unknown; to: unknown }>
  note: string | null
  created_at: string
  spot: { id: string; title: string; slug: string; cover_image: string } | null
  suggester: { id: string; username: string | null; full_name: string | null } | null
}

interface PendingReelSubmission {
  id: string
  spot_id: string
  url: string
  note: string | null
  created_at: string
  spot: { id: string; title: string; slug: string; cover_image: string } | null
  submitter: { id: string; username: string | null; full_name: string | null } | null
}

interface ModerationQueueProps {
  initialSpots: PendingSpot[]
  initialReports: PendingReport[]
  initialSuggestions: PendingSuggestion[]
  initialReelSubmissions: PendingReelSubmission[]
  moderatorId: string
}

// Human labels + value formatting for the edit-suggestion diff view.
const EDIT_FIELD_LABELS: Record<string, string> = {
  description: 'Description',
  short_description: 'Short Description',
  address: 'Address',
  best_time_to_visit: 'Best Time To Visit',
  estimated_visit_duration: 'Visit Duration',
  difficulty_level: 'Difficulty',
  entry_fee: 'Entry Fee (₹)',
  parking_available: 'Parking',
  family_friendly: 'Family Friendly',
  pet_friendly: 'Pet Friendly',
  requires_trek: 'Requires Trek',
  trek_distance_km: 'Trek Distance (km)',
  safety_notes: 'Safety Notes',
}

function formatEditValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return String(v)
}

export function ModerationQueueClient({
  initialSpots,
  initialReports,
  initialSuggestions,
  initialReelSubmissions,
  moderatorId,
}: ModerationQueueProps) {
  const supabase = createClient()
  const [spots, setSpots] = useState<PendingSpot[]>(initialSpots)
  const [reports, setReports] = useState<PendingReport[]>(initialReports)
  const [suggestions, setSuggestions] = useState<PendingSuggestion[]>(initialSuggestions)
  const [reelSubmissions, setReelSubmissions] = useState<PendingReelSubmission[]>(initialReelSubmissions)
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState('submissions')

  // Reject / Change Action dialog states
  const [actionSpot, setActionSpot] = useState<PendingSpot | null>(null)
  const [actionType, setActionType] = useState<'reject' | 'changes'>('reject')
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Duplicate states indexed by Spot ID
  const [duplicates, setDuplicates] = useState<Record<string, { confidence: number; reason: string }>>({})

  // Trigger duplicate checks on mount for all pending spots
  useEffect(() => {
    const runDuplicateChecks = async () => {
      const results: Record<string, { confidence: number; reason: string }> = {}
      
      for (const spot of spots) {
        try {
          const { data, error } = await supabase.rpc('check_duplicate_spot', {
            input_lat: spot.latitude,
            input_lon: spot.longitude,
            input_title: spot.title,
            input_district_id: spot.district_id,
            input_social_urls: [], // Can fetch urls first if needed
          })

          if (!error && data && data.length > 0) {
            results[spot.id] = {
              confidence: data[0].confidence_score,
              reason: data[0].match_reason,
            }
          }
        } catch (err) {
          console.error(err)
        }
      }
      setDuplicates(results)
    }

    if (spots.length > 0) {
      runDuplicateChecks()
    }
  }, [spots, supabase])

  // Approve Spot
  const handleApprove = async (spotId: string) => {
    try {
      // 1. Update spot status
      const { error: spotError } = await supabase
        .from('spots')
        .update({ status: 'approved' })
        .eq('id', spotId)

      if (spotError) throw spotError

      // 2. Log moderation action
      const { error: actionError } = await supabase.from('moderation_actions').insert({
        spot_id: spotId,
        moderator_id: moderatorId,
        action_type: 'approve',
        reason: 'Approved spot submission',
      })

      if (actionError) throw actionError

      toast.success('Spot approved successfully and is now live!')
      setSpots((prev) => prev.filter((s) => s.id !== spotId))
    } catch (err) {
      toast.error(errMessage(err, 'Failed to approve spot'))
    }
  }

  // Reject / Request Changes Dialog submit handler
  const handleActionSubmit = async () => {
    if (!actionSpot) return
    if (reason.length < 10) {
      toast.error('Please specify a detailed reason (minimum 10 characters)')
      return
    }

    setActionLoading(true)
    try {
      const statusValue = actionType === 'reject' ? 'rejected' : 'draft' // request changes rolls back to draft

      // 1. Update status
      const { error: spotError } = await supabase
        .from('spots')
        .update({ status: statusValue })
        .eq('id', actionSpot.id)

      if (spotError) throw spotError

      // 2. Log action
      const { error: actionError } = await supabase.from('moderation_actions').insert({
        spot_id: actionSpot.id,
        moderator_id: moderatorId,
        action_type: actionType === 'reject' ? 'reject' : 'request_changes',
        reason: reason,
      })

      if (actionError) throw actionError

      toast.success(actionType === 'reject' ? 'Spot rejected.' : 'Changes requested.')
      setSpots((prev) => prev.filter((s) => s.id !== actionSpot.id))
      setActionSpot(null)
      setReason('')
    } catch (err) {
      toast.error(errMessage(err, 'Failed to complete moderation action'))
    } finally {
      setActionLoading(false)
    }
  }

  // Review an edit suggestion — approve auto-applies the diff via RPC.
  const handleReviewSuggestion = async (suggestionId: string, action: 'approve' | 'reject') => {
    setReviewingId(suggestionId)
    try {
      const { error } = await supabase.rpc('review_edit_suggestion', {
        p_suggestion_id: suggestionId,
        p_action: action,
        p_reason: null,
      })
      if (error) throw error

      toast.success(
        action === 'approve'
          ? 'Edit applied to the spot — contributor credited!'
          : 'Suggestion rejected.'
      )
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
    } catch (err) {
      toast.error(errMessage(err, 'Failed to review the suggestion'))
    } finally {
      setReviewingId(null)
    }
  }

  const handleReviewReel = async (submissionId: string, action: 'approve' | 'reject') => {
    setReviewingId(submissionId)
    try {
      const { error } = await supabase.rpc('review_reel_submission', {
        p_submission_id: submissionId,
        p_action: action,
        p_reason: null,
      })
      if (error) throw error

      toast.success(
        action === 'approve'
          ? 'Reel is now live on the spot — contributor credited!'
          : 'Reel submission rejected.'
      )
      setReelSubmissions((prev) => prev.filter((r) => r.id !== submissionId))
    } catch (err) {
      toast.error(errMessage(err, 'Failed to review the reel submission'))
    } finally {
      setReviewingId(null)
    }
  }

  // Resolve Report (Soft Delete Spot)
  const handleResolveReport = async (reportId: string, spotId: string) => {
    try {
      // 1. Mark report resolved
      const { error: reportError } = await supabase
        .from('spot_reports')
        .update({
          status: 'resolved',
          resolved_by: moderatorId,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId)

      if (reportError) throw reportError

      // 2. Soft delete the spot
      const { error: spotError } = await supabase
        .from('spots')
        .update({ is_deleted: true })
        .eq('id', spotId)

      if (spotError) throw spotError

      // 3. Log action
      const { error: actionError } = await supabase.from('moderation_actions').insert({
        spot_id: spotId,
        moderator_id: moderatorId,
        action_type: 'soft_delete',
        reason: 'Soft deleted due to resolved user reports',
      })

      if (actionError) throw actionError

      toast.success('Report resolved and spot soft-deleted!')
      setReports((prev) => prev.filter((r) => r.id !== reportId))
    } catch (err) {
      toast.error(errMessage(err, 'Failed to resolve report'))
    }
  }

  // Dismiss Report
  const handleDismissReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('spot_reports')
        .update({
          status: 'dismissed',
          resolved_by: moderatorId,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId)

      if (error) throw error

      toast.success('Report ticket dismissed.')
      setReports((prev) => prev.filter((r) => r.id !== reportId))
    } catch (err) {
      toast.error(errMessage(err, 'Failed to dismiss report'))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Moderation Desk</h1>
        <p className="text-muted-foreground mt-1">Review pending location entries and resolve flag reports.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass mb-6">
          <TabsTrigger value="submissions">Submissions ({spots.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="edits">Edits ({suggestions.length})</TabsTrigger>
          <TabsTrigger value="reels">Reels ({reelSubmissions.length})</TabsTrigger>
        </TabsList>

        {/* 1. Submissions Tab Content */}
        <TabsContent value="submissions" className="space-y-6 outline-none">
          {spots.length > 0 ? (
            spots.map((spot) => {
              const duplicate = duplicates[spot.id]

              return (
                <Card key={spot.id} className="glass overflow-hidden border-border/50 shadow-md">
                  <div className="flex flex-col lg:flex-row">
                    {/* Left Column: Visual Cover */}
                    <div className="relative h-56 lg:h-auto lg:w-80 flex-shrink-0">
                      <Image
                        src={spot.cover_image}
                        alt={spot.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 320px"
                        className="object-cover"
                      />
                    </div>

                    {/* Middle Column: Metadata */}
                    <div className="flex-1 p-6 space-y-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-emerald-600 dark:text-teal-400 font-semibold uppercase tracking-wider">
                            {spot.category.name}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Submitted {new Date(spot.created_at).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>

                        <h3 className="font-heading text-xl font-bold mt-1 text-foreground">
                          {spot.title}
                        </h3>

                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Compass className="h-3.5 w-3.5 mr-1" />
                          <span>
                            {spot.address} ({spot.district.name}, {spot.state.name})
                          </span>
                        </div>
                      </div>

                      {/* Duplicate Flag Alert */}
                      {duplicate && (
                        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 flex items-start space-x-2.5 text-xs animate-pulse">
                          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Duplicate Warning ({duplicate.confidence}% Confidence)</span>
                            <p className="mt-0.5 text-muted-foreground">{duplicate.reason}</p>
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {spot.description}
                      </p>

                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-muted-foreground">Contributor:</span>
                        <span className="font-semibold text-foreground">@{spot.creator.username}</span>
                        <span className="text-muted-foreground">({spot.creator.full_name})</span>
                      </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="border-t lg:border-t-0 lg:border-l border-border/50 p-6 flex flex-col lg:flex-col justify-center gap-3 lg:w-48 bg-muted/10">
                      <Button
                        onClick={() => handleApprove(spot.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActionSpot(spot)
                          setActionType('changes')
                        }}
                        className="w-full border-border/50 font-semibold text-muted-foreground hover:text-foreground"
                      >
                        Changes
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setActionSpot(spot)
                          setActionType('reject')
                        }}
                        className="w-full text-destructive hover:bg-destructive/10 font-semibold"
                      >
                        <X className="h-4 w-4 mr-1.5" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-20 rounded-2xl bg-muted/20 border border-dashed border-border/50 glass">
              <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
              <h3 className="font-heading text-lg font-bold">Submissions Queue Clear</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                No spots are currently awaiting review. Great job!
              </p>
            </div>
          )}
        </TabsContent>

        {/* 2. Reports Tab Content */}
        <TabsContent value="reports" className="space-y-6 outline-none">
          {reports.length > 0 ? (
            reports.map((report) => (
              <Card key={report.id} className="glass border-border/50 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive" className="uppercase text-[10px] tracking-wider px-2 py-0.5">
                        {report.report_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Reported {new Date(report.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <h4 className="font-heading text-lg font-bold text-foreground">
                      Ticket on Spot: <span className="text-emerald-600">{report.spot?.title || 'Unknown Spot'}</span>
                    </h4>

                    <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/50">
                      &ldquo;{report.description}&rdquo;
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
                    <Button
                      onClick={() => handleResolveReport(report.id, report.spot_id)}
                      variant="destructive"
                      className="flex-1 md:flex-none font-semibold gap-1.5"
                    >
                      <AlertOctagon className="h-4 w-4" />
                      <span>Resolve (Delete)</span>
                    </Button>
                    <Button
                      onClick={() => handleDismissReport(report.id)}
                      variant="outline"
                      className="flex-1 md:flex-none border-border/50 font-semibold"
                    >
                      Dismiss Ticket
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 rounded-2xl bg-muted/20 border border-dashed border-border/50 glass">
              <Check className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
              <h3 className="font-heading text-lg font-bold">Reports Queue Clear</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                No active flags or reports on live gems.
              </p>
            </div>
          )}
        </TabsContent>

        {/* 3. Community Edit Suggestions Tab Content */}
        <TabsContent value="edits" className="space-y-6 outline-none">
          {suggestions.length > 0 ? (
            suggestions.map((sug) => (
              <Card key={sug.id} className="glass border-border/50 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <Badge className="bg-emerald-600 text-white uppercase text-[10px] tracking-wider px-2 py-0.5">
                        Edit Suggestion
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sug.created_at).toLocaleDateString('en-IN')} · by{' '}
                        <span className="font-semibold text-foreground">
                          @{sug.suggester?.username || 'unknown'}
                        </span>
                      </span>
                    </div>

                    <h4 className="font-heading text-lg font-bold text-foreground">
                      Fixes for: <span className="text-emerald-600">{sug.spot?.title || 'Unknown Spot'}</span>
                    </h4>

                    {/* Field-level diff */}
                    <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/50">
                      {Object.entries(sug.changes).map(([field, change]) => (
                        <div key={field} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-1 sm:gap-3 p-3 text-sm bg-muted/20">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-0.5">
                            {EDIT_FIELD_LABELS[field] ?? field}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="text-muted-foreground line-through decoration-red-400/60 break-words">
                              {formatEditValue(change.from)}
                            </div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-medium break-words">
                              {formatEditValue(change.to)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {sug.note && (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                        <span className="font-semibold">Contributor&rsquo;s note:</span> &ldquo;{sug.note}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
                    <Button
                      onClick={() => handleReviewSuggestion(sug.id, 'approve')}
                      disabled={reviewingId === sug.id}
                      className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5"
                    >
                      {reviewingId === sug.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span>Approve &amp; Apply</span>
                    </Button>
                    <Button
                      onClick={() => handleReviewSuggestion(sug.id, 'reject')}
                      disabled={reviewingId === sug.id}
                      variant="outline"
                      className="flex-1 md:flex-none border-border/50 font-semibold text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 rounded-2xl bg-muted/20 border border-dashed border-border/50 glass">
              <Check className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
              <h3 className="font-heading text-lg font-bold">No Pending Edits</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                Community edit suggestions will land here for one-click review.
              </p>
            </div>
          )}
        </TabsContent>

        {/* TAB 4: Community reel submissions */}
        <TabsContent value="reels" className="space-y-6 outline-none">
          {reelSubmissions.length > 0 ? (
            reelSubmissions.map((sub) => (
              <Card key={sub.id} className="glass border-border/50 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <Badge className="bg-emerald-600 text-white uppercase text-[10px] tracking-wider px-2 py-0.5">
                        Reel Submission
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString('en-IN')} · by{' '}
                        <span className="font-semibold text-foreground">
                          @{sub.submitter?.username || 'unknown'}
                        </span>
                      </span>
                    </div>

                    <h4 className="font-heading text-lg font-bold text-foreground">
                      Reel for: <span className="text-emerald-600">{sub.spot?.title || 'Unknown Spot'}</span>
                    </h4>

                    <a
                      href={sub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block max-w-full truncate rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      {sub.url}
                    </a>

                    {sub.note && (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                        <span className="font-semibold">Contributor&rsquo;s note:</span> &ldquo;{sub.note}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
                    <Button
                      onClick={() => handleReviewReel(sub.id, 'approve')}
                      disabled={reviewingId === sub.id}
                      className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5"
                    >
                      {reviewingId === sub.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span>Approve &amp; Publish</span>
                    </Button>
                    <Button
                      onClick={() => handleReviewReel(sub.id, 'reject')}
                      disabled={reviewingId === sub.id}
                      variant="outline"
                      className="flex-1 md:flex-none border-border/50 font-semibold text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 rounded-2xl bg-muted/20 border border-dashed border-border/50 glass">
              <Check className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
              <h3 className="font-heading text-lg font-bold">No Pending Reels</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                Community-submitted reels will land here for one-click review.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject / Changes Reasons Prompt Dialog */}
      <Dialog open={!!actionSpot} onOpenChange={(open) => { if(!open) setActionSpot(null); }}>
        <DialogContent className="sm:max-w-[420px] glass">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-600" />
              <span>
                {actionType === 'reject' ? 'Reject Submission' : 'Request Changes'}
              </span>
            </DialogTitle>
            <DialogDescription>
              {actionType === 'reject'
                ? 'Provide a reason explaining why this spot was rejected. This is permanently archived.'
                : 'Request changes. The contributor will see this feedback and can edit their draft spot.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Moderator Feedback</label>
              <Textarea
                placeholder="Type your review notes here..."
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="glass"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setActionSpot(null)} disabled={actionLoading} className="w-1/3">
              Cancel
            </Button>
            <Button
              onClick={handleActionSubmit}
              disabled={actionLoading}
              className={`w-2/3 ${actionType === 'reject' ? 'bg-red-600 hover:bg-red-500' : 'gradient-btn'}`}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : actionType === 'reject' ? (
                'Reject'
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
