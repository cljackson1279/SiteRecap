'use client'

import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function SignaturePad({ title = "Sign Report", onSignature }) {
  const sigCanvas = useRef(null)
  const [signerName, setSignerName] = useState('')
  const [signerTitle, setSignerTitle] = useState('')
  const [signatureData, setSignatureData] = useState(null)

  const clearSignature = () => {
    sigCanvas.current.clear()
    setSignatureData(null)
  }

  const saveSignature = () => {
    if (sigCanvas.current.isEmpty()) {
      alert('Please provide a signature')
      return
    }

    if (!signerName.trim()) {
      alert('Please enter your name')
      return
    }

    const signature = {
      name: signerName.trim(),
      title: signerTitle.trim(),
      signature: sigCanvas.current.getTrimmedCanvas().toDataURL(),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    }

    setSignatureData(signature)
    onSignature?.(signature)
  }

  if (signatureData) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            ✅ {title} - Signed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Signed by:</Label>
              <p className="text-sm">{signatureData.name}</p>
            </div>
            {signatureData.title && (
              <div>
                <Label className="text-sm font-medium">Title:</Label>
                <p className="text-sm">{signatureData.title}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Date:</Label>
              <p className="text-sm">{signatureData.date}</p>
            </div>
            <div className="border rounded-lg p-2 bg-white">
              <img 
                src={signatureData.signature} 
                alt="Signature" 
                className="h-16 w-auto"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSignatureData(null)}
            >
              Edit Signature
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="signer-name">Name *</Label>
            <Input
              id="signer-name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <Label htmlFor="signer-title">Title</Label>
            <Input
              id="signer-title"
              value={signerTitle}
              onChange={(e) => setSignerTitle(e.target.value)}
              placeholder="e.g., Project Manager, Foreman"
            />
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-2 block">
            Signature *
          </Label>
          <div className="border border-gray-300 rounded-lg bg-white">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: 400,
                height: 120,
                className: 'signature-canvas w-full'
              }}
              backgroundColor="white"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sign above using your mouse, finger, or stylus
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={saveSignature} className="flex-1">
            Save Signature
          </Button>
          <Button variant="outline" onClick={clearSignature}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}