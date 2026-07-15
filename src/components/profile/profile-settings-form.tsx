'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Check, X, Loader2, User, ExternalLink } from 'lucide-react'

const settingsSchema = z.object({
  full_name: z.string().trim().min(1, 'Please enter your name').max(80),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'At least 3 characters')
    .max(30, 'At most 30 characters')
    .regex(/^[a-z0-9_]+$/, 'Only letters, numbers, and underscores'),
  bio: z.string().trim().max(200, 'Keep it under 200 characters').optional().or(z.literal('')),
})

type SettingsValues = z.infer<typeof settingsSchema>

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken'

interface ProfileSettingsFormProps {
  userId: string
  initialUsername: string
  initialFullName: string
  initialBio: string
}

export function ProfileSettingsForm({
  userId,
  initialUsername,
  initialFullName,
  initialBio,
}: ProfileSettingsFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      full_name: initialFullName,
      username: initialUsername,
      bio: initialBio,
    },
  })

  const watchedUsername = watch('username')
  const watchedBio = watch('bio') ?? ''

  // Debounced live availability check; the user's current name is always "available".
  useEffect(() => {
    const candidate = (watchedUsername ?? '').trim().toLowerCase()

    if (candidate === initialUsername) {
      setUsernameStatus('idle')
      return
    }
    if (candidate.length < 3 || !/^[a-z0-9_]+$/.test(candidate)) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', candidate)
        .neq('id', userId)
        .maybeSingle()

      if (error) {
        setUsernameStatus('idle')
        return
      }
      setUsernameStatus(data ? 'taken' : 'available')
    }, 500)

    return () => clearTimeout(timer)
  }, [watchedUsername, initialUsername, userId, supabase])

  const onSubmit = async (values: SettingsValues) => {
    if (usernameStatus === 'taken') {
      toast.error('That username is already taken')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          username: values.username,
          bio: values.bio || null,
        })
        .eq('id', userId)

      if (error) {
        // Unique-violation race: someone claimed the name between check and save.
        if (error.code === '23505') {
          setUsernameStatus('taken')
          toast.error('That username was just taken — try another')
          return
        }
        throw error
      }

      toast.success('Profile updated!')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save your profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="glass shadow-xl border-border/50">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="full_name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name
            </label>
            <Input id="full_name" {...register('full_name')} placeholder="Your name" className="glass" />
            {errors.full_name && (
              <span className="text-xs text-destructive">{errors.full_name.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">@</span>
              <Input
                id="username"
                {...register('username')}
                placeholder="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="pl-7 pr-9 glass lowercase"
              />
              <span className="absolute right-3 top-2.5">
                {usernameStatus === 'checking' && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {usernameStatus === 'available' && <Check className="h-4 w-4 text-brand dark:text-brand-cream" />}
                {usernameStatus === 'taken' && <X className="h-4 w-4 text-destructive" />}
              </span>
            </div>
            {errors.username ? (
              <span className="text-xs text-destructive">{errors.username.message}</span>
            ) : usernameStatus === 'taken' ? (
              <span className="text-xs text-destructive">This username is already taken</span>
            ) : usernameStatus === 'available' ? (
              <span className="text-xs text-brand dark:text-brand-cream">Available!</span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Changing this also changes your profile link.
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bio <span className="normal-case font-normal">(optional)</span>
              </label>
              <span className={`text-[10px] ${watchedBio.length > 200 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {watchedBio.length}/200
              </span>
            </div>
            <Textarea
              id="bio"
              {...register('bio')}
              rows={3}
              placeholder="A line about the kind of places you love to find…"
              className="glass resize-none"
            />
            {errors.bio && <span className="text-xs text-destructive">{errors.bio.message}</span>}
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/50">
            <Link
              href={`/profile/${initialUsername}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              View profile
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Button
              type="submit"
              disabled={saving || !isDirty || usernameStatus === 'checking' || usernameStatus === 'taken'}
              className="gradient-btn px-6"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
