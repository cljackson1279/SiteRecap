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
      stripeLinkMonthly: 'https://buy.stripe.com/test_starter_monthly',
      stripeLinkAnnual: 'https://buy.stripe.com/test_starter_annual',
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
      stripeLinkMonthly: 'https://buy.stripe.com/test_pro_monthly',
      stripeLinkAnnual: 'https://buy.stripe.com/test_pro_annual',
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
      stripeLinkMonthly: 'https://buy.stripe.com/test_business_monthly',
      stripeLinkAnnual: 'https://buy.stripe.com/test_business_annual',
      popular: false
    }
  ]

  const handlePlanSelect = (plan) => {
    const stripeLink = isAnnual ? plan.stripeLinkAnnual : plan.stripeLinkMonthly
    
    if (stripeLink && stripeLink !== '#') {
      window.open(stripeLink, '_blank')
    } else {
      // Fallback - redirect to contact/demo
      alert(`${plan.name} plan selected! Redirecting to checkout...`)
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

        {/* Billing Toggle */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 p-1 bg-white rounded-lg border">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                !isAnnual 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-md font-medium transition-colors relative ${
                isAnnual 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <Badge className="absolute -top-2 -right-2 text-xs bg-green-500">
                Save 17%
              </Badge>
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            All plans include 14-day free trial • No setup fees • Cancel anytime
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
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                  {isAnnual && (
                    <p className="text-sm text-green-600 mt-1">
                      Save ${(plan.monthlyPrice * 12) - plan.annualPrice}/year
                    </p>
                  )}
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold text-primary">{plan.projects}</span>
                    {' '}active projects
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
                  Start Free Trial
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  14-day free trial • No credit card required
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
              <h3 className="font-semibold mb-2">How does the free trial work?</h3>
              <p className="text-sm text-muted-foreground">
                Get full access to all features for 14 days. No credit card required to start. 
                Cancel anytime during the trial period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What AI models do you use?</h3>
              <p className="text-sm text-muted-foreground">
                We use Google's latest Gemini 2.0 Flash for photo analysis with OpenAI GPT-4o-mini as fallback, 
                ensuring reliable report generation.
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