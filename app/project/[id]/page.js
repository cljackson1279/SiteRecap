'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  Calendar, 
  MapPin, 
  FileText, 
  Download, 
  Mail, 
  Trash2, 
  ChevronLeft,
  Camera,
  Zap,
  PenTool,
  Settings,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react'
import PersonnelManager from '@/components/personnel-manager'
import SignaturePad from '@/components/signature-pad'

export default function ProjectDetail() {
  const params = useParams()
  const [project, setProject] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState(null)
  const [selectedPersonnel, setSelectedPersonnel] = useState([])
  const [ownerSignature, setOwnerSignature] = useState(null)
  const [contractorSignature, setContractorSignature] = useState(null)
  const [showSignatures, setShowSignatures] = useState(false)
  const [showProjectSettings, setShowProjectSettings] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [closingProject, setClosingProject] = useState(false)
  const [reopeningProject, setReopeningProject] = useState(false)

  useEffect(() => {
    loadProject()
    loadPhotos()
  }, [params.id, selectedDate])

  const loadProject = async () => {
    // Simulate loading project
    const projects = {
      '1': {
        id: '1',
        name: 'Kitchen Remodel - Smith Residence',
        city: 'Austin',
        state: 'TX',
        postal_code: '78701',
        lat: 30.2672,
        lon: -97.7431,
        owner_name: 'John Smith',
        owner_email: 'john.smith@example.com',
        gc_name: 'Mike Johnson', 
        gc_email: 'mike@contractorco.com',
        status: 'active'
      },
      '2': {
        id: '2', 
        name: 'Bathroom Renovation - Johnson Home',
        city: 'Dallas',
        state: 'TX',
        postal_code: '75201',
        lat: 32.7767,
        lon: -96.7970,
        owner_name: 'Sarah Johnson',
        owner_email: 'sarah.johnson@example.com',
        gc_name: 'Carlos Martinez',
        gc_email: 'carlos@renovationpro.com',
        status: 'completed'
      }
    }
    setProject(projects[params.id] || projects['1'])
  }

  const loadPhotos = async () => {
    // Simulate loading photos for the date
    setPhotos([
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
        created_at: new Date().toISOString()
      },
      {
        id: '2', 
        url: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=300&h=200&fit=crop',
        created_at: new Date().toISOString()
      }
    ])
  }

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (!files.length) return

    setUploading(true)
    
    try {
      for (const file of files) {
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('project_id', params.id)
        formData.append('shot_date', selectedDate)

        // Try to upload via API first
        try {
          const response = await fetch('/api/upload-photo', {
            method: 'POST',
            body: formData
          })

          const data = await response.json()
          
          if (data.success) {
            // API upload successful
            const newPhoto = {
              id: data.photo.id,
              url: data.photo.url,
              created_at: data.photo.created_at
            }
            setPhotos(prev => [...prev, newPhoto])
          } else {
            throw new Error(data.error || 'Upload failed')
          }
        } catch (apiError) {
          console.log('API upload failed, using local preview:', apiError)
          // Fallback to local preview for demo/test mode
          const newPhoto = {
            id: Date.now() + Math.random(),
            url: URL.createObjectURL(file),
            created_at: new Date().toISOString(),
            file: file // Store file for AI analysis
          }
          setPhotos(prev => [...prev, newPhoto])
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('❌ Failed to upload photos. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const generateReport = async () => {
    if (photos.length === 0) {
      alert('Please upload photos before generating a report')
      return
    }

    setGenerating(true)
    
    try {
      // Call the real AI pipeline API
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: params.id,
          date: selectedDate,
          photos: photos.map(p => ({
            id: p.id,
            url: p.url,
            created_at: p.created_at
          })),
          project_name: project?.name || 'Construction Project',
          personnel: selectedPersonnel
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setReport({
          owner_markdown: data.owner_markdown,
          gc_markdown: data.gc_markdown,
          debug: data.debug || {
            photos_analyzed: photos.length,
            weather_included: true,
            model_used: 'gemini-2.0-flash-exp'
          }
        })
        
        // Update project activity for auto-close tracking
        fetch('/api/update-project-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: params.id })
        }).catch(err => console.log('Activity update error:', err))
        
        alert('✅ AI Report generated successfully!')
      } else {
        alert(`❌ Failed to generate report: ${data.error}`)
        // Fallback to demo report if API fails
        setReport({
          owner_markdown: `# Daily Update - ${project?.name}\n**${selectedDate}** • 🌤️ 76°F Partly cloudy\n\n## Today's Progress\nReport generated from ${photos.length} uploaded photos.\n\n## Work Completed\n• Photo documentation completed\n• Site progress recorded\n\n## What's Next\n• Review uploaded photos\n• Continue site work`,
          gc_markdown: `# GC Daily Report - ${project?.name}\n**${selectedDate}** • 🌤️ 76°F Partly cloudy\n\n## Photo Documentation\n• ${photos.length} photos uploaded and analyzed\n• Site progress documented\n\n## Next Steps\n• Review analysis results\n• Plan tomorrow's activities`,
          debug: {
            photos_analyzed: photos.length,
            weather_included: true,
            model_used: 'fallback-mode',
            error: data.error
          }
        })
      }
    } catch (error) {
      console.error('Report generation error:', error)
      alert('❌ Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const deletePhoto = (photoId) => {
    setPhotos(photos.filter(p => p.id !== photoId))
  }

  const handleEmailReport = async (variant) => {
    if (!report) {
      alert('Please generate a report first')
      return
    }

    try {
      const response = await fetch('/api/email-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: '1',
          variant: variant
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`✅ ${data.message}`)
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch (error) {
      console.error('Email error:', error)
      alert('Failed to send email. Please try again.')
    }
  }

  const handleExportPDF = async (variant) => {
    if (!report) {
      alert('Please generate a report first')
      return
    }

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: '1',
          variant: variant
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`✅ ${data.message}`)
        // In a real app, this would open/download the PDF
        console.log('PDF URL:', data.url)
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  const handleCloseProject = async () => {
    if (!confirm('Are you sure you want to close this project? You can reopen it later, but no new photos or reports can be generated while closed.')) {
      return
    }

    setClosingProject(true)
    try {
      const response = await fetch('/api/close-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: params.id
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setProject(prev => ({ ...prev, status: 'completed' }))
        alert('✅ Project closed successfully')
      } else {
        alert(`❌ ${data.error || 'Failed to close project'}`)
      }
    } catch (error) {
      console.error('Error closing project:', error)
      alert('❌ Failed to close project. Please try again.')
    } finally {
      setClosingProject(false)
    }
  }

  const handleReopenProject = async () => {
    if (!confirm('Are you sure you want to reopen this project? This will allow new photos and reports to be generated.')) {
      return
    }

    setReopeningProject(true)
    try {
      const response = await fetch('/api/reopen-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: params.id,
          org_id: 'demo-org' // In real app, get from auth context
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setProject(prev => ({ ...prev, status: 'active' }))
        alert('✅ Project reopened successfully')
      } else {
        alert(`❌ ${data.error || 'Failed to reopen project'}`)
      }
    } catch (error) {
      console.error('Error reopening project:', error)
      alert('❌ Failed to reopen project. Please try again.')
    } finally {
      setReopeningProject(false)
    }
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {project.city}, {project.state} {project.postal_code}
            </div>
          </div>
          
          {/* Owner/GC Contact Info */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-primary min-w-[60px]">Owner:</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-medium">{project.owner_name || 'Not set'}</span>
                {project.owner_email && (
                  <span className="text-muted-foreground text-xs sm:text-sm">
                    {project.owner_email}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-primary min-w-[60px]">GC:</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-medium">{project.gc_name || 'Not set'}</span>
                {project.gc_email && (
                  <span className="text-muted-foreground text-xs sm:text-sm">
                    {project.gc_email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => window.location.href = `/project/${params.id}/reports`}
          >
            <FileText className="mr-2 h-4 w-4" />
            View All Reports
          </Button>
          
          {project.status === 'active' ? (
            <Button 
              variant="outline"
              onClick={handleCloseProject}
              disabled={closingProject}
            >
              <Lock className="mr-2 h-4 w-4" />
              {closingProject ? 'Closing...' : 'Close Project'}
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={handleReopenProject}
              disabled={reopeningProject}
            >
              <Unlock className="mr-2 h-4 w-4" />
              {reopeningProject ? 'Reopening...' : 'Reopen Project'}
            </Button>
          )}
          
          <Button 
            variant="outline"
            size="icon"
            onClick={() => setShowProjectSettings(!showProjectSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Closed Banner */}
      {project.status !== 'active' && (
        <div className="mb-6 p-4 bg-muted border-l-4 border-l-orange-500 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <div>
              <h3 className="font-semibold text-orange-700">Project Closed</h3>
              <p className="text-sm text-muted-foreground">
                This project is closed. Reports are read-only. No new photos can be uploaded or reports generated.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Badge variant="outline">{photos.length} photos</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Personnel Section */}
      <PersonnelManager
        projectId={params.id}
        selectedPersonnel={selectedPersonnel}
        onSelectionChange={setSelectedPersonnel}
        mode="select"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Photos Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Job Site Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 mb-4">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload job site photos for {selectedDate}
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button
                    onClick={() => document.getElementById('photo-upload').click()}
                    disabled={uploading || project.status !== 'active'}
                  >
                    {project.status !== 'active' ? 'Project Closed' : (uploading ? 'Uploading...' : 'Choose Photos')}
                  </Button>
                </div>
              </div>

              {/* Photos Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt="Job site"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {project.status === 'active' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deletePhoto(photo.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Report Button */}
          <Button
            onClick={generateReport}
            disabled={generating || photos.length === 0 || project.status !== 'active'}
            className="w-full h-12"
            size="lg"
          >
            <Zap className="mr-2 h-5 w-5" />
            {project.status !== 'active' ? 'Project Closed' : (generating ? 'Generating Report...' : 'Generate AI Report')}
          </Button>
        </div>

        {/* Report Section */}
        <div>
          {report ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Daily Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="owner" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="owner">Owner Report</TabsTrigger>
                    <TabsTrigger value="gc">GC Report</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="owner" className="mt-4">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-line text-sm">
                        {report.owner_markdown}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExportPDF('owner')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEmailReport('owner')}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Email Owner
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowSignatures(true)}
                      >
                        <PenTool className="mr-2 h-4 w-4" />
                        Sign Report
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="gc" className="mt-4">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-line text-sm">
                        {report.gc_markdown}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExportPDF('gc')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEmailReport('gc')}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Email GC
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowSignatures(true)}
                      >
                        <PenTool className="mr-2 h-4 w-4" />
                        Sign Report
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Debug Info */}
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDebug(!showDebug)}
                  >
                    Debug Info {showDebug ? '−' : '+'}
                  </Button>
                  {showDebug && report.debug && (
                    <div className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono">
                      <div>Photos analyzed: {report.debug.photos_analyzed}</div>
                      <div>Weather included: {report.debug.weather_included ? 'Yes' : 'No'}</div>
                      <div>Model used: {report.debug.model_used}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Report Generated</h3>
                <p className="text-muted-foreground mb-4">
                  Upload photos and click "Generate AI Report" to create your daily progress report.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatures && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Sign Daily Report</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSignatures(false)}
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Owner Signature</h3>
                  <SignaturePad
                    title="Owner Signature"
                    onSignature={(signature) => setOwnerSignature(signature)}
                  />
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Contractor Signature</h3>
                  <SignaturePad
                    title="Contractor Signature"
                    onSignature={(signature) => setContractorSignature(signature)}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      if (ownerSignature || contractorSignature) {
                        alert('✅ Signatures saved to report')
                        setShowSignatures(false)
                      } else {
                        alert('Please add at least one signature')
                      }
                    }}
                    className="flex-1"
                  >
                    Save Signatures
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSignatures(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}