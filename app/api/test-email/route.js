import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('Testing email send to:', email)
    console.log('Using API key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing')
    console.log('From address:', process.env.EMAIL_FROM)

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'support@siterecap.com',
      to: [email],
      subject: 'SiteRecap Email Test',
      html: `
        <h2>Email Test Successful!</h2>
        <p>This is a test email to verify SiteRecap's email service is working.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
        <p>Domain: https://siterecap.com</p>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ 
        error: 'Email send failed', 
        details: error.message,
        resend_error: error 
      }, { status: 500 })
    }

    console.log('Email sent successfully:', data)
    return NextResponse.json({ 
      success: true, 
      messageId: data.id,
      message: 'Test email sent successfully'
    })

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint',
    resend_api_key_present: !!process.env.RESEND_API_KEY,
    email_from: process.env.EMAIL_FROM,
    base_url: process.env.NEXT_PUBLIC_BASE_URL
  })
}