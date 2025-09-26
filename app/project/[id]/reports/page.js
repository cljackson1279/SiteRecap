'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  FileText, 
  Calendar,
  Download,
  Mail,
  Eye,
  Search,
  Filter
} from 'lucide-react'

export default function ReportsArchive() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProject()
    loadReports()
  }, [params.id])

  useEffect(() => {
    // Filter reports based on search term
    if (searchTerm.trim()) {
      const filtered = reports.filter(report => 
        report.date.includes(searchTerm) ||
        report.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredReports(filtered)
    } else {
      setFilteredReports(reports)
    }
  }, [searchTerm, reports])

  const loadProject = async () => {
    // Simulate loading project
    const projects = {
      '1': {
        id: '1',
        name: 'Kitchen Remodel - Smith Residence',
        city: 'Austin',
        state: 'TX',
        postal_code: '78701'
      },
      '2': {
        id: '2', 
        name: 'Bathroom Renovation - Johnson Home',
        city: 'Dallas',
        state: 'TX',
        postal_code: '75201'
      }
    }
    setProject(projects[params.id] || projects['1'])
  }

  const loadReports = async () => {
    try {
      // Simulate loading reports - in real app this would fetch from database
      const mockReports = [
        {
          id: '1',
          date: '2025-09-26',
          status: 'completed',
          owner_signed: true,
          contractor_signed: true,
          photos_count: 8,
          created_at: '2025-09-26T10:30:00Z',
          summary: 'Cabinet installation progress, electrical rough-in completed'
        },
        {
          id: '2', 
          date: '2025-09-25',
          status: 'completed',
          owner_signed: true,
          contractor_signed: false,
          photos_count: 6,
          created_at: '2025-09-25T16:45:00Z',
          summary: 'Demolition complete, framing started'
        },
        {
          id: '3',
          date: '2025-09-24',
          status: 'draft',
          owner_signed: false,
          contractor_signed: false,
          photos_count: 4,
          created_at: '2025-09-24T14:20:00Z',
          summary: 'Initial site preparation and material delivery'
        },
        {
          id: '4',
          date: '2025-09-23',
          status: 'completed',
          owner_signed: true,
          contractor_signed: true,
          photos_count: 12,
          created_at: '2025-09-23T11:15:00Z',
          summary: 'Plumbing rough-in, drywall installation begun'
        },
        {
          id: '5',
          date: '2025-09-22',
          status: 'completed',
          owner_signed: true,
          contractor_signed: true,
          photos_count: 5,
          created_at: '2025-09-22T13:30:00Z',
          summary: 'Foundation work completed, weather delay resolved'
        }
      ]

      setReports(mockReports.sort((a, b) => new Date(b.date) - new Date(a.date)))
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (report) => {
    if (report.status === 'completed') {
      const signaturesComplete = report.owner_signed && report.contractor_signed
      return (
        <Badge variant={signaturesComplete ? 'default' : 'secondary'}>
          {signaturesComplete ? 'Fully Signed' : 'Completed'}
        </Badge>
      )
    }
    return <Badge variant="outline">Draft</Badge>
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
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

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.push(`/project/${params.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Reports Archive</h1>
          <p className="text-muted-foreground mt-1">{project?.name}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredReports.length} reports
        </Badge>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports by date or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No reports found' : 'No reports yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? `No reports match "${searchTerm}". Try adjusting your search.`
                : 'Daily reports will appear here once generated.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push(`/project/${params.id}`)}>
                Create First Report
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {formatDate(report.date)}
                      </h3>
                      {getStatusBadge(report)}
                    </div>
                    
                    <p className="text-muted-foreground mb-3">
                      {report.summary}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatTime(report.created_at)}
                      </div>
                      <div>
                        📷 {report.photos_count} photos
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={report.owner_signed ? 'text-green-600' : 'text-muted-foreground'}>
                          {report.owner_signed ? '✅' : '⏳'} Owner
                        </span>
                        <span className={report.contractor_signed ? 'text-green-600' : 'text-muted-foreground'}>
                          {report.contractor_signed ? '✅' : '⏳'} Contractor
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/project/${params.id}/report/${report.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {reports.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {reports.filter(r => r.owner_signed && r.contractor_signed).length}
              </div>
              <div className="text-sm text-muted-foreground">Fully Signed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-muted-foreground">
                {reports.reduce((sum, r) => sum + r.photos_count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Photos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}