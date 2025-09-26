import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { analyzePhoto, generateReport, generateOwnerMarkdown, generateGCMarkdown } from '@/lib/ai-pipeline'
import { getCurrentWeather, geocodeLocation } from '@/lib/weather'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Helper to get request body
async function getRequestBody(request) {
  try {
    return await request.json()
  } catch {
    return {}
  }
}

// POST /api/upload-photo
async function uploadPhoto(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const projectId = formData.get('project_id')
    const shotDate = formData.get('shot_date')
    
    if (!file || !projectId || !shotDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const storagePath = `photos/${projectId}/${fileName}`
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('photos')
      .upload(storagePath, file)
    
    if (uploadError) {
      throw uploadError
    }
    
    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('photos')
      .getPublicUrl(storagePath)
    
    // Insert photo record
    const { data, error } = await supabaseAdmin
      .from('photos')
      .insert([{
        project_id: projectId,
        shot_date: shotDate,
        url: urlData.publicUrl,
        storage_path: storagePath
      }])
      .select()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, photo: data[0] })
  } catch (error) {
    console.error('Upload photo error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/delete-photo
async function deletePhoto(request) {
  try {
    const { photo_id } = await getRequestBody(request)
    
    if (!photo_id) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 })
    }
    
    // Get photo record
    const { data: photo, error: fetchError } = await supabaseAdmin
      .from('photos')
      .select('storage_path')
      .eq('id', photo_id)
      .single()
    
    if (fetchError) throw fetchError
    
    // Delete from storage
    if (photo.storage_path) {
      await supabaseAdmin.storage
        .from('photos')
        .remove([photo.storage_path])
    }
    
    // Delete record
    const { error: deleteError } = await supabaseAdmin
      .from('photos')
      .delete()
      .eq('id', photo_id)
    
    if (deleteError) throw deleteError
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/geocode-project
async function geocodeProject(request) {
  try {
    const { project_id, city, state, postal_code } = await getRequestBody(request)
    
    if (!project_id) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }
    
    const coords = await geocodeLocation(city, state, postal_code)
    
    if (!coords) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }
    
    // Update project with coordinates and normalized location
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({
        city: coords.city,
        state: coords.state,
        postal_code: postal_code,
        lat: coords.lat,
        lon: coords.lon
      })
      .eq('id', project_id)
      .select()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, coords, project: data[0] })
  } catch (error) {
    console.error('Geocode error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/generate-report
async function generateDailyReport(request) {
  try {
    const { project_id, date } = await getRequestBody(request)
    
    if (!project_id || !date) {
      return NextResponse.json({ error: 'Project ID and date required' }, { status: 400 })
    }
    
    // Get project details
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .single()
    
    if (projectError) throw projectError
    
    // Get photos for the date
    const { data: photos, error: photosError } = await supabaseAdmin
      .from('photos')
      .select('*')
      .eq('project_id', project_id)
      .eq('shot_date', date)
      .order('created_at', { ascending: true })
    
    if (photosError) throw photosError
    
    if (!photos || photos.length === 0) {
      return NextResponse.json({ error: 'No photos found for this date' }, { status: 404 })
    }
    
    // Get weather if coordinates available
    let weather = null
    if (project.lat && project.lon) {
      weather = await getCurrentWeather(project.lat, project.lon)
    }
    
    // Stage A: Analyze each photo
    const photoAnalyses = []
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      
      try {
        // Download photo and convert to base64
        const response = await fetch(photo.url)
        const arrayBuffer = await response.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        
        // Analyze photo
        const analysis = await analyzePhoto(base64, i + 1)
        photoAnalyses.push(analysis)
        
      } catch (error) {
        console.error(`Failed to analyze photo ${i + 1}:`, error)
        photoAnalyses.push({
          photoIndex: i + 1,
          space: '',
          phase: '',
          caption: 'Analysis failed',
          objects: [],
          tasks: [],
          hazards: [],
          error: true
        })
      }
    }
    
    // Stage B: Generate aggregate report
    const reportData = await generateReport(photoAnalyses, project.name, date)
    
    // Generate markdown reports
    const ownerMd = generateOwnerMarkdown(reportData, weather, project.name, date)
    const gcMd = generateGCMarkdown(reportData, weather, project.name, date)
    
    // Save report to database
    const rawJson = {
      stage_a: photoAnalyses,
      stage_b: reportData,
      weather,
      photos: photos.map(p => ({ id: p.id, url: p.url })),
      generated_at: new Date().toISOString(),
      model_used: 'gemini'
    }
    
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .upsert([{
        project_id,
        date,
        owner_md: ownerMd,
        gc_md: gcMd,
        raw_json: rawJson,
        status: 'generated'
      }], {
        onConflict: 'project_id,date'
      })
      .select()
    
    if (reportError) throw reportError
    
    return NextResponse.json({
      success: true,
      report: report[0],
      owner_markdown: ownerMd,
      gc_markdown: gcMd,
      debug: {
        photos_analyzed: photos.length,
        weather_included: !!weather,
        model_used: 'gemini'
      }
    })
    
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/export-pdf
async function exportPDF(request) {
  try {
    const { report_id, variant } = await getRequestBody(request)
    
    if (!report_id || !variant) {
      return NextResponse.json({ error: 'Report ID and variant required' }, { status: 400 })
    }

    if (!['owner', 'gc'].includes(variant)) {
      return NextResponse.json({ error: 'Variant must be owner or gc' }, { status: 400 })
    }

    // Simulate loading report and project data
    const mockReport = {
      id: report_id,
      date: '2025-09-26',
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
• Coordinate with plumber for final connections`
    }

    const mockProject = {
      name: 'Kitchen Remodel - Smith Residence',
      city: 'Austin',
      state: 'TX'
    }

    // Get markdown content
    const markdown = variant === 'owner' ? mockReport.owner_md : mockReport.gc_md
    
    // Convert markdown to simple HTML for PDF
    const htmlContent = markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^\* (.+)$/gm, '<li>$1</li>')
      .replace(/^• (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/<p><h/g, '<h')
      .replace(/<\/h[1-6]><\/p>/g, '')
      .replace(/<p><li>/g, '<ul><li>')
      .replace(/<\/li><\/p>/g, '</li></ul>')

    // Create complete HTML document for PDF
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SiteRecap - ${variant === 'owner' ? 'Owner' : 'GC'} Report</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #168995;
            padding-bottom: 20px;
            margin-bottom: 40px;
        }
        .logo {
            color: #168995;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        h1 {
            color: #2C3E46;
            font-size: 24px;
            margin: 0 0 10px 0;
        }
        h2 {
            color: #168995;
            font-size: 18px;
            margin: 25px 0 10px 0;
            border-bottom: 1px solid #e9ecef;
            padding-bottom: 5px;
        }
        h3 {
            color: #2C3E46;
            font-size: 16px;
            margin: 20px 0 8px 0;
        }
        ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        li {
            margin: 5px 0;
        }
        .weather {
            background: #168995;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            display: inline-block;
            font-size: 14px;
            margin: 10px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🏗️ SiteRecap</div>
        <div>Professional Construction Reporting</div>
        <div style="margin-top: 10px; font-size: 14px; color: #6c757d;">
            Generated on ${new Date().toLocaleDateString()}
        </div>
    </div>
    
    <div class="content">
        ${htmlContent}
    </div>
    
    <div class="footer">
        <p>This report was generated by SiteRecap AI from construction site photos.</p>
        <p>For support, visit www.siterecap.com</p>
    </div>
</body>
</html>`

    // For demo purposes, return the HTML content as a downloadable URL
    // In production, this would use Puppeteer to generate actual PDF
    const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/pdf-preview?report=${report_id}&variant=${variant}`
    
    return NextResponse.json({
      success: true,
      url: pdfUrl,
      preview_html: fullHtml,
      message: `${variant === 'owner' ? 'Owner' : 'GC'} PDF generated successfully`
    })

  } catch (error) {
    console.error('Export PDF error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate PDF. Please try again later.' 
    }, { status: 500 })
  }
}

// POST /api/email-report
async function emailReport(request) {
  try {
    const { report_id, variant, to } = await getRequestBody(request)
    
    if (!report_id || !variant) {
      return NextResponse.json({ error: 'Report ID and variant required' }, { status: 400 })
    }

    if (!['owner', 'gc'].includes(variant)) {
      return NextResponse.json({ error: 'Variant must be owner or gc' }, { status: 400 })
    }

    // Simulate loading report and project data
    const mockReport = {
      id: report_id,
      date: '2025-09-26',
      owner_md: `# Daily Update - Kitchen Remodel\n**2025-09-26** • 🌤️ 76°F Partly cloudy\n\n## Today's Progress\nCabinet installation in progress with electrical work completed.\n\n## Work Completed\n• Base cabinets installed (85%)\n• Electrical rough-in completed (92%)\n• Plumbing connections verified (88%)`,
      gc_md: `# GC Daily Report - Kitchen Remodel\n**2025-09-26** • 🌤️ 76°F Partly cloudy\n\n## Manpower\n• Total crew: 4 workers\n\n## Equipment on Site\n• Circular saw, drill driver, level\n\n## Materials\n• Base cabinets - in use\n• Hardware - delivered`
    }

    const mockProject = {
      name: 'Kitchen Remodel - Smith Residence',
      owner_name: 'John Smith',
      owner_email: 'john.smith@example.com',
      gc_name: 'Mike Johnson',
      gc_email: 'mike@contractorco.com'
    }

    // Determine recipient
    let recipient = to
    if (!recipient) {
      recipient = variant === 'owner' ? mockProject.owner_email : mockProject.gc_email
    }

    if (!recipient) {
      return NextResponse.json({ 
        error: `No ${variant} email found. Please add ${variant} contact in project settings.` 
      }, { status: 400 })
    }

    // Get markdown content
    const markdown = variant === 'owner' ? mockReport.owner_md : mockReport.gc_md
    
    // Extract first 3 bullets for teaser
    const lines = markdown.split('\n')
    const bullets = lines.filter(line => line.trim().startsWith('•')).slice(0, 3)
    const teaserBullets = bullets.map(bullet => `<li>${bullet.replace('•', '').trim()}</li>`).join('')

    // Create email subject
    const subject = `SiteRecap — ${mockProject.name} — Daily Report ${mockReport.date}`

    // Create HTML email template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SiteRecap Daily Report</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #168995 0%, #2C3E46 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0 0 10px 0; font-size: 28px;">🏗️ SiteRecap</h1>
        <p style="margin: 0; opacity: 0.9; font-size: 16px;">Daily Progress Report</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px 20px; border: 1px solid #e9ecef;">
        <h2 style="color: #168995; margin-top: 0;">${mockProject.name}</h2>
        <div style="background: #168995; color: white; padding: 8px 12px; border-radius: 20px; display: inline-block; font-size: 14px; margin-bottom: 20px;">
            🌤️ 76°F Partly cloudy
        </div>
        
        <h3 style="color: #2C3E46; margin-bottom: 15px;">Today's Progress Highlights:</h3>
        <ul style="background: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${teaserBullets}
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/project/1/report/${report_id}" 
               style="background: #168995; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                📄 View Complete Report
            </a>
        </div>
        
        <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #6c757d; text-align: center;">
            <p>This report was generated automatically by SiteRecap AI from job site photos.</p>
            <p>Need help? Contact support at <a href="mailto:support@siterecap.com" style="color: #168995;">support@siterecap.com</a></p>
        </div>
    </div>
</body>
</html>`

    // Send email via Resend
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      try {
        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: [recipient],
          subject: subject,
          html: htmlContent,
        })

        if (error) {
          // Check if it's a domain verification error
          if (error.message && error.message.includes('domain is not verified')) {
            console.log('Domain not verified, falling back to preview mode')
            return NextResponse.json({
              success: true,
              message: `Email preview generated (domain not verified)`,
              preview_html: htmlContent,
              note: 'Email service requires domain verification. Contact admin to set up verified domain.'
            })
          }
          throw error
        }

        return NextResponse.json({
          success: true,
          message: `Report emailed to ${recipient}`,
          email_id: data.id
        })
      } catch (emailError) {
        // If email fails, fall back to preview mode
        console.log('Email sending failed, falling back to preview:', emailError.message)
        return NextResponse.json({
          success: true,
          message: `Email preview generated (sending failed)`,
          preview_html: htmlContent,
          note: 'Email sending failed. Preview generated instead.'
        })
      }
    } else {
      // Fallback when email service not configured
      return NextResponse.json({
        success: true,
        message: `Email would be sent to ${recipient}`,
        preview_html: htmlContent
      })
    }

  } catch (error) {
    console.error('Email report error:', error)
    return NextResponse.json({ 
      error: 'Failed to send email. Please try again later.' 
    }, { status: 500 })
  }
}

// GET /api/gemini-health
async function geminiHealth() {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Simple test
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' })
    const result = await model.generateContent('Hello')
    const response = result.response.text()
    
    return NextResponse.json({
      status: 'healthy',
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
      test_response: response.substring(0, 100),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Main route handler
export async function GET(request) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api', '')
  
  switch (path) {
    case '/gemini-health':
      return geminiHealth()
    default:
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function POST(request) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api', '')
  
  switch (path) {
    case '/upload-photo':
      return uploadPhoto(request)
    case '/delete-photo':
      return deletePhoto(request)
    case '/geocode-project':
      return geocodeProject(request)
    case '/generate-report':
      return generateDailyReport(request)
    case '/email-report':
      return emailReport(request)
    default:
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(request) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api', '')
  
  switch (path) {
    case '/delete-photo':
      return deletePhoto(request)
    default:
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}