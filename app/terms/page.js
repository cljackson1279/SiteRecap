'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
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
            <p className="text-muted-foreground">Terms & Conditions</p>
          </div>
        </div>

        {/* Terms Content */}
        <Card className="shadow-sm">
          <CardContent className="p-8 prose prose-gray max-w-none">
            <p className="text-sm text-muted-foreground mb-6">
              <strong>Effective Date:</strong> September 25, 2025
            </p>

            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using SiteRecap ("the Service"), you agree to be bound by these Terms & Conditions. 
                  If you do not agree, please do not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">2. Description of Service</h2>
                <p className="text-muted-foreground">
                  SiteRecap is an AI-powered daily reporting tool for contractors. Users upload photos, and the system 
                  generates structured daily reports for construction projects.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">3. User Accounts</h2>
                <p className="text-muted-foreground">
                  You are responsible for maintaining account security and all activities under your account. 
                  Notify us immediately of any unauthorized use.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">4. Payment Terms</h2>
                <p className="text-muted-foreground">
                  Subscription fees are billed monthly or annually through Stripe. You may cancel at any time, 
                  but no refunds will be provided for partial billing periods.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">5. Content Ownership</h2>
                <p className="text-muted-foreground">
                  You retain ownership of photos and content you upload. SiteRecap uses this content solely to 
                  provide the reporting service. We do not claim ownership of your project data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">6. AI-Generated Content</h2>
                <p className="text-muted-foreground">
                  Reports are generated using AI analysis of photos. While we strive for accuracy, users should 
                  review and verify all AI-generated content before use in official documentation.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">7. Service Availability</h2>
                <p className="text-muted-foreground">
                  We aim for 99% uptime but cannot guarantee uninterrupted service. Scheduled maintenance will be 
                  communicated in advance when possible.  
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">8. Prohibited Uses</h2>
                <p className="text-muted-foreground">
                  You may not use SiteRecap for illegal purposes, to upload inappropriate content, or in ways that 
                  violate these terms or applicable laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">9. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  SiteRecap's liability is limited to the amount paid for the service. We are not liable for 
                  indirect, incidental, or consequential damages.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">10. Termination</h2>
                <p className="text-muted-foreground">
                  Either party may terminate the service agreement. Upon termination, you retain access until 
                  the end of your billing period. Data may be deleted after account closure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">11. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We may update these terms periodically. Continued use constitutes acceptance of new terms. 
                  Significant changes will be communicated via email.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">12. Contact Information</h2>
                <p className="text-muted-foreground">
                  For questions about these terms, contact us at{' '}
                  <a href="mailto:support@siterecap.com" className="text-primary hover:underline">
                    support@siterecap.com
                  </a>
                </p>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>Last updated: September 25, 2025</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}