'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Plus, 
  X, 
  UserCheck
} from 'lucide-react'

export default function PersonnelManager({ 
  projectId,
  selectedPersonnel = [],
  onSelectionChange,
  mode = 'select' // 'setup' or 'select'
}) {
  const [teamMembers, setTeamMembers] = useState([
    // Demo team members
    { id: '1', name: 'Mike Johnson', title: 'Foreman', trade: 'General' },
    { id: '2', name: 'Sarah Chen', title: 'Electrician', trade: 'Electrical' },
    { id: '3', name: 'Carlos Rodriguez', title: 'Plumber', trade: 'Plumbing' },
    { id: '4', name: 'David Kim', title: 'Carpenter', trade: 'Carpentry' }
  ])
  
  const [newMember, setNewMember] = useState({ name: '', title: '', trade: '' })
  const [showAddForm, setShowAddForm] = useState(false)

  const addTeamMember = () => {
    if (!newMember.name.trim() || !newMember.title.trim()) {
      alert('Please enter name and title')
      return
    }

    const member = {
      id: Date.now().toString(),
      name: newMember.name.trim(),
      title: newMember.title.trim(),
      trade: newMember.trade.trim() || 'General'
    }

    setTeamMembers([...teamMembers, member])
    setNewMember({ name: '', title: '', trade: '' })
    setShowAddForm(false)
  }

  const removeMember = (memberId) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId))
    // Also remove from selection if selected
    const updatedSelection = selectedPersonnel.filter(id => id !== memberId)
    onSelectionChange?.(updatedSelection)
  }

  const toggleSelection = (memberId) => {
    if (!onSelectionChange) return
    
    const isSelected = selectedPersonnel.includes(memberId)
    let updatedSelection
    
    if (isSelected) {
      updatedSelection = selectedPersonnel.filter(id => id !== memberId)
    } else {
      updatedSelection = [...selectedPersonnel, memberId]
    }
    
    onSelectionChange(updatedSelection)
  }

  const selectedMembers = teamMembers.filter(m => selectedPersonnel.includes(m.id))

  if (mode === 'setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add Team Member Form */}
            {showAddForm ? (
              <div className="border rounded-lg p-4 bg-muted/10">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <Label htmlFor="member-name">Name</Label>
                    <Input
                      id="member-name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member-title">Title</Label>
                    <Input
                      id="member-title"
                      value={newMember.title}
                      onChange={(e) => setNewMember({...newMember, title: e.target.value})}
                      placeholder="Job title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member-trade">Trade</Label>
                    <Input
                      id="member-trade"
                      value={newMember.trade}
                      onChange={(e) => setNewMember({...newMember, trade: e.target.value})}
                      placeholder="Trade/Specialty"
                    />
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
                <Label className="text-sm font-medium">Team Members</Label>
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
          </div>
        </CardContent>
      </Card>
    )
  }

  // Selection mode for daily reports
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Personnel on Site Today
          <Badge variant="secondary" className="ml-2">
            {selectedPersonnel.length} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No team members set up. Add team members in project settings.
          </p>
        ) : (
          <div className="space-y-3">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`member-${member.id}`}
                  checked={selectedPersonnel.includes(member.id)}
                  onCheckedChange={() => toggleSelection(member.id)}
                />
                <div className="flex-1">
                  <Label htmlFor={`member-${member.id}`} className="font-medium cursor-pointer">
                    {member.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{member.title} • {member.trade}</p>
                </div>
              </div>
            ))}

            {selectedMembers.length > 0 && (
              <div className="mt-4 p-3 bg-muted/20 rounded-lg">
                <Label className="text-sm font-medium">Selected for today:</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedMembers.map(member => (
                    <Badge key={member.id} variant="secondary">
                      {member.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}