import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { analyzePhoto, generateReport, generateOwnerMarkdown, generateGCMarkdown } from '@/lib/ai-pipeline'
import { getCurrentWeather, geocodeLocation } from '@/lib/weather'

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

// GET /api/gemini-health
async function geminiHealth() {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Simple test
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-002' })
    const result = await model.generateContent('Hello')
    const response = result.response.text()
    
    return NextResponse.json({
      status: 'healthy',
      model: 'gemini-1.5-pro-002',
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