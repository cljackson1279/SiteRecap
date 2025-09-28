import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Use Supabase resend method for confirmation emails
    const { error } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
      }
    })

    if (error && error.message !== 'User already registered') {
      throw error
    }

    // Send our custom branded confirmation email
    const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?email=${encodeURIComponent(email)}`
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirm Your SiteRecap Account</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 3px solid #168995;
            margin-bottom: 30px;
        }
        .logo {
            color: #168995;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .button {
            display: inline-block;
            background-color: #168995;
            color: white !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🏗️ SiteRecap</div>
        <p>Professional Daily Construction Reports</p>
    </div>
    
    <h2>Almost There!</h2>
    
    <p>Thank you for joining SiteRecap! Click the button below to confirm your email address and start creating professional construction reports:</p>
    
    <div style="text-align: center;">
        <a href="${confirmationUrl}" class="button">Confirm Account & Sign In</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">
        ${confirmationUrl}
    </p>
    
    <p><strong>What you can do with SiteRecap:</strong></p>
    <ul>
        <li>Upload construction site photos</li>
        <li>Generate AI-powered professional reports</li>
        <li>Send branded reports to owners and GCs</li>
        <li>Track project progress over time</li>
        <li>Export reports as PDF</li>
        <li>Capture digital signatures</li>
    </ul>
    
    <div class="footer">
        <p>Need help? Reply to this email or contact us at support@siterecap.com</p>
        <p><strong>SiteRecap Team</strong><br>
        Email: support@siterecap.com<br>
        Website: siterecap.com</p>
    </div>
</body>
</html>
    `

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'SiteRecap <support@siterecap.com>',
      to: [email],
      subject: 'Confirm Your SiteRecap Account - Get Started Today!',
      html: emailHtml
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      messageId: emailData.id,
      message: 'Confirmation email sent successfully'
    })

  } catch (error) {
    console.error('Resend confirmation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}