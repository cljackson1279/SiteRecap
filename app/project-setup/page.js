'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Plus,
  X,
  Save
} from 'lucide-react'
import PersonnelManager from '@/components/personnel-manager'

export default function ProjectSetup() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [projectData, setProjectData] = useState({
    name: '',
    city: '',
    state: '',
    postal_code: ''
  })
  const [teamMembers, setTeamMembers] = useState([])

  const handleProjectInfoSubmit = (e) => {
    e.preventDefault()
    if (!projectData.name.trim()) {
      alert('Please enter a project name')
      return
    }
    setStep(2)
  }

  const handleTeamUpdate = (members) => {
    setTeamMembers(members)
  }

  const createProject = async () => {
    try {
      // Simulate project creation
      const newProject = {
        id: Date.now().toString(),
        ...projectData,
        team_members: teamMembers,
        created_at: new Date().toISOString()
      }

      // In a real app, this would save to the database
      console.log('Creating project:', newProject)
      
      // Redirect to the new project
      router.push(`/project/${newProject.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => step === 1 ? router.push('/') : setStep(1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">Set up project details and team members</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${step > 1 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            2
          </div>
        </div>
        <div className="ml-4 text-sm text-muted-foreground">
          Step {step} of 2
        </div>
      </div>

      {/* Step 1: Project Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProjectInfoSubmit} className="space-y-6">
              <div>
                <Label htmlFor="project-name">Project Name *</Label>
                <Input
                  id="project-name"
                  value={projectData.name}
                  onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                  placeholder="e.g., Kitchen Remodel - Smith Residence"
                  className="mt-1"
                  required
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={projectData.city}
                    onChange={(e) => setProjectData({...projectData, city: e.target.value})}
                    placeholder="Austin"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={projectData.state}
                    onChange={(e) => setProjectData({...projectData, state: e.target.value})}
                    placeholder="TX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="postal-code">ZIP Code</Label>
                  <Input
                    id="postal-code"
                    value={projectData.postal_code}
                    onChange={(e) => setProjectData({...projectData, postal_code: e.target.value})}
                    placeholder="78701"
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              {/* Owner/GC Contact Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Owner Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="owner-name">Owner Name</Label>
                      <Input
                        id="owner-name"
                        value={projectData.owner_name || ''}
                        onChange={(e) => setProjectData({...projectData, owner_name: e.target.value})}
                        placeholder="John Smith"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="owner-email">Owner Email</Label>
                      <Input
                        id="owner-email"
                        type="email"
                        value={projectData.owner_email || ''}
                        onChange={(e) => setProjectData({...projectData, owner_email: e.target.value})}
                        placeholder="john@example.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">General Contractor Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gc-name">GC/PM Name</Label>
                      <Input
                        id="gc-name"
                        value={projectData.gc_name || ''}
                        onChange={(e) => setProjectData({...projectData, gc_name: e.target.value})}
                        placeholder="Mike Johnson"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gc-email">GC/PM Email</Label>
                      <Input
                        id="gc-email"
                        type="email"
                        value={projectData.gc_email || ''}
                        onChange={(e) => setProjectData({...projectData, gc_email: e.target.value})}
                        placeholder="mike@contractorco.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Next: Add Team Members
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Team Members */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Project Team Setup
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Add team members who will be working on this project. You can modify this list anytime during the project.
              </p>
            </CardHeader>
            <CardContent>
              <PersonnelManagerSetup onTeamUpdate={handleTeamUpdate} />
            </CardContent>
          </Card>

          {/* Project Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Project Details</Label>
                  <div className="mt-2 space-y-1">
                    <p><strong>Name:</strong> {projectData.name}</p>
                    {(projectData.city || projectData.state || projectData.postal_code) && (
                      <p><strong>Location:</strong> {[projectData.city, projectData.state, projectData.postal_code].filter(Boolean).join(', ')}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Team Members</Label>
                  <div className="mt-2">
                    {teamMembers.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No team members added yet</p>
                    ) : (
                      <div className="space-y-1">
                        {teamMembers.slice(0, 3).map((member, index) => (
                          <p key={index} className="text-sm">{member.name} - {member.title}</p>
                        ))}
                        {teamMembers.length > 3 && (
                          <p className="text-sm text-muted-foreground">+{teamMembers.length - 3} more</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={createProject} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Personnel Manager component specifically for setup mode
function PersonnelManagerSetup({ onTeamUpdate }) {
  const [teamMembers, setTeamMembers] = useState([])
  const [newMember, setNewMember] = useState({ name: '', title: '', trade: 'General' })
  const [showAddForm, setShowAddForm] = useState(false)

  const tradeOptions = [
    'General', 'Carpentry', 'Electrical', 'Plumbing', 'HVAC', 
    'Flooring', 'Painting', 'Drywall', 'Roofing', 'Masonry'
  ]

  const addTeamMember = () => {
    if (!newMember.name.trim() || !newMember.title.trim()) {
      alert('Please enter name and title')
      return
    }

    const member = {
      id: Date.now().toString(),
      name: newMember.name.trim(),
      title: newMember.title.trim(),
      trade: newMember.trade
    }

    const updatedTeam = [...teamMembers, member]
    setTeamMembers(updatedTeam)
    onTeamUpdate(updatedTeam)
    
    setNewMember({ name: '', title: '', trade: 'General' })
    setShowAddForm(false)
  }

  const removeMember = (memberId) => {
    const updatedTeam = teamMembers.filter(m => m.id !== memberId)
    setTeamMembers(updatedTeam)
    onTeamUpdate(updatedTeam)
  }

  return (
    <div className="space-y-4">
      {/* Add Team Member Form */}
      {showAddForm ? (
        <div className="border rounded-lg p-4 bg-muted/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <Label htmlFor="member-name">Name *</Label>
              <Input
                id="member-name"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="member-title">Title *</Label>
              <Input
                id="member-title"
                value={newMember.title}
                onChange={(e) => setNewMember({...newMember, title: e.target.value})}
                placeholder="Job title"
              />
            </div>
            <div>
              <Label htmlFor="member-trade">Trade</Label>
              <select
                id="member-trade"
                value={newMember.trade}
                onChange={(e) => setNewMember({...newMember, trade: e.target.value})}
                className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm"
              >
                {tradeOptions.map(trade => (
                  <option key={trade} value={trade}>{trade}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={addTeamMember}>Add Member</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      )}

      {/* Team Members List */}
      {teamMembers.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Team Members ({teamMembers.length})</Label>
          {teamMembers.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.title} • {member.trade}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeMember(member.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {teamMembers.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No team members added yet</p>
          <p className="text-sm">Add team members who will work on this project</p>
        </div>
      )}
    </div>
  )
}