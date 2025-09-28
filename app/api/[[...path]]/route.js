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
    const { project_id, date, photos: clientPhotos, project_name } = await getRequestBody(request)
    
    if (!project_id || !date) {
      return NextResponse.json({ error: 'Project ID and date required' }, { status: 400 })
    }
    
    let photos = []
    let project = { name: project_name || 'Construction Project' }
    
    // If photos are provided in request (demo/test mode), use those
    if (clientPhotos && clientPhotos.length > 0) {
      photos = clientPhotos
      console.log(`Using ${photos.length} client-provided photos for analysis`)
    } else {
      // Otherwise, get from database (production mode)
      const { data: projectData, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', project_id)
        .single()
      
      if (projectError) throw projectError
      project = projectData
      
      // Get photos for the date
      const { data: photosData, error: photosError } = await supabaseAdmin
        .from('photos')
        .select('*')
        .eq('project_id', project_id)
        .eq('shot_date', date)
        .order('created_at', { ascending: true })
      
      if (photosError) throw photosError
      photos = photosData || []
    }
    
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
        let base64
        
        // Handle both client-provided base64 and database photo URLs
        if (photo.base64) {
          // Client provided base64 (demo/test mode)
          base64 = photo.base64
        } else if (photo.url) {
          // Database photo URL (production mode)
          const response = await fetch(photo.url)
          const arrayBuffer = await response.arrayBuffer()
          base64 = Buffer.from(arrayBuffer).toString('base64')
        } else {
          throw new Error('No photo data available')
        }
        
        // Analyze photo with the construction-optimized AI
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
    
    // Save report to database (skip in demo mode with client photos)
    const rawJson = {
      stage_a: photoAnalyses,
      stage_b: reportData,
      weather,
      photos: photos.map(p => ({ id: p.id, url: p.url })),
      generated_at: new Date().toISOString(),
      model_used: 'gemini-2.0-flash-exp'
    }
    
    let report = null
    if (!clientPhotos) {
      // Only save to database in production mode
      const { data: reportData, error: reportError } = await supabaseAdmin
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
      report = reportData[0]
    }
    
    return NextResponse.json({
      success: true,
      report: report,
      owner_markdown: ownerMd,
      gc_markdown: gcMd,
      debug: {
        photos_analyzed: photos.length,
        weather_included: !!weather,
        model_used: 'gemini-2.0-flash-exp',
        mode: clientPhotos ? 'demo' : 'production'
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

// Project status management functions
async function closeProject(request) {
  try {
    const { project_id } = await getRequestBody(request)
    
    if (!project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // In demo mode, just return success
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true, 
        message: 'Project closed successfully (demo mode)',
        project_id 
      })
    }

    // Update project status in database
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', project_id)
      .select()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Project closed successfully',
      data: data[0]
    })

  } catch (error) {
    console.error('Close project error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function reopenProject(request) {
  try {
    const { project_id, org_id } = await getRequestBody(request)
    
    if (!project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // In demo mode, just return success
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true, 
        message: 'Project reopened successfully (demo mode)',
        project_id 
      })
    }

    // Check subscription limits (count active projects)
    if (org_id) {
      const { data: activeProjects } = await supabaseAdmin
        .from('projects')
        .select('id')
        .eq('org_id', org_id)
        .eq('status', 'active')

      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('plan')
        .eq('id', org_id)
        .single()

      const plan = org?.plan || 'starter'
      const maxProjects = plan === 'starter' ? 2 : plan === 'pro' ? 10 : 25

      if (activeProjects && activeProjects.length >= maxProjects) {
        return NextResponse.json({ 
          error: `You've reached your plan limit of ${maxProjects} active projects. Please upgrade your plan or close other projects.` 
        }, { status: 403 })
      }
    }

    // Update project status in database
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', project_id)
      .select()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Project reopened successfully',
      data: data[0]
    })

  } catch (error) {
    console.error('Reopen project error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function createProject(request) {
  try {
    const body = await getRequestBody(request)
    const { name, city, state, postal_code, org_id, owner_name, owner_email, gc_name, gc_email } = body
    
    if (!name || !org_id) {
      return NextResponse.json({ error: 'Project name and organization ID are required' }, { status: 400 })
    }

    // In demo mode, just return mock data
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true, 
        message: 'Project created successfully (demo mode)',
        data: {
          id: Math.random().toString(36).substring(7),
          name,
          status: 'active',
          created_at: new Date().toISOString()
        }
      })
    }

    // Check subscription limits
    const { data: activeProjects } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('org_id', org_id)
      .eq('status', 'active')

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('plan')
      .eq('id', org_id)
      .single()

    const plan = org?.plan || 'starter'
    const maxProjects = plan === 'starter' ? 2 : plan === 'pro' ? 10 : 25

    if (activeProjects && activeProjects.length >= maxProjects) {
      return NextResponse.json({ 
        error: `You've reached your plan limit of ${maxProjects} active projects. Please upgrade your plan or close some projects.` 
      }, { status: 403 })
    }

    // Create project in database
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        name,
        city,
        state,
        postal_code,
        org_id,
        owner_name,
        owner_email,
        gc_name,
        gc_email,
        status: 'active',
        last_activity_date: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Project created successfully',
      data
    })

  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function getProjectCount(request) {
  try {
    const url = new URL(request.url)
    const org_id = url.searchParams.get('org_id')
    const status = url.searchParams.get('status') || 'active'

    if (!org_id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // In demo mode, return mock counts
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true,
        count: status === 'active' ? 2 : 1,
        status
      })
    }

    const { count, error } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org_id)
      .eq('status', status)

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      count: count || 0,
      status
    })

  } catch (error) {
    console.error('Get project count error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function getProjects(request) {
  try {
    const url = new URL(request.url)
    const org_id = url.searchParams.get('org_id')

    if (!org_id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // In demo mode, return mock projects
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true,
        data: [
          {
            id: '1',
            name: 'Kitchen Remodel - Smith Residence',
            status: 'active',
            city: 'Austin',
            state: 'TX',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Bathroom Renovation - Johnson Home',
            status: 'completed',
            city: 'Dallas',
            state: 'TX',
            created_at: new Date().toISOString()
          }
        ]
      })
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('org_id', org_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function getActiveProjects(request) {
  try {
    const url = new URL(request.url)
    const org_id = url.searchParams.get('org_id')

    if (!org_id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // In demo mode, return mock active projects
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true,
        data: [
          {
            id: '1',
            name: 'Kitchen Remodel - Smith Residence',
            status: 'active',
            city: 'Austin',
            state: 'TX',
            created_at: new Date().toISOString()
          }
        ]
      })
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('org_id', org_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('Get active projects error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function getCompletedProjects(request) {
  try {
    const url = new URL(request.url)
    const org_id = url.searchParams.get('org_id')

    if (!org_id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // In demo mode, return mock completed projects
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true,
        data: [
          {
            id: '2',
            name: 'Bathroom Renovation - Johnson Home',
            status: 'completed',
            city: 'Dallas',
            state: 'TX',
            created_at: new Date().toISOString()
          }
        ]
      })
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('org_id', org_id)
      .in('status', ['completed', 'archived'])
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('Get completed projects error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function getProjectStatus(request, projectId) {
  try {
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // In demo mode, return mock status
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true,
        project_id: projectId,
        status: projectId === '1' ? 'active' : 'completed'
      })
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('id, status, last_activity_date')
      .eq('id', projectId)
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      data
    })

  } catch (error) {
    console.error('Get project status error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function updateProjectActivity(request) {
  try {
    const { project_id } = await getRequestBody(request)
    
    if (!project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // In demo mode, just return success
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true, 
        message: 'Project activity updated (demo mode)',
        project_id 
      })
    }

    // Update last activity date
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ 
        last_activity_date: new Date().toISOString()
      })
      .eq('id', project_id)
      .select()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Project activity updated',
      data: data[0]
    })

  } catch (error) {
    console.error('Update project activity error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function autoCloseProjects(request) {
  try {
    // In demo mode, just return success
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true, 
        message: 'Auto-close projects completed (demo mode)',
        closed_count: 0
      })
    }

    // Find projects inactive for 14+ days
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const { data: inactiveProjects, error: selectError } = await supabaseAdmin
      .from('projects')
      .select('id, name, org_id, owner_email, gc_email')
      .eq('status', 'active')
      .lt('last_activity_date', fourteenDaysAgo.toISOString())

    if (selectError) throw selectError

    if (!inactiveProjects || inactiveProjects.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No projects found for auto-close',
        closed_count: 0
      })
    }

    // Close inactive projects
    const projectIds = inactiveProjects.map(p => p.id)
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .in('id', projectIds)
      .select()

    if (error) throw error

    // Send notification emails (optional)
    for (const project of inactiveProjects) {
      if (project.owner_email && process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'support@siterecap.com',
            to: [project.owner_email],
            subject: `Project "${project.name}" marked as completed due to inactivity`,
            html: `
              <p>Hello,</p>
              <p>Your project "${project.name}" has been marked as completed due to inactivity (no new reports generated for 14 days).</p>
              <p>You can reopen it at any time from your dashboard.</p>
              <p>Best regards,<br>SiteRecap Team</p>
            `
          })
        } catch (emailError) {
          console.error('Email notification error:', emailError)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Auto-closed ${data.length} inactive projects`,
      closed_count: data.length,
      closed_projects: data
    })

  } catch (error) {
    console.error('Auto-close projects error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


// GET /api/debug-urls
async function debugUrls() {
  try {
    const envVars = {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      EMAIL_FROM: process.env.EMAIL_FROM,
      NODE_ENV: process.env.NODE_ENV
    }
    
    return NextResponse.json({
      success: true,
      environment_variables: envVars,
      timestamp: new Date().toISOString(),
      message: "URL configuration debug information"
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
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
        case '/debug-urls':
      return debugUrls()
    case '/gemini-health':
      return geminiHealth()
    case '/project-count':
      return getProjectCount(request)
    case '/projects':
      return getProjects(request)
    case '/projects/active':
      return getActiveProjects(request)
    case '/projects/completed':
      return getCompletedProjects(request)
    default:
      // Check if it's a project status request
      if (path.startsWith('/project-status/')) {
        const projectId = path.split('/')[2]
        return getProjectStatus(request, projectId)
      }
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
    case '/export-pdf':
      return exportPDF(request)
    case '/close-project':
      return closeProject(request)
    case '/reopen-project':
      return reopenProject(request)
    case '/create-project':
      return createProject(request)
    case '/update-project-activity':
      return updateProjectActivity(request)
    case '/auto-close-projects':
      return autoCloseProjects(request)
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