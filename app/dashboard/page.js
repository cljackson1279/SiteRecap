'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, MapPin, Calendar, FileText, Settings, LogOut, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function Dashboard() {
  const { user, organization, loading, signOut } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [showConfirmationSuccess, setShowConfirmationSuccess] = useState(false)

  // Check for confirmation success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('confirmed') === 'true') {
      setShowConfirmationSuccess(true)
      // Clear the URL parameter
      window.history.replaceState({}, document.title, '/dashboard')
      // Auto-hide after 5 seconds
      setTimeout(() => setShowConfirmationSuccess(false), 5000)
    }
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && organization) {
      loadProjects()
    }
  }, [user, organization])

  const loadProjects = async () => {
    try {
      // Simulate loading projects - in production this would filter by organization
      setTimeout(() => {
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
            gc_email: 'mike@contractorco.com',
            status: 'active'
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
            gc_email: 'carlos@renovationpro.com',
            status: 'completed'
          },
          {
            id: '3',
            name: 'Deck Construction - Miller House',
            city: 'Houston',
            state: 'TX', 
            postal_code: '77001',
            created_at: new Date().toISOString(),
            owner_name: 'Robert Miller',
            owner_email: 'robert.miller@example.com',
            gc_name: 'Jennifer Davis',
            gc_email: 'jennifer@construction.com',
            status: 'active'
          }
        ])
        setLoadingProjects(false)
      }, 1000)
    } catch (error) {
      console.error('Error loading projects:', error)
      setLoadingProjects(false)
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return
    
    // Check project limits - only count active projects
    const currentPlan = organization?.plan || 'starter'
    const maxProjects = currentPlan === 'starter' ? 2 : currentPlan === 'pro' ? 10 : 25
    const activeProjects = projects.filter(p => p.status === 'active')
    
    if (activeProjects.length >= maxProjects) {
      alert(`You've reached your plan limit of ${maxProjects} active projects. Please close some projects or upgrade your plan to add more.`)
      router.push('/pricing')
      return
    }
    
    try {
      // Simulate creating project
      const newProject = {
        id: Date.now().toString(),
        name: newProjectName.trim(),
        active: true,
        created_at: new Date().toISOString(),
        org_id: organization?.id
      }
      
      setProjects([newProject, ...projects])
      setNewProjectName('')
      setShowNewProject(false)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Show loading while checking auth
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

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null
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
                  {organization?.name || 'My Company'} • {organization?.plan || 'Starter'} Plan
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
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
                  <p className="font-medium">{user.user_metadata?.full_name || user.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
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
        {loadingProjects ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first project to start generating daily reports from job site photos.
              </p>
              <Button onClick={() => router.push('/project-setup')}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Projects */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
              {projects.filter(p => p.status === 'active').length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No active projects. Create a new project to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter(project => project.status === 'active')
                    .map((project) => (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="font-semibold text-lg line-clamp-2">{project.name}</h3>
                            <Badge variant="default" className="ml-2">Active</Badge>
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
              )}
            </div>

            {/* Closed Projects */}
            {projects.filter(p => p.status !== 'active').length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Closed Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter(project => project.status !== 'active')
                    .map((project) => (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer opacity-75">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="font-semibold text-lg line-clamp-2">{project.name}</h3>
                            <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-600">Closed</Badge>
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
                            variant="outline"
                            className="w-full" 
                            onClick={() => router.push(`/project/${project.id}`)}
                          >
                            View Project
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plan Usage Info */}
        <Card className="mt-8 bg-white/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Plan Usage</h3>
                <p className="text-sm text-muted-foreground">
                  {projects.filter(p => p.status === 'active').length} of {organization?.plan === 'starter' ? 2 : organization?.plan === 'pro' ? 10 : 25} active projects used
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <Badge variant="outline">{organization?.plan || 'Starter'} Plan</Badge>
                </div>
                <Button variant="outline" onClick={() => router.push('/pricing')}>
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}