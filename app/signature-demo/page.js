'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import SignaturePad from '@/components/signature-pad'

export default function SignatureDemo() {
  const [ownerSignature, setOwnerSignature] = useState(null)
  const [contractorSignature, setContractorSignature] = useState(null)

  const reportContent = `# Daily Update - Kitchen Remodel - Smith Residence
**2025-09-26** • 🌤️ 76°F Partly cloudy

## Today's Progress
Work observed in Kitchen area with cabinet installation in progress.

## Work Completed
• Base cabinets installed on south wall (85%)
• Electrical rough-in completed (92%)
• Plumbing connections verified (88%)

## Crew on Site
• 4 workers present

## Equipment on Site
• Circular saw - power_tool
• Drill driver - power_tool
• Level - hand_tool

## Materials
• Base cabinets - in_use
• Cabinet hardware - delivered
• Wood screws - in_use

## Safety
• Site safety compliance: good

## What's Next
• Continue upper cabinet installation
• Schedule countertop template
• Coordinate tile delivery`

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">E-Signature Demo</h1>
          <p className="text-muted-foreground">Enhanced Daily Report Signing</p>
        </div>
      </div>

      {/* Sample Report */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sample Daily Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-sm bg-muted/20 p-4 rounded-lg">
              {reportContent}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Section */}
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

      {/* Action Buttons */}
      {ownerSignature && contractorSignature && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Report Fully Signed
              </h3>
              <p className="text-green-700 mb-4">
                Both owner and contractor have signed this daily report.
              </p>
              <div className="flex gap-3 justify-center">
                <Button>
                  📄 Export Signed PDF
                </Button>
                <Button variant="outline">
                  📧 Email Signed Report
                </Button>
                <Button variant="outline">
                  🏗️ Back to Project
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator */}
      <div className="mt-6 p-4 bg-muted/10 rounded-lg">
        <h4 className="font-medium mb-2">Signature Progress:</h4>
        <div className="flex gap-4 text-sm">
          <span className={`flex items-center gap-2 ${ownerSignature ? 'text-green-600' : 'text-muted-foreground'}`}>
            {ownerSignature ? '✅' : '⏳'} Owner Signature {ownerSignature ? 'Complete' : 'Pending'}
          </span>
          <span className={`flex items-center gap-2 ${contractorSignature ? 'text-green-600' : 'text-muted-foreground'}`}>
            {contractorSignature ? '✅' : '⏳'} Contractor Signature {contractorSignature ? 'Complete' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  )
}