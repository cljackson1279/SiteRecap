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
  Settings
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
  const [showDebug, setShowDebug] = useState(false)

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
        lon: -97.7431
      },
      '2': {
        id: '2', 
        name: 'Bathroom Renovation - Johnson Home',
        city: 'Dallas',
        state: 'TX',
        postal_code: '75201',
        lat: 32.7767,
        lon: -96.7970
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
      // Simulate upload
      for (const file of files) {
        const newPhoto = {
          id: Date.now() + Math.random(),
          url: URL.createObjectURL(file),
          created_at: new Date().toISOString()
        }
        setPhotos(prev => [...prev, newPhoto])
      }
    } catch (error) {
      console.error('Upload error:', error)
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
      // Simulate enhanced report with new sections
      setReport({
        owner_markdown: `# Daily Update - ${project?.name}\n**${selectedDate}** • 🌤️ 76°F Partly cloudy\n\n## Today's Progress\nWork observed in Kitchen area with cabinet installation in progress.\n\n## Work Completed\n• Base cabinets installed on south wall (85%)\n• Electrical rough-in completed (92%)\n• Plumbing connections verified (88%)\n\n## Crew on Site\n• 4 workers present\n\n## Deliveries\n• Material delivery - completed\n\n## Safety\n• Site safety compliance: good\n\n## What's Next\n• Continue upper cabinet installation\n• Schedule countertop template\n• Coordinate tile delivery`,
        gc_markdown: `# GC Daily Report - ${project?.name}\n**${selectedDate}** • 🌤️ 76°F Partly cloudy\n\n## Manpower\n• Total crew: 4 workers\n• Notes: Full crew present for cabinet installation\n\n## Equipment on Site\n• Circular saw - power_tool (Photos: 1, 2)\n• Drill driver - power_tool (Photos: 1)\n• Level - hand_tool (Photos: 2)\n\n## Materials\n• Base cabinets - in_use (Photos: 1, 2)\n• Cabinet hardware - delivered (Photos: 1)\n• Wood screws - in_use (Photos: 2)\n\n## Deliveries\n• Material delivery - completed (morning) (Photos: 1)\n\n## Kitchen - Cabinets\n### Tasks Completed\n• Base cabinets installed on south wall - 85% (Photos: 1, 2)\n• Cabinet hardware installation - 70%\n\n### Safety Notes\n• Tool storage area organized - LOW\n\n## Safety Summary\n• Overall compliance: good\n• Proper PPE worn - LOW (Photos: 1, 2)\n\n## Tomorrow's Plan\n• Continue upper cabinet installation\n• Schedule electrical inspection\n• Coordinate with plumber for final connections`,
        debug: {
          photos_analyzed: photos.length,
          weather_included: true,
          model_used: 'gemini-2.0-flash-exp'
        }
      })
    } catch (error) {
      console.error('Report generation error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const deletePhoto = (photoId) => {
    setPhotos(photos.filter(p => p.id !== photoId))
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
        </div>
      </div>

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
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Choose Photos'}
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
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deletePhoto(photo.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Report Button */}
          <Button
            onClick={generateReport}
            disabled={generating || photos.length === 0}
            className="w-full h-12"
            size="lg"
          >
            <Zap className="mr-2 h-5 w-5" />
            {generating ? 'Generating Report...' : 'Generate AI Report'}
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
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Owner
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
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Email GC
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
    </div>
  )
}