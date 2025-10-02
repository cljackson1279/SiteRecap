'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Camera, 
  FileText, 
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Calculator,
  Users,
  Building,
  Shield
} from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // Calculator state
  const [projects, setProjects] = useState(5)
  const [staff, setStaff] = useState(3)
  const [hoursPerPerson, setHoursPerPerson] = useState(2)
  const [hourlyRate, setHourlyRate] = useState(35)
  const [changeOrders, setChangeOrders] = useState(8)
  const [disputes, setDisputes] = useState(2)
  const [showResults, setShowResults] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const calculateROI = () => {
    // Current process costs
    const monthlyHours = projects * staff * hoursPerPerson * 4.33 // 4.33 weeks per month
    const monthlyCost = monthlyHours * hourlyRate
    const annualCost = monthlyCost * 12
    
    // Additional costs from inefficiencies
    const changeOrderCost = changeOrders * 150 * 12 // $150 per change order
    const disputeCost = disputes * 2500 * 12 // $2500 per dispute
    
    const totalAnnualCost = annualCost + changeOrderCost + disputeCost
    const potentialSavings = totalAnnualCost * 0.75 // 75% savings
    const siteRecapAnnualCost = projects * 149 * 12 // Assuming starter plan
    const netSavings = potentialSavings - siteRecapAnnualCost
    const roiMonths = Math.ceil(siteRecapAnnualCost / (netSavings / 12))
    
    return {
      currentCost: totalAnnualCost,
      timeWasted: monthlyHours * 12,
      potentialSavings,
      netSavings: Math.max(netSavings, 0),
      roiMonths: Math.min(roiMonths, 12)
    }
  }

  const handleCalculate = () => {
    setShowResults(true)
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleGetStarted = () => {
    router.push('/pricing')
  }

  const results = calculateROI()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard if authenticated
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-navy-900">SiteRecap</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#calculator" className="text-gray-600 hover:text-navy-900 transition-colors">
                Calculator
              </a>
              <a href="/demo" className="text-gray-600 hover:text-navy-900 transition-colors">
                Demo
              </a>
              <a href="/pricing" className="text-gray-600 hover:text-navy-900 transition-colors">
                Pricing
              </a>
            </nav>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button className="bg-navy-900 hover:bg-navy-800" onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-navy-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-navy-900 mb-6">
              Transform Construction
              <span className="block text-orange-500">Daily Reports</span>
              <span className="block">with AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Stop wasting hours on paperwork. Generate professional daily reports from job site photos in minutes. 
              Trusted by contractors nationwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleGetStarted}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/demo')}>
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                7-day free trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Setup in minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-gray-500">Trusted by construction professionals nationwide</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { name: "ABC Construction", rating: 5, review: "Cut report time by 80%" },
              { name: "BuildRight Pro", rating: 5, review: "Game changer for our team" },
              { name: "Premier Builders", rating: 5, review: "Clients love the reports" },
              { name: "Summit Contractors", rating: 5, review: "Professional results every time" }
            ].map((testimonial, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="font-medium text-navy-900 text-sm">{testimonial.name}</p>
                <p className="text-xs text-gray-600">"{testimonial.review}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Calculator Section */}
      <section id="calculator" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-navy-900 mb-4">
                How Much Are Manual Reports Costing You?
              </h2>
              <p className="text-xl text-gray-600">
                Calculate your potential savings with automated daily reports
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Calculator Form */}
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-orange-500" />
                    ROI Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projects">Active Projects</Label>
                      <Input
                        id="projects"
                        type="number"
                        value={projects}
                        onChange={(e) => setProjects(Number(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="staff">Staff Members</Label>
                      <Input
                        id="staff"
                        type="number"
                        value={staff}
                        onChange={(e) => setStaff(Number(e.target.value))}
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hours">Hours per Report</Label>
                      <Input
                        id="hours"
                        type="number"
                        step="0.5"
                        value={hoursPerPerson}
                        onChange={(e) => setHoursPerPerson(Number(e.target.value))}
                        min="0.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate">Hourly Rate ($)</Label>
                      <Input
                        id="rate"
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        min="15"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="changes">Change Orders/Month</Label>
                      <Input
                        id="changes"
                        type="number"
                        value={changeOrders}
                        onChange={(e) => setChangeOrders(Number(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="disputes">Disputes/Year</Label>
                      <Input
                        id="disputes"
                        type="number"
                        value={disputes}
                        onChange={(e) => setDisputes(Number(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleCalculate}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    size="lg"
                  >
                    Calculate My Savings
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              <div id="results" className={`space-y-4 ${!showResults ? 'opacity-50' : ''}`}>
                <Card className="p-6 bg-red-50 border-red-200">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-8 w-8 text-red-500" />
                    <div>
                      <h3 className="text-2xl font-bold text-red-700">
                        ${results.currentCost.toLocaleString()}
                      </h3>
                      <p className="text-red-600">Annual cost of current process</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-orange-50 border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-8 w-8 text-orange-500" />
                    <div>
                      <h3 className="text-2xl font-bold text-orange-700">
                        {results.timeWasted.toLocaleString()} hours
                      </h3>
                      <p className="text-orange-600">Time wasted annually on reports</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-green-50 border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="text-2xl font-bold text-green-700">
                        ${results.netSavings.toLocaleString()}
                      </h3>
                      <p className="text-green-600">Net annual savings with SiteRecap</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-navy-50 border-navy-200">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-8 w-8 text-navy-900" />
                    <div>
                      <h3 className="text-2xl font-bold text-navy-900">
                        {results.roiMonths} months
                      </h3>
                      <p className="text-navy-700">ROI timeline</p>
                    </div>
                  </div>
                  
                  {showResults && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Get detailed ROI report:</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleGetStarted}
                        className="w-full bg-navy-900 hover:bg-navy-800"
                        size="lg"
                      >
                        Start Free Trial - Save ${Math.round(results.netSavings/12).toLocaleString()}/month
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              Everything You Need for Professional Daily Reports
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your documentation process with AI-powered automation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                <Camera className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-navy-900">AI Photo Analysis</h3>
              <p className="text-gray-600">
                Advanced AI identifies materials, equipment, personnel, and progress from construction photos automatically.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto mb-4 w-16 h-16 bg-navy-100 rounded-lg flex items-center justify-center">
                <FileText className="h-8 w-8 text-navy-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-navy-900">Professional Reports</h3>
              <p className="text-gray-600">
                Generate separate Owner and GC reports with weather data, safety notes, and progress tracking.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-navy-900">Instant Delivery</h3>
              <p className="text-gray-600">
                Export PDFs and automatically email reports to owners and contractors with your branding.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Daily Reports?
          </h2>
          <p className="text-xl text-navy-200 mb-8 max-w-2xl mx-auto">
            Join hundreds of contractors saving hours every week with automated daily reports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600" 
              onClick={handleGetStarted}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-navy-900 bg-white hover:bg-gray-100"
              onClick={() => router.push('/demo')}
            >
              Try Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SiteRecap</span>
              </div>
              <p className="text-sm">
                AI-powered daily reports for construction professionals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/demo" className="hover:text-white">Demo</a></li>
                <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/terms" className="hover:text-white">Terms</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
                <li><a href="mailto:support@siterecap.com" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@siterecap.com" className="hover:text-white">support@siterecap.com</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 SiteRecap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}