import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Stage A: Per-photo analysis using vision model
export async function analyzePhoto(imageBytes, photoIndex = 0) {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' })
    
    const prompt = `Analyze this construction site photo and return ONLY valid JSON in this exact format:
{
  "space": "Kitchen|Bathroom|Bedroom|Living|Exterior|Garage|Hall|Dining|Stair|Basement|''",
  "phase": "Demo|Framing|Electrical Rough|Plumbing Rough|Drywall|Paint|Flooring|Cabinets|Finish|Punch|''",
  "caption": "one-sentence literal description of what you see",
  "objects": ["list", "of", "visible", "objects"],
  "tasks": [{"name":"specific task observed","confidence":0.85}],
  "hazards": [{"type":"hazard type","severity":"low|med|high"}],
  "personnel_count": 0,
  "equipment": [{"name":"tool or machine name","category":"hand_tool|power_tool|heavy_machinery|vehicle"}],
  "materials": [{"name":"material type","status":"delivered|in_use|stored","quantity":"visible amount"}],
  "deliveries": [{"type":"delivery truck|material delivery|equipment delivery","status":"active|completed"}],
  "safety_issues": [{"issue":"specific safety concern","severity":"low|med|high","ppe_compliance":"good|poor|unknown"}],
  "delaying_events": [{"event":"weather|missing_materials|equipment_failure|access_blocked","impact":"low|med|high"}]
}

Rules:
- Be literal, no assumptions
- Prefer Kitchen/Bath if cabinets/fixtures/tile visible
- Tasks must be concrete construction work observed
- If no construction work visible, use empty tasks array
- Selfies/non-construction photos should have space="" and tasks=[]
- Return only JSON, no other text`

    const imagePart = {
      inlineData: {
        data: imageBytes,
        mimeType: 'image/jpeg'
      }
    }

    const result = await model.generateContent([prompt, imagePart])
    const response = result.response.text()
    
    // Parse and validate JSON
    const analysis = JSON.parse(response.trim())
    
    // Add photo index for tracking
    analysis.photoIndex = photoIndex
    
    return analysis
  } catch (error) {
    console.error(`Gemini analysis failed for photo ${photoIndex}:`, error)
    
    // TODO: Add OpenAI fallback here
    return {
      photoIndex,
      space: '',
      phase: '',
      caption: 'Analysis temporarily unavailable',
      objects: [],
      tasks: [],
      hazards: [],
      error: true
    }
  }
}

// Stage B: Aggregate multiple photo analyses into final report
export async function generateReport(photoAnalyses, projectName, date) {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' })
    
    const prompt = `Analyze these construction photo analyses and create a daily report summary. Return ONLY valid JSON:

Photo Analyses:
${JSON.stringify(photoAnalyses, null, 2)}

Return this exact JSON format:
{
  "site_summary": "Brief summary of work observed across all photos",
  "sections": [
    {
      "space": "Kitchen",
      "phase": "Cabinets", 
      "tasks": [{"name":"install base cabinets","confidence":0.82,"photos":[1,3]}],
      "hazards": [{"type":"debris pile","severity":"low","photo":2}]
    }
  ],
  "personnel_summary": {"total_count":3,"notes":"Average crew size observed"},
  "equipment_summary": [{"name":"circular saw","category":"power_tool","photos":[1,2]},{"name":"ladder","category":"hand_tool","photos":[3]}],
  "materials_summary": [{"name":"lumber","status":"delivered","photos":[1]},{"name":"screws","status":"in_use","photos":[2,3]}],
  "deliveries_summary": [{"type":"material delivery","status":"completed","time":"morning","photos":[1]}],
  "safety_summary": {"issues":[{"issue":"proper PPE worn","severity":"low","photos":[1,2]}],"compliance":"good"},
  "delays_summary": [{"event":"weather delay","impact":"low","duration":"1 hour"}],
  "changes_since_yesterday": [],
  "next_day_plan": ["Continue cabinet installation in Kitchen"]
}

Rules:
- Merge identical tasks across photos, combine photo indices
- Boost confidence slightly when multiple photos show same task
- Group by space then phase
- If no valid tasks found, create one section with "Unspecified" space and "Progress documented" task
- Be specific and construction-focused`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const reportData = JSON.parse(response.trim())
    
    // Ensure we always have at least one section
    if (!reportData.sections || reportData.sections.length === 0) {
      reportData.sections = [{
        space: 'Unspecified',
        phase: '',
        tasks: [{ name: 'Progress documented', confidence: 0.5, photos: [] }],
        hazards: []
      }]
    }
    
    return reportData
  } catch (error) {
    console.error('Report generation failed:', error)
    
    // Return fallback structure
    return {
      site_summary: 'Daily progress documented',
      sections: [{
        space: 'Unspecified',
        phase: '',
        tasks: [{ name: 'Progress documented', confidence: 0.5, photos: [] }],
        hazards: []
      }],
      changes_since_yesterday: [],
      next_day_plan: ['Continue work as planned'],
      error: true
    }
  }
}

