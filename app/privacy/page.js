'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function Privacy() {
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
            <p className="text-muted-foreground">Privacy Policy</p>
          </div>
        </div>

        {/* Privacy Content */}
        <Card className="shadow-sm">
          <CardContent className="p-8 prose prose-gray max-w-none">
            <p className="text-sm text-muted-foreground mb-6">
              <strong>Effective Date:</strong> September 25, 2025
            </p>

            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">1. Information We Collect</h2>
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    <strong>Account Information:</strong> Email address, name, and company details you provide when creating an account.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Project Data:</strong> Photos, project names, locations, team member information, and generated reports.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Usage Data:</strong> How you interact with SiteRecap, including feature usage and system performance data.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">2. How We Use Your Information</h2>
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    <strong>Service Delivery:</strong> To generate AI-powered daily reports from your construction photos.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Account Management:</strong> To maintain your account, process payments, and provide customer support.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Communication:</strong> To send service updates, billing information, and support responses.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Improvement:</strong> To enhance our AI models and service features (using aggregated, non-identifying data only).
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">3. Information Sharing</h2>
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    <strong>We do not sell your personal information.</strong> We may share data in these limited circumstances:
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Service Providers:</strong> With trusted third parties who help operate our service (Supabase for data storage, Stripe for payments, etc.).
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Business Transfers:</strong> In connection with a merger, sale, or transfer of business assets.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">4. Data Security</h2>
                <p className="text-muted-foreground">
                  We use industry-standard security measures including encryption, secure data centers, and access controls. 
                  However, no online service is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">5. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your account information and project data as long as your account is active. 
                  After account deletion, data may be retained for up to 30 days for recovery purposes, then permanently deleted.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">6. Your Rights</h2>
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    <strong>Access:</strong> You can view and export your data through your account dashboard.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Correction:</strong> You can update your account information and project data at any time.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Deletion:</strong> You can delete your account and request data deletion by contacting support.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Portability:</strong> You can export your data in common formats (PDF, JSON).
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">7. Cookies and Tracking</h2>
                <p className="text-muted-foreground">
                  We use essential cookies for authentication and session management. We do not use tracking cookies 
                  for advertising or analytics beyond basic usage statistics.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">8. International Data Transfers</h2>
                <p className="text-muted-foreground">
                  Your data may be processed in the United States or other countries where our service providers operate. 
                  We ensure appropriate safeguards are in place for international transfers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">9. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  SiteRecap is not intended for use by individuals under 18. We do not knowingly collect personal 
                  information from children under 18.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">10. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this privacy policy periodically. We will notify you of significant changes via 
                  email or through the service. Continued use constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-3">11. Contact Us</h2>
                <p className="text-muted-foreground">
                  For questions about this privacy policy or your data, contact us at{' '}
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