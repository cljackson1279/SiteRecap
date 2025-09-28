import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=Unable to confirm email`)
      }

      // Successfully confirmed - redirect to dashboard
      return NextResponse.redirect(`${requestUrl.origin}/dashboard?confirmed=true`)
    } catch (error) {
      console.error('Callback processing error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Authentication failed`)
    }
  }

  // Handle email confirmation with token_hash
  if (token_hash && type) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type
      })

      if (error) {
        console.error('Email verification error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=Email confirmation failed`)
      }

      // Successfully confirmed - redirect to dashboard
      return NextResponse.redirect(`${requestUrl.origin}/dashboard?confirmed=true`)
    } catch (error) {
      console.error('Token verification error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Confirmation failed`)
    }
  }

  // If no code or token, redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`)
}