// Generate markdown for Owner report
export function generateOwnerMarkdown(reportData, weather = null, projectName = '', date = '') {
  const weatherBadge = weather ? `🌤️ ${weather.temperature}°F ${weather.description}` : '—'
  
  let markdown = `# Daily Update - ${projectName}\n**${date}** • ${weatherBadge}\n\n`
  
  // Site summary
  if (reportData.site_summary) {
    markdown += `## Today's Progress\n${reportData.site_summary}\n\n`
  }
  
  // Key tasks (max 6 bullets)
  const allTasks = reportData.sections.flatMap(s => s.tasks).slice(0, 6)
  if (allTasks.length > 0) {
    markdown += `## Work Completed\n`
    allTasks.forEach(task => {
      const confidence = Math.round(task.confidence * 100)
      markdown += `• ${task.name} (${confidence}%)\n`
    })
    markdown += '\n'
  }
  
  // Crew summary
  if (reportData.personnel_summary?.total_count > 0) {
    markdown += `## Crew on Site\n`
    markdown += `• ${reportData.personnel_summary.total_count} workers present\n\n`
  }
  
  // Materials & deliveries
  if (reportData.deliveries_summary?.length > 0) {
    markdown += `## Deliveries\n`
    reportData.deliveries_summary.forEach(delivery => {
      markdown += `• ${delivery.type} - ${delivery.status}\n`
    })
    markdown += '\n'
  }
  
  // Safety summary
  if (reportData.safety_summary?.compliance) {
    markdown += `## Safety\n`
    markdown += `• Site safety compliance: ${reportData.safety_summary.compliance}\n\n`
  }
  
  // What's next
  if (reportData.next_day_plan?.length > 0) {
    markdown += `## What's Next\n`
    reportData.next_day_plan.forEach(item => {
      markdown += `• ${item}\n`
    })
  }
  
  return markdown
}

// Generate markdown for GC report  
export function generateGCMarkdown(reportData, weather = null, projectName = '', date = '') {
  const weatherBadge = weather ? `🌤️ ${weather.temperature}°F ${weather.description}` : '—'
  
  let markdown = `# GC Daily Report - ${projectName}\n**${date}** • ${weatherBadge}\n\n`
  
  // Personnel summary
  if (reportData.personnel_summary?.total_count > 0) {
    markdown += `## Manpower\n`
    markdown += `• Total crew: ${reportData.personnel_summary.total_count} workers\n`
    if (reportData.personnel_summary.notes) {
      markdown += `• Notes: ${reportData.personnel_summary.notes}\n`
    }
    markdown += '\n'
  }
  
  // Equipment summary
  if (reportData.equipment_summary?.length > 0) {
    markdown += `## Equipment on Site\n`
    reportData.equipment_summary.forEach(equipment => {
      const photos = equipment.photos?.length > 0 ? ` (Photos: ${equipment.photos.join(', ')})` : ''
      markdown += `• ${equipment.name} - ${equipment.category}${photos}\n`
    })
    markdown += '\n'
  }
  
  // Materials summary
  if (reportData.materials_summary?.length > 0) {
    markdown += `## Materials\n`
    reportData.materials_summary.forEach(material => {
      const photos = material.photos?.length > 0 ? ` (Photos: ${material.photos.join(', ')})` : ''
      markdown += `• ${material.name} - ${material.status}${photos}\n`
    })
    markdown += '\n'
  }
  
  // Deliveries
  if (reportData.deliveries_summary?.length > 0) {
    markdown += `## Deliveries\n`
    reportData.deliveries_summary.forEach(delivery => {
      const photos = delivery.photos?.length > 0 ? ` (Photos: ${delivery.photos.join(', ')})` : ''
      markdown += `• ${delivery.type} - ${delivery.status} (${delivery.time})${photos}\n`
    })
    markdown += '\n'
  }
  
  // Structured by space and phase
  reportData.sections?.forEach(section => {
    const spacePhase = section.space + (section.phase ? ` - ${section.phase}` : '')
    markdown += `## ${spacePhase}\n`
    
    if (section.tasks?.length > 0) {
      markdown += `### Tasks Completed\n`
      section.tasks.forEach(task => {
        const confidence = Math.round(task.confidence * 100)
        const photos = task.photos?.length > 0 ? ` (Photos: ${task.photos.join(', ')})` : ''
        markdown += `• ${task.name} - ${confidence}%${photos}\n`
      })
      markdown += '\n'
    }
    
    if (section.hazards?.length > 0) {
      markdown += `### Safety Notes\n`
      section.hazards.forEach(hazard => {
        markdown += `• ${hazard.type} - ${hazard.severity.toUpperCase()}\n`
      })
      markdown += '\n'
    }
  })
  
  // Safety summary
  if (reportData.safety_summary?.issues?.length > 0) {
    markdown += `## Safety Summary\n`
    markdown += `• Overall compliance: ${reportData.safety_summary.compliance}\n`
    reportData.safety_summary.issues.forEach(issue => {
      const photos = issue.photos?.length > 0 ? ` (Photos: ${issue.photos.join(', ')})` : ''
      markdown += `• ${issue.issue} - ${issue.severity.toUpperCase()}${photos}\n`
    })
    markdown += '\n'
  }
  
  // Delays
  if (reportData.delays_summary?.length > 0) {
    markdown += `## Delays & Issues\n`
    reportData.delays_summary.forEach(delay => {
      markdown += `• ${delay.event} - ${delay.impact} impact (${delay.duration})\n`
    })
    markdown += '\n'
  }
  
  // Tomorrow's plan
  if (reportData.next_day_plan?.length > 0) {
    markdown += `## Tomorrow's Plan\n`
    reportData.next_day_plan.forEach(item => {
      markdown += `• ${item}\n`
    })
  }
  
  return markdown
}