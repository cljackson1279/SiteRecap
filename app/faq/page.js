'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function FAQ() {
  const faqs = [
    {
      question: "What is SiteRecap?",
      answer: "SiteRecap is an AI-powered daily reporting tool for contractors and project managers. Upload photos, and the system automatically generates clear, professional daily reports for owners and GCs."
    },
    {
      question: "Who is SiteRecap for?",
      answer: "It's designed for small to mid-sized contractors, remodelers, and builders who want to save time on daily reports while keeping projects transparent."
    },
    {
      question: "How accurate are the reports?",
      answer: "SiteRecap uses AI to analyze site photos and create structured reports. Users can always review and edit reports before exporting or sending."
    },
    {
      question: "Can multiple team members use the same account?",
      answer: "Yes. Pricing tiers are based on active projects, not per-user. You can invite your team to collaborate."
    },
    {
      question: "How are reports shared?",
      answer: "Reports can be exported to PDF, emailed to project owners and GCs, and archived under each project by date."
    },
    {
      question: "Can I use my company branding?",
      answer: "Yes, reports can include your company name and logo for a professional, branded appearance."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use Supabase for secure data storage and authentication. Only your team has access to your projects and reports."
    },
    {
      question: "How does billing work?",
      answer: "We offer three subscription tiers billed monthly through Stripe. Upgrade or downgrade at any time."
    }
  ]

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
            <p className="text-muted-foreground">Frequently Asked Questions</p>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-brand-text mb-3">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 bg-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? We're here to help.
            </p>
            <Button>
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}