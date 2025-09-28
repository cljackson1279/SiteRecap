import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Stage A: Per-photo analysis using vision model
export async function analyzePhoto(imageBytes, photoIndex = 0) {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' })
    
    const prompt = `You are an expert construction site analyst and daily report writer with 20+ years of experience in residential and commercial construction projects. Your role is to analyze construction site photos and generate professional, detailed analysis.

ANALYSIS FRAMEWORK:
1. First, carefully examine the image and identify:
   - Construction materials present (type, quantity, condition)
   - Work activities in progress or completed
   - Personnel and equipment visible
   - Safety conditions and potential hazards
   - Weather impact on work (if visible)

2. Then, assess the construction phase and progress:
   - What trade work is being performed?
   - What percentage of this specific task appears complete?
   - Are there any quality issues or concerns visible?
   - What are the next logical steps in this process?

3. Generate analysis using professional construction terminology and specific details.

Return ONLY valid JSON in this exact format:
{
  "space": "Kitchen|Bathroom|Bedroom|Living|Exterior|Garage|Hall|Dining|Stair|Basement|''",
  "phase": "Demo|Framing|Electrical Rough|Plumbing Rough|Drywall|Paint|Flooring|Cabinets|Finish|Punch|''",
  "caption": "Professional construction description using proper terminology",
  "objects": ["specific construction materials and tools visible"],
  "tasks": [{"name":"specific construction task with trade details","confidence":0.85,"progress_percentage":75,"quality_notes":"any quality observations"}],
  "hazards": [{"type":"specific hazard type","severity":"low|med|high","description":"detailed safety concern"}],
  "personnel_count": 0,
  "equipment": [{"name":"specific tool/machine name","category":"hand_tool|power_tool|heavy_machinery|vehicle","condition":"good|fair|poor|unknown"}],
  "materials": [{"name":"specific material type and specs","status":"delivered|in_use|stored|waste","quantity":"measured or estimated amount","condition":"new|used|damaged"}],
  "deliveries": [{"type":"delivery truck|material delivery|equipment delivery","status":"active|completed","contents":"what was delivered"}],
  "safety_issues": [{"issue":"specific OSHA-related safety concern","severity":"low|med|high","ppe_compliance":"compliant|non-compliant|partial","recommendation":"corrective action needed"}],
  "delaying_events": [{"event":"weather|missing_materials|equipment_failure|access_blocked|inspection_required","impact":"low|med|high","estimated_delay":"time estimate"}],
  "trade_work": [{"trade":"specific trade (electrical, plumbing, etc)","work_description":"detailed work being performed","completion_estimate":"percentage complete"}],
  "next_steps": ["immediate next construction activities needed"],
  "confidence_score": 8.5,
  "confidence_notes": "explanation of what affects confidence level"
}

Rules:
- Use professional construction industry language
- Be specific with measurements, quantities, and percentages when observable
- Include trade-specific terminology and processes
- Assess work quality and progress professionally
- If confidence is below 7, explain what additional information would help
- For non-construction photos, use space="" and minimal data
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
    
    const prompt = `You are an expert construction site analyst and daily report writer with 20+ years of experience. Analyze these construction photo analyses and create a comprehensive daily report summary using professional construction terminology.

CONSTRUCTION EXPERTISE ANALYSIS:
Review each photo analysis for:
- Trade work progression and completion percentages
- Material quantities and specifications
- Safety compliance and OSHA considerations
- Quality control observations
- Scheduling impacts and next steps
- Equipment productivity and maintenance needs

Photo Analyses:
${JSON.stringify(photoAnalyses, null, 2)}

Generate a professional construction daily report in this exact JSON format:
{
  "site_summary": "Professional executive summary of overall site progress and key activities",
  "sections": [
    {
      "space": "Kitchen",
      "phase": "Cabinets", 
      "tasks": [{"name":"Install base cabinet units - 12 linear feet","confidence":0.82,"progress_percentage":75,"quality_notes":"Level and square, awaiting countertop template","photos":[1,3]}],
      "hazards": [{"type":"Material debris accumulation","severity":"low","osha_concern":"Slip hazard","corrective_action":"Daily cleanup required","photo":2}],
      "trade_activities": [{"trade":"Carpentry","work_performed":"Cabinet installation and alignment","crew_size":2,"hours_logged":8}],
      "materials_used": [{"material":"Kitchen cabinets - oak veneer","quantity":"12 units","waste_generated":"minimal cutoffs","storage_location":"garage"}],
      "next_phase_requirements": ["Electrical rough-in inspection","Plumbing final connections","Countertop template"]
    }
  ],
  "personnel_summary": {"total_count":3,"trades_present":["Carpentry","Electrical"],"safety_compliance":"Full PPE observed","productivity_notes":"Crew working efficiently"},
  "equipment_summary": [{"name":"Dewalt circular saw DWE575SB","category":"power_tool","condition":"good","maintenance_due":"next week","photos":[1,2]},{"name":"8ft step ladder","category":"equipment","usage":"cabinet installation","photos":[3]}],
  "materials_summary": [{"name":"2x4 pressure treated lumber","specs":"Grade 2, kiln dried","quantity":"250 linear feet","status":"delivered","storage":"covered area","photos":[1]},{"name":"3.5\" wood screws","quantity":"5 lbs","status":"in_use","consumption_rate":"normal","photos":[2,3]}],
  "deliveries_summary": [{"type":"Material delivery - lumber package","vendor":"ABC Supply","status":"completed","delivery_time":"8:00 AM","inspection_notes":"All items accounted for, good condition","photos":[1]}],
  "safety_summary": {"osha_compliance":"Full compliance observed","ppe_usage":"Hard hats, safety glasses, work boots worn","incidents":"None reported","concerns":[{"issue":"Extension cord management","severity":"low","recommendation":"Use cord protectors in walkways","photos":[1,2]}]},
  "quality_control": [{"item":"Cabinet alignment","standard":"±1/8 inch level and plumb","actual":"Within tolerance","inspector":"Lead carpenter","photos":[2,3]}],
  "delays_summary": [{"event":"Weather delay - rain","impact":"medium","duration":"2 hours morning","work_affected":"Exterior framing","recovery_plan":"Extended evening hours"}],
  "budget_impact": {"labor_hours":24,"overtime_hours":0,"material_waste":"minimal","cost_impacts":"On budget"},
  "changes_since_yesterday": ["Electrical rough-in completed in kitchen","Plumbing stub-outs inspected and approved","Kitchen cabinets delivered"],
  "next_day_plan": ["Complete kitchen cabinet installation","Begin cabinet door installation","Schedule countertop template","Coordinate electrical fixture rough-in"],
  "inspector_notes": "All work meeting specifications. Ready for next phase.",
  "weather_impact": "Clear conditions, no delays expected",
  "overall_progress": "Project 65% complete, on schedule for substantial completion"
}

PROFESSIONAL REQUIREMENTS:
- Use specific construction terminology and trade language
- Include quantifiable measurements and percentages
- Reference industry standards and codes where applicable
- Provide actionable next steps and recommendations
- Assess work quality against professional standards
- Include OSHA safety considerations
- Track material usage and waste management
- Note any deviations from plans or specifications

Rules:
- Consolidate identical tasks across photos with combined indices
- Increase confidence when multiple photos confirm same observation
- Group sections by space, then by construction phase
- Use professional estimating language (linear feet, square footage, etc.)
- Include trade-specific details and proper construction sequences
- If minimal construction activity, focus on site preparation and safety
- Always provide actionable next-day planning`

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

// Generate markdown for Owner report (clean and easy to read)
export function generateOwnerMarkdown(reportData, weather = null, projectName = '', date = '') {
  const weatherBadge = weather ? `🌤️ ${weather.temperature}°F ${weather.description}` : '—'
  
  let markdown = `# Daily Update - ${projectName}\n**${date}** • ${weatherBadge}\n\n`
  
  // Site summary
  if (reportData.site_summary) {
    markdown += `## Today's Progress\n${reportData.site_summary}\n\n`
  }
  
  // Key tasks (simplified for owners - max 6 bullets)
  const allTasks = reportData.sections.flatMap(s => s.tasks).slice(0, 6)
  if (allTasks.length > 0) {
    markdown += `## Work Completed\n`
    allTasks.forEach(task => {
      // Simplify task descriptions for owner readability
      const simplifiedTask = task.name.replace(/\b\d+(\.\d+)?\s*(linear\s+feet|sq\s+ft|square\s+feet|lf|sf)\b/gi, '')
                                      .replace(/\s+-\s+.*$/g, '') // Remove technical specs after dash
                                      .trim()
      const progress = task.progress_percentage ? ` (${task.progress_percentage}% complete)` : ''
      markdown += `• ${simplifiedTask}${progress}\n`
    })
    markdown += '\n'
  }
  
  // Crew summary
  if (reportData.personnel_summary?.total_count > 0) {
    markdown += `## Crew on Site\n`
    const tradeInfo = reportData.personnel_summary.trades_present ? 
      ` - ${reportData.personnel_summary.trades_present.join(', ')}` : ''
    markdown += `• ${reportData.personnel_summary.total_count} workers present${tradeInfo}\n\n`
  }
  
  // Materials & deliveries (simplified)
  if (reportData.deliveries_summary?.length > 0) {
    markdown += `## Deliveries\n`
    reportData.deliveries_summary.forEach(delivery => {
      const simplifiedDelivery = delivery.type.replace(/\s+-.*$/g, '').replace(/Material delivery/i, 'Materials')
      markdown += `• ${simplifiedDelivery} - ${delivery.status}\n`
    })
    markdown += '\n'
  }
  
  // Safety summary (simplified for owners)
  if (reportData.safety_summary?.osha_compliance || reportData.safety_summary?.compliance) {
    markdown += `## Safety\n`
    const compliance = reportData.safety_summary.osha_compliance || reportData.safety_summary.compliance
    markdown += `• Site safety: ${compliance === 'Full compliance observed' ? 'Excellent' : compliance}\n\n`
  }
  
  // What's next (simplified language)
  if (reportData.next_day_plan?.length > 0) {
    markdown += `## What's Next\n`
    reportData.next_day_plan.slice(0, 4).forEach(item => {
      // Simplify technical language for owners
      const simplifiedPlan = item.replace(/rough-in/gi, 'preparation')
                                  .replace(/stub-outs/gi, 'connections')
                                  .replace(/coordinate/gi, 'schedule')
      markdown += `• ${simplifiedPlan}\n`
    })
  }
  
  return markdown
}

