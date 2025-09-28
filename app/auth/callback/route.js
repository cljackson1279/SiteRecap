import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const email = requestUrl.searchParams.get('email')
  
  // Use the correct base URL from environment or fallback
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://siterecap.com'

  // Process email confirmation with minimal logging

  // Create a new Supabase client for server-side auth handling
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  if (code) {
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${baseUrl}/login?message=Unable to confirm email. Please try again.&type=error`)
      }

      if (data?.session && data?.user) {
        // Successfully confirmed and session created
        console.log('Email confirmation successful, redirecting to dashboard')
        
        // Instead of setting cookies, redirect to a client-side handler that will manage the session
        return NextResponse.redirect(`${baseUrl}/auth/success?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&expires_in=${data.session.expires_in}`)
      } else {
        console.log('Email confirmation failed: no session or user data')
        return NextResponse.redirect(`${baseUrl}/login?message=Email confirmed but session creation failed. Please log in manually.&type=error`)
      }
    } catch (error) {
      console.error('Callback processing error:', error)
      return NextResponse.redirect(`${baseUrl}/login?message=Email confirmation failed. Please try again.&type=error`)
    }
  }

  // Handle email confirmation with token_hash (newer Supabase format)
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

      if (data?.session && data?.user) {
        // Successfully confirmed and session created
        console.log('Email confirmation successful, redirecting to dashboard')
        
        // Instead of setting cookies, redirect to a client-side handler that will manage the session
        return NextResponse.redirect(`${baseUrl}/auth/success?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&expires_in=${data.session.expires_in}`)
      } else {
        console.log('Email confirmation failed: no session or user data')
        return NextResponse.redirect(`${baseUrl}/login?message=Email confirmed but session creation failed. Please log in manually.&type=error`)
      }
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