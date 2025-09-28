'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, ArrowLeft } from 'lucide-react'

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small contractors',
      monthlyPrice: 149,
      annualPrice: 1490,
      projects: 2,
      features: [
        'Up to 2 active projects',
        'Unlimited team members',
        'AI-powered daily reports',
        'Photo analysis & categorization',
        'Owner & GC report formats',
        'Equipment & materials tracking',
        'Safety compliance monitoring',
        'Personnel management',
        'E-signatures',
        'Report editing & history',
        'Email delivery',
        'PDF export',
        'Mobile-friendly interface',
        'Email support'
      ],
      stripeLinkMonthly: 'https://buy.stripe.com/4gMcN54WHeV2e2HfoHeZ205',
      popular: false
    },
    {
      name: 'Pro',
      description: 'Most popular for growing businesses',
      monthlyPrice: 399,
      annualPrice: 3990,
      projects: 10,
      features: [
        'Up to 10 active projects',
        'Unlimited team members',
        'AI-powered daily reports',
        'Photo analysis & categorization',
        'Owner & GC report formats',
        'Equipment & materials tracking',
        'Safety compliance monitoring',
        'Personnel management',
        'E-signatures',
        'Report editing & history',
        'Email delivery',
        'PDF export',
        'Mobile-friendly interface',
        'Priority support'
      ],
      stripeLinkMonthly: 'https://buy.stripe.com/3cI6oH60LdQYgaP7WfeZ206',
      popular: true
    },
    {
      name: 'Business',
      description: 'For large contractors & enterprises',
      monthlyPrice: 699,
      annualPrice: 6990,
      projects: 25,
      features: [
        'Up to 25 active projects',
        'Unlimited team members',
        'AI-powered daily reports',
        'Photo analysis & categorization',
        'Owner & GC report formats',
        'Equipment & materials tracking',
        'Safety compliance monitoring',
        'Personnel management',
        'E-signatures',
        'Report editing & history',
        'Email delivery',
        'PDF export',
        'Mobile-friendly interface',
        'Custom branding',
        'Advanced analytics',
        'API access',
        'Dedicated account manager'
      ],
      stripeLinkMonthly: 'https://buy.stripe.com/eVqdR988T8wEaQvb8reZ207',
      popular: false
    }
  ]

  const handlePlanSelect = async (plan) => {
    try {
      // Create trial subscription via our API
      const response = await fetch('/api/create-trial-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.name.toLowerCase(),
          userEmail: 'user@example.com', // In production, get from auth context
          successUrl: `${window.location.origin}/dashboard?trial=started&plan=${plan.name}`,
          cancelUrl: `${window.location.origin}/pricing?cancelled=true`
        })
      })

      const data = await response.json()
      
      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe checkout with trial
        window.location.href = data.checkoutUrl
      } else {
        throw new Error(data.error || 'Failed to create trial subscription')
      }
    } catch (error) {
      console.error('Trial subscription error:', error)
      
      // Fallback to original Stripe links
      const stripeLink = plan.stripeLinkMonthly
      if (stripeLink && stripeLink !== '#') {
        window.open(stripeLink, '_blank')
      } else {
        alert('Unable to start trial. Please try again or contact support.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg to-slate-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-brand-text">🏗️ SiteRecap</h1>
            <p className="text-muted-foreground">Choose the perfect plan for your business</p>
          </div>
        </div>

        {/* Pricing Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-brand-text mb-4">Simple Monthly Pricing</h2>
          <p className="text-lg text-muted-foreground mb-4">
            Choose the plan that fits your business size
          </p>
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="text-green-600">✨</span>
            7-day free trial included with all plans - no charges until day 8!
          </div>
          <p className="text-sm text-muted-foreground">
            No setup fees • Cancel anytime
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={`relative ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105 ring-1 ring-primary/20' 
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
                
                <div className="mt-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      ${plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">
                      /month
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold text-primary">{plan.projects}</span>
                    {' '}active projects
                  </p>
                </div>
                
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700 font-medium">
                    🎉 7-day free trial • No charge until day 8
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  Start 7-Day Free Trial
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  No payment required for 7 days • Cancel anytime
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">What counts as an "active project"?</h3>
              <p className="text-sm text-muted-foreground">
                An active project is any construction project where you're currently generating daily reports. 
                Completed projects don't count toward your limit.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can change plans anytime. Upgrades take effect immediately, 
                downgrades at your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How does billing work?</h3>
              <p className="text-sm text-muted-foreground">
                We offer three subscription tiers billed monthly through Stripe. 
                Upgrade or downgrade at any time.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What AI models do you use?</h3>
              <p className="text-sm text-muted-foreground">
                We use advanced AI models for photo analysis and report generation, 
                ensuring reliable and professional results every time.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center bg-white rounded-lg p-8 border">
          <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
          <p className="text-muted-foreground mb-6">
            Large organizations with 25+ projects can get custom pricing and dedicated support.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">
              Schedule Demo
            </Button>
            <Button>
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}