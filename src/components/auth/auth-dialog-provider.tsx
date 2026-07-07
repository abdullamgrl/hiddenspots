'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSupabaseAuth, isProfileIncomplete, friendlyAuthError } from '@/hooks/use-supabase-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

interface AuthDialogContextValue {
  /** Open the sign-in dialog from anywhere (e.g. "sign in to save"). */
  openAuthDialog: () => void
}

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null)

export function useAuthDialog(): AuthDialogContextValue {
  const ctx = useContext(AuthDialogContext)
  if (!ctx) throw new Error('useAuthDialog must be used inside <AuthDialogProvider>')
  return ctx
}

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { sendOtp, verifyOtp, updateProfile } = useSupabaseAuth()

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Support ?auth=required redirects (from proxy-protected routes). Deferred a
  // tick so the dialog opens after paint instead of inside the effect pass.
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('auth') !== 'required') return
    window.history.replaceState({}, '', window.location.pathname)
    const t = setTimeout(() => setOpen(true), 0)
    return () => clearTimeout(t)
  }, [pathname])

  const resetForm = () => {
    setStep('phone')
    setPhone('')
    setCode('')
    setUsername('')
    setFullName('')
  }

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
      setStep('otp')
    } catch (err) {
      toast.error(friendlyAuthError(err, 'Failed to send OTP'))
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

      // Check the DB directly to avoid state-synchronization lag.
      const supabase = createClient()
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', verifiedUser?.id ?? '')
        .maybeSingle()

      if (verifiedUser && isProfileIncomplete(existingProfile)) {
        setStep('profile')
      } else {
        setOpen(false)
        resetForm()
      }
    } catch (err) {
      toast.error(friendlyAuthError(err, 'Invalid verification code'))
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
      setOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === '23505') {
        toast.error('That username is already taken — try another')
      } else {
        toast.error(friendlyAuthError(err, 'Failed to complete profile setup'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthDialogContext.Provider value={{ openAuthDialog: () => setOpen(true) }}>
      {children}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
        <DialogContent className="sm:max-w-[420px] glass">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand dark:text-brand-cream" />
              {step === 'phone' && 'Join HiddenSpot'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'profile' && 'Complete Profile'}
            </DialogTitle>
            <DialogDescription>
              {step === 'phone' && 'Enter your mobile number to sign in or register instantly.'}
              {step === 'otp' && `Enter the 6-digit verification code sent to ${phone}.`}
              {step === 'profile' && 'Choose your unique username to start sharing spots.'}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Phone submission */}
          {step === 'phone' && (
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
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verification Code</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={submitting}
                  className="text-center text-lg font-bold letter-spacing-lg"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep('phone')} disabled={submitting} className="w-1/3">
                  Back
                </Button>
                <Button type="submit" disabled={submitting} className="w-2/3 gradient-btn">
                  {submitting ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Complete Profile */}
          {step === 'profile' && (
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
    </AuthDialogContext.Provider>
  )
}
