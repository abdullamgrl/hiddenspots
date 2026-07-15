'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  role: 'visitor' | 'contributor' | 'moderator' | 'admin'
  reputation_score: number
  bio: string | null
  created_at: string
  updated_at: string
}

// phone is deliberately absent: the column is not API-readable (column
// grants); the signed-in user's own number lives on the auth User object.
const PROFILE_COLUMNS =
  'id, username, full_name, avatar_url, role, reputation_score, bio, created_at, updated_at'

// The signup trigger seeds username as "user_<id-prefix>" and an empty
// full_name; either signals the user hasn't completed the profile step yet.
export function isProfileIncomplete(profile: Pick<Profile, 'username' | 'full_name'> | null): boolean {
  if (!profile) return true
  return !profile.username || profile.username.startsWith('user_') || !profile.full_name
}

// Map raw Supabase auth errors to messages worth showing a person.
export function friendlyAuthError(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/rate limit|too many/i.test(msg)) return 'Too many attempts — please wait a minute and try again.'
  if (/expired/i.test(msg)) return 'That code has expired — request a new one.'
  if (/invalid.*(otp|token|code)|(otp|token|code).*invalid/i.test(msg)) return "That code doesn't match — double-check and try again."
  if (/invalid.*phone|phone.*invalid/i.test(msg)) return 'That phone number doesn\'t look right — use your 10-digit mobile number.'
  if (/network|fetch failed|failed to fetch/i.test(msg)) return 'Network hiccup — check your connection and try again.'
  return msg || fallback
}

export function useSupabaseAuth() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // maybeSingle: the profile row is created by a DB trigger and can lag the
    // auth session by a beat — a missing row must not throw.
    const fetchProfile = async (userId: string): Promise<Profile | null> => {
      const { data } = await supabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .maybeSingle()
      return data
    }

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        setProfile(await fetchProfile(session.user.id))
      }
      setLoading(false)
    }

    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setProfile(session?.user ? await fetchProfile(session.user.id) : null)
        setLoading(false)
        // Only sign-in/out changes what the server renders; skip refresh on
        // token refreshes so the app doesn't reload every hour.
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          router.refresh()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const sendOtp = async (phone: string) => {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    })
    if (error) throw error
  }

  const verifyOtp = async (phone: string, token: string) => {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms',
    })
    if (error) throw error
    return data.user
  }

  const updateProfile = async (username: string, fullName: string) => {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.toLowerCase().trim(),
        full_name: fullName.trim(),
      })
      .eq('id', user.id)

    if (error) throw error

    const { data: prof } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', user.id)
      .maybeSingle()
    setProfile(prof)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  return {
    user,
    profile,
    loading,
    sendOtp,
    verifyOtp,
    updateProfile,
    signOut,
  }
}
