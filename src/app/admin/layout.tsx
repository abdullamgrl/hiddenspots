import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, BarChart3, ListCollapse, ArrowLeft } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <span className="font-heading text-lg font-bold">Mod Panel</span>
        </div>

        <nav className="flex-1 space-y-1">
          <Link
            href="/admin"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </Link>
          <Link
            href="/admin/moderation"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ListCollapse className="h-4 w-4" />
            <span>Moderation Queue</span>
          </Link>
        </nav>

        <div className="pt-6 border-t border-border/50 space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 sm:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
