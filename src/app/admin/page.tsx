import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Compass, ShieldAlert, Sparkles, Users, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1. Fetch counts
  const { count: totalSpots } = await supabase.from('spots').select('*', { count: 'exact', head: true })
  const { count: pendingSpots } = await supabase.from('spots').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  const { count: approvedSpots } = await supabase.from('spots').select('*', { count: 'exact', head: true }).eq('status', 'approved')
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: pendingReports } = await supabase.from('spot_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Overview Analytics</h1>
        <p className="text-muted-foreground mt-1">Real-time status of HiddenSpot platform metadata.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Total Spots</CardTitle>
            <Compass className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSpots || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Submitted in database</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSpots || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Approved Spots</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedSpots || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Live on platform</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered contributors</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Callout */}
      {pendingReports && pendingReports > 0 ? (
        <Card className="border-red-500/20 bg-red-500/5 text-red-900 dark:text-red-300">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-sm">
              <ShieldAlert className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div>
                <span className="font-bold">Pending Reports Queue ({pendingReports})</span>
                <p className="text-muted-foreground mt-0.5">
                  Users have reported spots containing inappropriate content, duplicates, or incorrect coordinates.
                </p>
              </div>
            </div>
            <Link
              href="/admin/moderation?tab=reports"
              className={buttonVariants({ variant: "destructive", size: "sm" })}
            >
              Resolve Tickets
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* Action shortcuts */}
      <Card className="glass p-6">
        <h3 className="font-heading text-lg font-bold mb-4">Quick Shortcuts</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/moderation"
            className={`${buttonVariants({ variant: "default" })} gradient-btn`}
          >
            Go to Moderation Queue
          </Link>
          <Link
            href="/add-spot"
            className={`${buttonVariants({ variant: "outline" })} border-border/50`}
          >
            Submit new Spot
          </Link>
        </div>
      </Card>
    </div>
  )
}
