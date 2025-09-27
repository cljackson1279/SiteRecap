'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, MapPin, Calendar, FileText, Settings, User } from 'lucide-react'

export default function DemoMode() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  useEffect(() => {
    // Load demo projects
    setProjects([
      {
        id: '1',
        name: 'Kitchen Remodel - Smith Residence',
        city: 'Austin',
        state: 'TX',
        postal_code: '78701',
        created_at: new Date().toISOString(),
        owner_name: 'John Smith',
        owner_email: 'john.smith@example.com',
        gc_name: 'Mike Johnson',
        gc_email: 'mike@contractorco.com'
      },
      {
        id: '2', 
        name: 'Bathroom Renovation - Johnson Home',
        city: 'Dallas',
        state: 'TX',
        postal_code: '75201',
        created_at: new Date().toISOString(),
        owner_name: 'Sarah Johnson',
        owner_email: 'sarah.johnson@example.com',
        gc_name: 'Carlos Martinez',
        gc_email: 'carlos@renovationpro.com'
      }
    ])
  }, [])

  const createProject = async () => {
    if (!newProjectName.trim()) return
    
    // Demo mode - allow unlimited projects for testing
    const newProject = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      active: true,
      created_at: new Date().toISOString()
    }
    
    setProjects([newProject, ...projects])
    setNewProjectName('')
    setShowNewProject(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg to-slate-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl">🏗️</div>
              <div>
                <h1 className="text-2xl font-bold text-brand-text">SiteRecap</h1>
                <p className="text-sm text-muted-foreground">
                  Demo Company • Starter Plan
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Demo Mode
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/pricing')}>
                Upgrade
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Demo User</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/')}>
                  Exit Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Demo Notice */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-semibold text-yellow-800">Demo Mode Active</h3>
                <p className="text-sm text-yellow-700">
                  You're exploring SiteRecap with full access to all features. Projects and data won't be saved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Content */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Your Projects</h2>
            <p className="text-muted-foreground mt-1">
              Transform job site photos into professional reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowNewProject(true)}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Quick Create
            </Button>
            <Button 
              onClick={() => router.push('/project-setup')}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* New Project Form */}
        {showNewProject && (
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Project name (e.g., Kitchen Remodel - Smith Residence)"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createProject()}
                  className="flex-1"
                />
                <Button onClick={createProject} disabled={!newProjectName.trim()}>
                  Create
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowNewProject(false)
                  setNewProjectName('')
                }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg line-clamp-2">{project.name}</h3>
                  <Badge variant="secondary" className="ml-2">Active</Badge>
                </div>
                
                {(project.city || project.state || project.postal_code) && (
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {[project.city, project.state, project.postal_code].filter(Boolean).join(', ')}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  Open Project
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Plan Usage Info */}
        <Card className="mt-8 bg-white/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Demo Plan Usage</h3>
                <p className="text-sm text-muted-foreground">
                  {projects.length} projects • Unlimited in demo mode
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <Badge variant="outline">Demo Plan</Badge>
                </div>
                <Button variant="outline" onClick={() => router.push('/pricing')}>
                  View Real Pricing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}