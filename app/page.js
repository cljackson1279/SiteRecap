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
    if (!loading && user) {
      router.push('/dashboard')
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
        {/* Navigation Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="text-2xl">🏗️</div>
              <span className="text-2xl font-bold text-brand-text">SiteRecap</span>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="/demo" className="text-muted-foreground hover:text-brand-text transition-colors">
                How it Works
              </a>
              <a href="/pricing" className="text-muted-foreground hover:text-brand-text transition-colors">
                Pricing
              </a>
            </nav>
            
            {/* Mobile menu button - you can add this later */}
            <div className="md:hidden">
              <Button size="sm" onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
              AI-Powered Construction Daily Reports
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform construction site photos into professional daily reports with AI. 
              Generate automated construction reports for owners and contractors in minutes, not hours.
            </p>
            <div className="flex justify-center">
              <Button size="lg" onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📸</div>
                <h3 className="text-xl font-semibold mb-2">AI Construction Photo Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced AI automatically detects equipment, materials, personnel, and construction progress from your daily job site photos.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">Automated Daily Reports</h3>
                <p className="text-muted-foreground">
                  Generate separate Owner and GC construction daily reports with weather data, progress tracking, and safety compliance automatically.
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

        {/* Benefits Section with Keywords */}
        <div className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose SiteRecap for Construction Daily Reports?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered construction daily reporting software is designed specifically for contractors, 
              builders, and construction project managers who need professional documentation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">⚡ Save Time on Documentation</h3>
              <p className="text-muted-foreground">
                Stop spending hours writing daily construction reports. Our AI analyzes your photos and generates 
                professional reports in minutes, not hours.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">📋 Professional Construction Reports</h3>
              <p className="text-muted-foreground">
                Generate separate reports for owners and general contractors with weather data, 
                safety compliance, and progress tracking automatically included.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">🔐 Secure Project Management</h3>
              <p className="text-muted-foreground">
                Keep your construction project data secure with enterprise-grade security. 
                All reports and photos are stored safely and accessible only to your team.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">📱 Mobile-Friendly Interface</h3>
              <p className="text-muted-foreground">
                Upload photos and generate reports directly from your smartphone on the job site. 
                Works perfectly on mobile devices for busy contractors.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to upgrade your construction daily reports?</h2>
              <p className="text-muted-foreground mb-6">
                Join contractors already using SiteRecap to save hours on daily report documentation.
                <br />
                <a href="/demo" className="text-primary hover:underline">Try our free demo</a> or 
                <a href="/pricing" className="text-primary hover:underline ml-1">view pricing plans</a>.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={handleGetStarted}>
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push('/demo')}>
                  Try Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null // Will redirect to dashboard if authenticated
}