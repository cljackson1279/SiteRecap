import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
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

  // If no code, redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`)
}