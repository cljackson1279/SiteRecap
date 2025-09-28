import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  
  return NextResponse.json({
    environment_variables: {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
    },
    request_info: {
      origin: requestUrl.origin,
      host: requestUrl.host,
      pathname: requestUrl.pathname
    },
    computed_base_url: process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://siterecap.com',
    auth_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://siterecap.com'}/auth/callback`,
    timestamp: new Date().toISOString()
  })
}