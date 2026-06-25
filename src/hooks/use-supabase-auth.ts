'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useSupabaseAuth() {
  const supabase = createClient()
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(prof)
      }
      setLoading(false)
    }

    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(prof)
        } else {
          setProfile(null)
        }
        setLoading(false)
        router.refresh()
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) throw error

    // Fetch updated profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
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
