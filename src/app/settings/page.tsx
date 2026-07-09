import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileSettingsForm } from '@/components/profile/profile-settings-form'

export const metadata = {
  title: 'Profile Settings | HiddenSpots.in',
  description: 'Edit your HiddenSpot explorer profile.',
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/?auth=required')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    redirect('/?auth=required')
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="space-y-2 mb-8">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground text-sm">
          How other explorers see you across HiddenSpot.
        </p>
      </div>

      <ProfileSettingsForm
        userId={profile.id}
        initialUsername={profile.username ?? ''}
        initialFullName={profile.full_name ?? ''}
        initialBio={profile.bio ?? ''}
      />
    </div>
  )
}
