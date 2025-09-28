import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { planId, userEmail, userId, successUrl, cancelUrl } = await request.json()
    
    if (!planId || !userEmail) {
      return NextResponse.json({ error: 'Plan ID and user email required' }, { status: 400 })
    }

    // Map plan IDs to Stripe price IDs (you'll need these from your Stripe dashboard)
    const planPriceMapping = {
      'starter': 'price_starter_monthly_with_trial', // Replace with actual Stripe price ID
      'pro': 'price_pro_monthly_with_trial',         // Replace with actual Stripe price ID  
      'business': 'price_business_monthly_with_trial' // Replace with actual Stripe price ID
    }

    const priceId = planPriceMapping[planId]
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    // Create or retrieve customer
    let customer
    let isNewCustomer = false
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
      // Check if customer has had previous subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 1
      })
      
      isNewCustomer = subscriptions.data.length === 0
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId || '',
          plan: planId
        }
      })
      isNewCustomer = true
    }

    // Create checkout session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          plan: planId,
          supabase_user_id: userId || ''
        }
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?trial=started`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?cancelled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        plan: planId,
        user_email: userEmail,
        supabase_user_id: userId || ''
      }
    })

    // Update user's trial status in database (optional)
    if (userId) {
      try {
        const { error: updateError } = await supabaseAdmin
          .from('organizations')
          .upsert({
            id: userId,
            plan: planId,
            trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            stripe_customer_id: customer.id,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
        
        if (updateError) {
          console.error('Database update error:', updateError)
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
        // Don't fail the request if database update fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      sessionId: session.id,
      checkoutUrl: session.url,
      customerId: customer.id,
      trialDays: 7
    })

  } catch (error) {
    console.error('Trial subscription creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create trial subscription',
      details: error.message 
    }, { status: 500 })
  }
}