import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddSpotForm } from '@/components/spot/add-spot-form'

export const metadata = {
  title: 'Share a Hidden Spot | HiddenSpot.in',
  description: 'Contribute a new travel viewpoint, waterfall, or secret place to the HiddenSpot community.',
}

export default async function AddSpotPage() {
  const supabase = await createClient()

  // 1. Authenticate check on server side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/?auth=required')
  }

  // 2. Fetch seed categories, states, and districts
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  const { data: states } = await supabase
    .from('states')
    .select('id, name, slug, code')
    .order('name', { ascending: true })

  const { data: districts } = await supabase
    .from('districts')
    .select('id, state_id, name, slug')
    .order('name', { ascending: true })

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Share a Hidden Spot</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Help others discover beautiful places. All submissions are queued for moderator verification.
        </p>
      </div>

      <AddSpotForm
        categories={categories || []}
        states={states || []}
        districts={districts || []}
        userId={user.id}
      />
    </div>
  )
}
