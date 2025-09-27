'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        // Show landing page for non-authenticated users
      }
    }
  }, [user, loading, router])

  const handleGetStarted = () => {
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-bg to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-bg to-slate-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-6">🏗️</div>
            <h1 className="text-5xl font-bold text-brand-text mb-6">
              SiteRecap
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform job site photos into professional daily reports using AI. 
              Better than Raken and Fieldwire - built specifically for residential contractors.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted}>
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/pricing')}>
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              14-day free trial • No credit card required
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📸</div>
                <h3 className="text-xl font-semibold mb-2">Smart Photo Analysis</h3>
                <p className="text-muted-foreground">
                  AI automatically detects equipment, materials, personnel, and progress from your job site photos.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">Professional Reports</h3>
                <p className="text-muted-foreground">
                  Generate separate Owner and GC reports with weather, progress tracking, and safety compliance.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">✍️</div>
                <h3 className="text-xl font-semibold mb-2">E-Signatures & Email</h3>
                <p className="text-muted-foreground">
                  Get reports signed digitally and automatically email to owners and contractors.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to upgrade your daily reports?</h2>
              <p className="text-muted-foreground mb-6">
                Join contractors already using SiteRecap to save hours on documentation.
              </p>
              <Button size="lg" onClick={handleGetStarted}>
                Get Started - Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null // Will redirect to dashboard if authenticated
}