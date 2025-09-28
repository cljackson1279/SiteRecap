import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, confirmationUrl } = await request.json()
    
    if (!email || !confirmationUrl) {
      return NextResponse.json({ error: 'Email and confirmation URL required' }, { status: 400 })
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to SiteRecap</title>
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
            color: white;
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
    
    <h2>Welcome to SiteRecap!</h2>
    
    <p>Thank you for signing up! You're just one step away from creating professional construction reports with AI-powered photo analysis.</p>
    
    <p>Click the button below to confirm your email address and activate your account:</p>
    
    <div style="text-align: center;">
        <a href="${confirmationUrl}" class="button">Confirm Your Account</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">
        ${confirmationUrl}
    </p>
    
    <p><strong>What's next?</strong></p>
    <ul>
        <li>Upload construction site photos</li>
        <li>Generate professional AI reports</li>
        <li>Send reports to owners and GCs</li>
        <li>Track project progress</li>
    </ul>
    
    <div class="footer">
        <p>If you didn't create an account with SiteRecap, you can safely ignore this email.</p>
        <p><strong>SiteRecap Team</strong><br>
        Email: support@siterecap.com</p>
    </div>
</body>
</html>
    `

    const { data, error } = await resend.emails.send({
      from: 'SiteRecap <support@siterecap.com>',
      to: [email],
      subject: 'Welcome to SiteRecap - Confirm Your Account',
      html: emailHtml
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: data.id })

  } catch (error) {
    console.error('Send confirmation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}