// Generate detailed professional markdown for GC report with construction expertise
export function generateGCMarkdown(reportData, weather = null, projectName = '', date = '') {
  const weatherBadge = weather ? `🌤️ ${weather.temperature}°F ${weather.description}` : '—'
  
  let markdown = `# GC Daily Report - ${projectName}\n**Date:** ${date} | **Weather:** ${weatherBadge}\n\n`
  
  // Executive Summary
  if (reportData.site_summary) {
    markdown += `## Executive Summary\n${reportData.site_summary}\n\n`
  }
  
  // Overall Progress Tracking
  if (reportData.overall_progress) {
    markdown += `## Project Status\n• ${reportData.overall_progress}\n\n`
  }
  
  // Personnel & Productivity
  if (reportData.personnel_summary?.total_count > 0) {
    markdown += `## Manpower & Productivity\n`
    markdown += `• **Total Crew:** ${reportData.personnel_summary.total_count} workers\n`
    
    if (reportData.personnel_summary.trades_present?.length > 0) {
      markdown += `• **Trades on Site:** ${reportData.personnel_summary.trades_present.join(', ')}\n`
    }
    
    if (reportData.personnel_summary.safety_compliance) {
      markdown += `• **Safety Compliance:** ${reportData.personnel_summary.safety_compliance}\n`
    }
    
    if (reportData.personnel_summary.productivity_notes) {
      markdown += `• **Productivity:** ${reportData.personnel_summary.productivity_notes}\n`
    }
    
    // Labor hours tracking
    if (reportData.budget_impact?.labor_hours) {
      markdown += `• **Labor Hours:** ${reportData.budget_impact.labor_hours} hrs`
      if (reportData.budget_impact.overtime_hours > 0) {
        markdown += ` (${reportdata.budget_impact.overtime_hours} OT hrs)`
      }
      markdown += '\n'
    }
    markdown += '\n'
  }
  
  // Equipment & Tools
  if (reportData.equipment_summary?.length > 0) {
    markdown += `## Equipment & Tools\n`
    reportData.equipment_summary.forEach(equipment => {
      const photos = equipment.photos?.length > 0 ? ` (Photos: ${equipment.photos.join(', ')})` : ''
      const condition = equipment.condition ? ` - Condition: ${equipment.condition}` : ''
      const maintenance = equipment.maintenance_due ? ` - Maintenance: ${equipment.maintenance_due}` : ''
      markdown += `• **${equipment.name}** (${equipment.category})${condition}${maintenance}${photos}\n`
    })
    markdown += '\n'
  }
  
  // Materials Management
  if (reportData.materials_summary?.length > 0) {
    markdown += `## Materials Management\n`
    reportData.materials_summary.forEach(material => {
      const photos = material.photos?.length > 0 ? ` (Photos: ${material.photos.join(', ')})` : ''
      const specs = material.specs ? ` - ${material.specs}` : ''
      const quantity = material.quantity ? ` - Qty: ${material.quantity}` : ''
      const storage = material.storage ? ` - Storage: ${material.storage}` : ''
      const condition = material.condition ? ` - Condition: ${material.condition}` : ''
      markdown += `• **${material.name}**${specs}${quantity} - Status: ${material.status}${storage}${condition}${photos}\n`
    })
    markdown += '\n'
  }
  
  // Deliveries & Logistics
  if (reportData.deliveries_summary?.length > 0) {
    markdown += `## Deliveries & Logistics\n`
    reportData.deliveries_summary.forEach(delivery => {
      const photos = delivery.photos?.length > 0 ? ` (Photos: ${delivery.photos.join(', ')})` : ''
      const vendor = delivery.vendor ? ` - Vendor: ${delivery.vendor}` : ''
      const time = delivery.delivery_time || delivery.time ? ` - Time: ${delivery.delivery_time || delivery.time}` : ''
      const contents = delivery.contents ? ` - Contents: ${delivery.contents}` : ''
      const inspection = delivery.inspection_notes ? ` - Inspection: ${delivery.inspection_notes}` : ''
      markdown += `• **${delivery.type}** - ${delivery.status}${vendor}${time}${contents}${inspection}${photos}\n`
    })
    markdown += '\n'
  }
  
  // Detailed Work Breakdown by Area & Trade
  reportData.sections?.forEach(section => {
    const spacePhase = section.space + (section.phase ? ` - ${section.phase}` : '')
    markdown += `## ${spacePhase}\n`
    
    // Trade activities in this section
    if (section.trade_activities?.length > 0) {
      markdown += `### Trade Activities\n`
      section.trade_activities.forEach(trade => {
        markdown += `• **${trade.trade}:** ${trade.work_performed}\n`
        if (trade.crew_size) markdown += `  - Crew Size: ${trade.crew_size} workers\n`
        if (trade.hours_logged) markdown += `  - Hours: ${trade.hours_logged} hrs\n`
      })
      markdown += '\n'
    }
    
    // Tasks with detailed progress
    if (section.tasks?.length > 0) {
      markdown += `### Work Completed\n`
      section.tasks.forEach(task => {
        const confidence = Math.round(task.confidence * 100)
        const progress = task.progress_percentage ? ` (${task.progress_percentage}% complete)` : ''
        const photos = task.photos?.length > 0 ? ` (Photos: ${task.photos.join(', ')})` : ''
        const quality = task.quality_notes ? `\n  - Quality: ${task.quality_notes}` : ''
        markdown += `• **${task.name}** - Confidence: ${confidence}%${progress}${photos}${quality}\n`
      })
      markdown += '\n'
    }
    
    // Materials used in this section
    if (section.materials_used?.length > 0) {
      markdown += `### Materials Used\n`
      section.materials_used.forEach(material => {
        const waste = material.waste_generated ? ` - Waste: ${material.waste_generated}` : ''
        const storage = material.storage_location ? ` - Storage: ${material.storage_location}` : ''
        markdown += `• **${material.material}** - Qty: ${material.quantity}${waste}${storage}\n`
      })
      markdown += '\n'
    }
    
    // Safety observations specific to this area
    if (section.hazards?.length > 0) {
      markdown += `### Safety Observations\n`
      section.hazards.forEach(hazard => {
        const action = hazard.corrective_action ? ` - Action: ${hazard.corrective_action}` : ''
        const osha = hazard.osha_concern ? ` (OSHA: ${hazard.osha_concern})` : ''
        markdown += `• **${hazard.type}** - ${hazard.severity.toUpperCase()}${osha}${action}\n`
      })
      markdown += '\n'
    }
    
    // Next phase requirements
    if (section.next_phase_requirements?.length > 0) {
      markdown += `### Next Phase Requirements\n`
      section.next_phase_requirements.forEach(req => {
        markdown += `• ${req}\n`
      })
      markdown += '\n'
    }
  })
  
  // Quality Control & Inspections
  if (reportData.quality_control?.length > 0) {
    markdown += `## Quality Control & Inspections\n`
    reportData.quality_control.forEach(qc => {
      const photos = qc.photos?.length > 0 ? ` (Photos: ${qc.photos.join(', ')})` : ''
      markdown += `• **${qc.item}:** Standard: ${qc.standard} | Actual: ${qc.actual} | Inspector: ${qc.inspector}${photos}\n`
    })
    markdown += '\n'
  }
  
  // OSHA Safety & Compliance
  if (reportData.safety_summary?.osha_compliance || reportData.safety_summary?.concerns?.length > 0) {
    markdown += `## OSHA Safety & Compliance\n`
    if (reportData.safety_summary.osha_compliance) {
      markdown += `• **Overall Compliance:** ${reportData.safety_summary.osha_compliance}\n`
    }
    if (reportData.safety_summary.ppe_usage) {
      markdown += `• **PPE Usage:** ${reportData.safety_summary.ppe_usage}\n`
    }
    if (reportData.safety_summary.incidents) {
      markdown += `• **Incidents:** ${reportData.safety_summary.incidents}\n`
    }
    if (reportData.safety_summary.concerns?.length > 0) {
      markdown += `### Safety Concerns\n`
      reportData.safety_summary.concerns.forEach(concern => {
        const photos = concern.photos?.length > 0 ? ` (Photos: ${concern.photos.join(', ')})` : ''
        markdown += `• **${concern.issue}** - ${concern.severity.toUpperCase()} - Recommendation: ${concern.recommendation}${photos}\n`
      })
    }
    markdown += '\n'
  }
  
  // Budget & Cost Impact
  if (reportData.budget_impact) {
    markdown += `## Budget & Cost Impact\n`
    if (reportData.budget_impact.labor_hours) {
      markdown += `• **Labor Hours:** ${reportData.budget_impact.labor_hours} hrs`
      if (reportData.budget_impact.overtime_hours > 0) {
        markdown += ` (${reportData.budget_impact.overtime_hours} OT hrs)`
      }
      markdown += '\n'
    }
    if (reportData.budget_impact.material_waste) {
      markdown += `• **Material Waste:** ${reportData.budget_impact.material_waste}\n`
    }
    if (reportData.budget_impact.cost_impacts) {
      markdown += `• **Cost Status:** ${reportData.budget_impact.cost_impacts}\n`
    }
    markdown += '\n'
  }
  
  // Delays & Schedule Impact
  if (reportData.delays_summary?.length > 0) {
    markdown += `## Delays & Schedule Impact\n`
    reportData.delays_summary.forEach(delay => {
      const estimated = delay.estimated_delay ? ` - Est. Delay: ${delay.estimated_delay}` : ''
      const recovery = delay.recovery_plan ? ` - Recovery: ${delay.recovery_plan}` : ''
      const work = delay.work_affected ? ` - Affected Work: ${delay.work_affected}` : ''
      markdown += `• **${delay.event}** - ${delay.impact.toUpperCase()} impact${estimated}${work}${recovery}\n`
    })
    markdown += '\n'
  }
  
  // Weather Impact
  if (reportData.weather_impact) {
    markdown += `## Weather Impact\n• ${reportData.weather_impact}\n\n`
  }
  
  // Changes Since Yesterday
  if (reportData.changes_since_yesterday?.length > 0) {
    markdown += `## Changes Since Yesterday\n`
    reportData.changes_since_yesterday.forEach(change => {
      markdown += `• ${change}\n`
    })
    markdown += '\n'
  }
  
  // Tomorrow's Work Plan
  if (reportData.next_day_plan?.length > 0) {
    markdown += `## Tomorrow's Work Plan\n`
    reportData.next_day_plan.forEach(item => {
      markdown += `• ${item}\n`
    })
    markdown += '\n'
  }
  
  // Inspector Notes
  if (reportData.inspector_notes) {
    markdown += `## Inspector Notes\n${reportData.inspector_notes}\n\n`
  }
  
  return markdown
}