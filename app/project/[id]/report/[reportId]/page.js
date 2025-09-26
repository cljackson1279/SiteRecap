'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Edit,
  Save,
  X,
  Download,
  Mail,
  History,
  PenTool
} from 'lucide-react'
import SignaturePad from '@/components/signature-pad'

export default function ReportDetail() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState(null)
  const [project, setProject] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editedOwnerMd, setEditedOwnerMd] = useState('')
  const [editedGcMd, setEditedGcMd] = useState('')
  const [showSignatures, setShowSignatures] = useState(false)
  const [ownerSignature, setOwnerSignature] = useState(null)
  const [contractorSignature, setContractorSignature] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReport()
    loadProject()
  }, [params.id, params.reportId])

  const loadProject = async () => {
    const projects = {
      '1': {
        id: '1',
        name: 'Kitchen Remodel - Smith Residence',
        city: 'Austin',
        state: 'TX',
        postal_code: '78701'
      }
    }
    setProject(projects[params.id] || projects['1'])
  }

  const loadReport = async () => {
    try {
      // Simulate loading specific report
      const mockReport = {
        id: params.reportId,
        date: '2025-09-26',
        status: 'completed',
        owner_signed: true,
        contractor_signed: false,
        photos_count: 8,
        created_at: '2025-09-26T10:30:00Z',
        last_edited: '2025-09-26T15:45:00Z',
        owner_md: `# Daily Update - Kitchen Remodel - Smith Residence
**2025-09-26** • 🌤️ 76°F Partly cloudy

## Today's Progress
Work observed in Kitchen area with cabinet installation in progress.

## Work Completed
• Base cabinets installed on south wall (85%)
• Electrical rough-in completed (92%)
• Plumbing connections verified (88%)

## Crew on Site
• 4 workers present

## Deliveries
• Material delivery - completed

## Safety
• Site safety compliance: good

## What's Next
• Continue upper cabinet installation
• Schedule countertop template
• Coordinate tile delivery`,
        gc_md: `# GC Daily Report - Kitchen Remodel - Smith Residence
**2025-09-26** • 🌤️ 76°F Partly cloudy

## Manpower
• Total crew: 4 workers
• Notes: Full crew present for cabinet installation

## Equipment on Site
• Circular saw - power_tool (Photos: 1, 2)
• Drill driver - power_tool (Photos: 1)
• Level - hand_tool (Photos: 2)

## Materials
• Base cabinets - in_use (Photos: 1, 2)
• Cabinet hardware - delivered (Photos: 1)
• Wood screws - in_use (Photos: 2)

## Deliveries
• Material delivery - completed (morning) (Photos: 1)

## Kitchen - Cabinets
### Tasks Completed
• Base cabinets installed on south wall - 85% (Photos: 1, 2)
• Cabinet hardware installation - 70%

### Safety Notes
• Tool storage area organized - LOW

## Safety Summary
• Overall compliance: good
• Proper PPE worn - LOW (Photos: 1, 2)

## Tomorrow's Plan
• Continue upper cabinet installation
• Schedule electrical inspection
• Coordinate with plumber for final connections`,
        edit_history: [
          {
            timestamp: '2025-09-26T15:45:00Z',
            user: 'John Smith',
            action: 'Edited safety compliance section'
          },
          {
            timestamp: '2025-09-26T10:30:00Z',
            user: 'System',
            action: 'Report generated via AI'
          }
        ]
      }
      
      setReport(mockReport)
      setEditedOwnerMd(mockReport.owner_md)
      setEditedGcMd(mockReport.gc_md)
    } catch (error) {
      console.error('Error loading report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = () => {
    // Update the report with edited content
    setReport(prev => ({
      ...prev,
      owner_md: editedOwnerMd,
      gc_md: editedGcMd,
      last_edited: new Date().toISOString(),
      edit_history: [
        {
          timestamp: new Date().toISOString(),
          user: 'Current User',
          action: 'Manual edit - content updated'
        },
        ...prev.edit_history
      ]
    }))
    
    setEditMode(false)
    // In a real app, this would save to the database
    console.log('Saving report changes')
  }

  const handleCancelEdit = () => {
    setEditedOwnerMd(report.owner_md)
    setEditedGcMd(report.gc_md)
    setEditMode(false)
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested report could not be found.</p>
          <Button onClick={() => router.push(`/project/${params.id}/reports`)}>
            Back to Reports
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push(`/project/${params.id}/reports`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Daily Report - {new Date(report.date).toLocaleDateString()}
            </h1>
            <p className="text-muted-foreground mt-1">{project?.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={report.status === 'completed' ? 'default' : 'outline'}>
            {report.status}
          </Badge>
          {!editMode ? (
            <Button variant="outline" onClick={() => setEditMode(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Report
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSaveChanges}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Report Metadata */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p className="font-medium">{formatDateTime(report.created_at)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Edited:</span>
              <p className="font-medium">{formatDateTime(report.last_edited)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Photos:</span>
              <p className="font-medium">{report.photos_count} images</p>
            </div>
            <div>
              <span className="text-muted-foreground">Signatures:</span>
              <p className="font-medium">
                {report.owner_signed ? '✅' : '⏳'} Owner {' '}
                {report.contractor_signed ? '✅' : '⏳'} Contractor
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Report Content
                {editMode && (
                  <Badge variant="outline">Editing Mode</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="owner" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="owner">Owner Report</TabsTrigger>
                  <TabsTrigger value="gc">GC Report</TabsTrigger>
                </TabsList>
                
                <TabsContent value="owner" className="mt-4">
                  {editMode ? (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Edit Owner Report:
                      </label>
                      <Textarea
                        value={editedOwnerMd}
                        onChange={(e) => setEditedOwnerMd(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Edit the owner report content..."
                      />
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-line text-sm">
                        {report.owner_md}
                      </div>
                    </div>
                  )}
                  
                  {!editMode && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Owner
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="gc" className="mt-4">
                  {editMode ? (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Edit GC Report:
                      </label>
                      <Textarea
                        value={editedGcMd}
                        onChange={(e) => setEditedGcMd(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Edit the GC report content..."
                      />
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-line text-sm">
                        {report.gc_md}
                      </div>
                    </div>
                  )}
                  
                  {!editMode && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Email GC
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setShowSignatures(!showSignatures)}
              >
                <PenTool className="mr-2 h-4 w-4" />
                {showSignatures ? 'Hide Signatures' : 'Add Signatures'}
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Both PDFs
              </Button>
              <Button className="w-full" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Email Both Reports
              </Button>
            </CardContent>
          </Card>

          {/* Edit History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Edit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.edit_history.map((edit, index) => (
                  <div key={index} className="text-sm border-l-2 border-muted pl-3">
                    <p className="font-medium">{edit.action}</p>
                    <p className="text-muted-foreground">
                      {edit.user} • {formatDateTime(edit.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Signature Section */}
      {showSignatures && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <SignaturePad
                  title="Owner Signature"
                  onSignature={setOwnerSignature}
                />
                <SignaturePad
                  title="Contractor Signature"
                  onSignature={setContractorSignature}
                />
              </div>
              
              {ownerSignature && contractorSignature && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <h4 className="text-green-800 font-semibold mb-2">
                    ✅ Report Fully Signed
                  </h4>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export Signed Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}