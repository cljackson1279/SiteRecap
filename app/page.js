'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, MapPin, Calendar, FileText } from 'lucide-react'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      // For now, simulate some demo projects since we need auth setup
      setTimeout(() => {
        setProjects([
          {
            id: '1',
            name: 'Kitchen Remodel - Smith Residence',
            city: 'Austin',
            state: 'TX',
            postal_code: '78701',
            created_at: new Date().toISOString()
          },
          {
            id: '2', 
            name: 'Bathroom Renovation - Johnson Home',
            city: 'Dallas',
            state: 'TX',
            postal_code: '75201',
            created_at: new Date().toISOString()
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error loading projects:', error)
      setLoading(false)
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return
    
    try {
      // Simulate creating project
      const newProject = {
        id: Date.now().toString(),
        name: newProjectName.trim(),
        active: true,
        created_at: new Date().toISOString()
      }
      
      setProjects([newProject, ...projects])
      setNewProjectName('')
      setShowNewProject(false)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">SiteRecap</h1>
          <p className="text-muted-foreground mt-1">Transform job site photos into professional reports</p>
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
            onClick={() => window.location.href = '/project-setup'}
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
      {projects.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first project to start generating daily reports from job site photos.
            </p>
            <Button onClick={() => setShowNewProject(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                  onClick={() => window.location.href = `/project/${project.id}`}
                >
                  Open Project
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}