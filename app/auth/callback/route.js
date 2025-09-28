import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const email = requestUrl.searchParams.get('email')
  
  // Use the correct base URL from environment or fallback
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || requestUrl.origin

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${baseUrl}/login?message=Unable to confirm email. Please try again.&type=error`)
      }

      // Successfully confirmed - redirect to dashboard if session exists, otherwise login
      if (data?.user) {
        return NextResponse.redirect(`${baseUrl}/dashboard?confirmed=true`)
      } else {
        return NextResponse.redirect(`${baseUrl}/login?message=Email confirmed successfully! Please log in with your credentials.&type=success`)
      }
    } catch (error) {
      console.error('Callback processing error:', error)
      return NextResponse.redirect(`${baseUrl}/login?message=Email confirmation failed. Please try again.&type=error`)
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
        return NextResponse.redirect(`${baseUrl}/login?message=Email confirmation failed. Please try again.&type=error`)
      }

      // Successfully confirmed - redirect to login with success message
      return NextResponse.redirect(`${baseUrl}/login?message=Email confirmed successfully! Please log in with your credentials.&type=success`)
    } catch (error) {
      console.error('Token verification error:', error)
      return NextResponse.redirect(`${baseUrl}/login?message=Confirmation failed. Please try again.&type=error`)
    }
  }

  // Simple email confirmation fallback (for custom emails)
  if (email) {
    return NextResponse.redirect(`${baseUrl}/login?message=Please check your email for confirmation and then log in with your credentials.&type=info`)
  }

  // If no parameters, redirect to login
  return NextResponse.redirect(`${baseUrl}/login`)
}