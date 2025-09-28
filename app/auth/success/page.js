'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const access_token = searchParams.get('access_token')
      const refresh_token = searchParams.get('refresh_token')
      const expires_in = searchParams.get('expires_in')

      if (access_token && refresh_token) {
        try {
          // Set the session in Supabase client
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          })

          if (error) {
            console.error('Error setting session:', error)
            router.push('/login?message=Session creation failed. Please log in manually.&type=error')
            return
          }

          if (data.session && data.user) {
            console.log('Session successfully set for user:', data.user.email)
            // Redirect to dashboard with confirmation
            router.push('/dashboard?confirmed=true')
          } else {
            console.error('No session or user data after setting session')
            router.push('/login?message=Authentication failed. Please log in manually.&type=error')
          }
        } catch (error) {
          console.error('Authentication error:', error)
          router.push('/login?message=Authentication failed. Please log in manually.&type=error')
        }
      } else {
        console.error('Missing access_token or refresh_token')
        router.push('/login?message=Invalid authentication parameters. Please log in manually.&type=error')
      }
    }

    handleAuthSuccess()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg to-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Confirming your account...</h2>
        <p className="text-muted-foreground">You'll be redirected to your dashboard in a moment.</p>
      </div>
    </div>
  )
}