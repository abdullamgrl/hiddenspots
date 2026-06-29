'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/hooks/use-supabase-auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Compass, Menu, PlusCircle, ShieldAlert, Sparkles, User, LogOut, CheckCircle } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, sendOtp, verifyOtp, updateProfile, signOut } = useSupabaseAuth()

  // Auth Dialog state
  const [authOpen, setAuthOpen] = useState(false)
  const [authStep, setAuthStep] = useState<'phone' | 'otp' | 'profile'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Open auth dialog if requested via URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      if (searchParams.get('auth') === 'required') {
        setAuthOpen(true)
        // Clean URL parameter
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [pathname])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }
    setSubmitting(true)
    try {
      await sendOtp(phone)
      toast.success('OTP sent successfully to your mobile!')
      setAuthStep('otp')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code')
      return
    }
    setSubmitting(true)
    try {
      const verifiedUser = await verifyOtp(phone, code)
      toast.success('Successfully logged in!')
      
      // Directly check DB for profile to avoid state synchronization lag
      const supabase = createClient()
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', verifiedUser?.id)
        .maybeSingle()
      
      // If user profile is incomplete, prompt profile setup step
      if (verifiedUser && (!existingProfile?.username || existingProfile.username.startsWith('user_'))) {
        setAuthStep('profile')
      } else {
        setAuthOpen(false)
        resetForm()
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid verification code')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters long')
      return
    }
    setSubmitting(true)
    try {
      await updateProfile(username, fullName)
      toast.success('Profile created successfully! Welcome to HiddenSpot.')
      setAuthOpen(false)
      resetForm()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete profile setup')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setAuthStep('phone')
    setPhone('')
    setCode('')
    setUsername('')
    setFullName('')
  }

  const handleAddSpotClick = () => {
    if (!user) {
      setAuthOpen(true)
    } else {
      router.push('/add-spot')
    }
  }

  return (
    <header className="glass-nav sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Compass className="h-6 w-6 animate-pulse" />
          </div>
          <span className="font-heading text-xl font-extrabold tracking-tight">
            Hidden<span className="text-emerald-600 dark:text-teal-400">Spot</span>
            <span className="text-xs font-semibold text-muted-foreground ml-1">.in</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
              pathname === '/' ? 'text-emerald-600 dark:text-teal-400' : 'text-muted-foreground'
            }`}
          >
            Explore
          </Link>
          <Link
            href="/map"
            className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
              pathname === '/map' ? 'text-emerald-600 dark:text-teal-400' : 'text-muted-foreground'
            }`}
          >
            Map
          </Link>
          <button
            onClick={handleAddSpotClick}
            className="flex items-center space-x-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-emerald-600"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Spot</span>
          </button>

          {/* Role actions / Auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                  <User className="h-5 w-5" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-56 glass">
                <DropdownMenuLabel className="font-heading">
                  <div className="font-bold">{profile?.full_name || 'Contributor'}</div>
                  <div className="text-xs text-muted-foreground font-normal">@{profile?.username || 'user'}</div>
                  <div className="mt-1 flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-amber-500 font-semibold">{profile?.reputation_score || 10} Rep</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={
                  <Link href={`/profile/${profile?.username}`} className="cursor-pointer" />
                }>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                {profile?.role && (profile.role === 'admin' || profile.role === 'moderator') && (
                  <DropdownMenuItem render={
                    <Link href="/admin" className="cursor-pointer text-emerald-600 dark:text-teal-400 font-medium" />
                  }>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <span>Moderator Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setAuthOpen(true)} className="gradient-btn">
              Sign In
            </Button>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                  <User className="h-5 w-5" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-56 glass">
                <DropdownMenuLabel className="font-heading">
                  <div className="font-bold">{profile?.full_name || 'Contributor'}</div>
                  <div className="text-xs text-muted-foreground font-normal">@{profile?.username || 'user'}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={
                  <Link href={`/profile/${profile?.username}`} className="cursor-pointer" />
                }>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddSpotClick} className="cursor-pointer">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Add Spot</span>
                </DropdownMenuItem>
                {profile?.role && (profile.role === 'admin' || profile.role === 'moderator') && (
                  <DropdownMenuItem render={
                    <Link href="/admin" className="cursor-pointer text-emerald-600 dark:text-teal-400 font-medium" />
                  }>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <span>Moderator Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setAuthOpen(true)} size="sm" className="gradient-btn">
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <Dialog open={authOpen} onOpenChange={(open) => { setAuthOpen(open); if(!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[420px] glass">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              {authStep === 'phone' && 'Join HiddenSpot'}
              {authStep === 'otp' && 'Verify OTP'}
              {authStep === 'profile' && 'Complete Profile'}
            </DialogTitle>
            <DialogDescription>
              {authStep === 'phone' && 'Enter your mobile number to sign in or register instantly.'}
              {authStep === 'otp' && `Enter the 6-digit verification code sent to ${phone}.`}
              {authStep === 'profile' && 'Choose your unique username to start sharing spots.'}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Phone submission */}
          {authStep === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mobile Number</label>
                <div className="flex rounded-md border border-input bg-transparent">
                  <span className="flex items-center px-3 text-sm text-muted-foreground border-r border-input bg-muted/30">+91</span>
                  <Input
                    type="tel"
                    placeholder="Enter 10 digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    disabled={submitting}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full gradient-btn">
                {submitting ? 'Sending OTP...' : 'Send OTP code'}
              </Button>
            </form>
          )}

          {/* Step 2: OTP verification */}
          {authStep === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verification Code</label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={submitting}
                  className="text-center text-lg font-bold letter-spacing-lg"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setAuthStep('phone')} disabled={submitting} className="w-1/3">
                  Back
                </Button>
                <Button type="submit" disabled={submitting} className="w-2/3 gradient-btn">
                  {submitting ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Complete Profile */}
          {authStep === 'profile' && (
            <form onSubmit={handleCompleteProfile} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <Input
                  type="text"
                  placeholder="E.g., Abdulla"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">@</span>
                  <Input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    disabled={submitting}
                    className="pl-7"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Only letters, numbers, and underscores. Min 3 characters.</p>
              </div>
              <Button type="submit" disabled={submitting} className="w-full gradient-btn">
                {submitting ? 'Setting up Profile...' : 'Complete Profile Setup'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </header>
  )
}
