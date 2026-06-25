import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ModerationQueueClient } from '@/components/admin/moderation-queue-client'

export const metadata = {
  title: 'Moderation Queue | HiddenSpot Admin',
}

export default async function ModerationPage() {
  const supabase = await createClient()

  // Verify Role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/?auth=required')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    redirect('/')
  }

  // 1. Fetch pending spots
  const { data: pendingSpots } = await supabase
    .from('spots')
    .select(`
      *,
      category:categories(id, name),
      state:states(id, name),
      district:districts(id, name),
      creator:profiles(id, username, full_name)
    `)
    .eq('status', 'pending')
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  // 2. Fetch pending reports
  const { data: activeReports } = await supabase
    .from('spot_reports')
    .select(`
      *,
      spot:spots(id, title, slug, cover_image, state_id, district_id)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <ModerationQueueClient
      initialSpots={pendingSpots || []}
      initialReports={activeReports || []}
      moderatorId={user.id}
    />
  )
}
