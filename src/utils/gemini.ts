const KEY = import.meta.env.VITE_GEMINI_API_KEY
const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY

async function callGemini(prompt: string, imagePart?: { data: string; mimeType: string }): Promise<string> {
  if (!KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY in .env')
  }

  const parts: object[] = imagePart ? [{ inlineData: imagePart }, { text: prompt }] : [{ text: prompt }]

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash']
  let lastError = 'Unknown Gemini error'

  for (const model of models) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
        }),
      }
    )

    if (res.ok) {
      const d = await res.json()
      return d.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.'
    }

    lastError = `Gemini ${res.status} on ${model}`
    if (res.status !== 404) {
      const errText = await res.text()
      throw new Error(`${lastError}: ${errText || 'Request failed'}`)
    }
  }

  throw new Error(`${lastError}: none of the configured Gemini models are available for this key`)
}

// ── General health AI chat ──
export const askGemini = (prompt: string) =>
  callGemini(
    `You are MedNexus AI, an advanced medical assistant. Be empathetic, structured, and always recommend professional consultation for serious issues.\n\nUser: ${prompt}`
  )

// ── File / image analysis ──
export const analyzeImageWithGemini = (base64: string, mimeType: string, fileName: string) =>
  callGemini(
    `You are a medical AI specialist. Analyze this clinical file "${fileName}". Provide:
1. Key findings with clinical significance
2. Medical insights and interpretation
3. Risk flags or urgent concerns
4. Recommendations and next steps
5. Confidence score (0-100%)
Format with clear sections and bullet points.`,
    { data: base64, mimeType }
  )

// ── Prescription OCR ──
export const analyzePrescriptionImage = (base64: string, mimeType: string) =>
  callGemini(
    `You are a medical OCR specialist and clinical pharmacist. Read this handwritten prescription image carefully.
Even if the handwriting is very messy or faded, use medical context to decode it.

Extract and return a structured JSON (no markdown, just raw JSON):
{
  "doctor": "doctor name if visible",
  "date": "date if visible",
  "drugs": [
    {
      "name": "full drug name",
      "dose": "dosage",
      "frequency": "e.g. twice daily",
      "duration": "e.g. 5 days",
      "instructions": "e.g. after food",
      "warnings": ["warning1", "warning2"],
      "severity": "low|medium|high"
    }
  ],
  "diagnosis": "diagnosis if mentioned",
  "confidence": 85,
  "flags": ["any safety flags or unclear items"]
}`,
    { data: base64, mimeType }
  )

// ── Computer vision disease detection ──
export const detectDiseaseFromImage = (base64: string, mimeType: string, category: string) =>
  callGemini(
    `You are a medical computer vision AI combining YOLOv8 + OpenCV + clinical expertise.
Analyze this ${category} image.

Return structured JSON (no markdown):
{
  "detections": [
    {
      "condition": "condition name",
      "icd10": "ICD-10 code",
      "confidence": 88,
      "severity": 65,
      "location": "body area",
      "bbox_percent": [x1,y1,x2,y2],
      "details": "clinical description",
      "action": "immediate action",
      "referral": "specialist needed",
      "differentials": ["diff1","diff2","diff3"]
    }
  ],
  "overall_risk": "low|medium|high|critical",
  "urgent": false,
  "summary": "one line summary"
}`,
    { data: base64, mimeType }
  )

// ── Drug interactions ──
export const checkDrugInteractions = (drugs: string[]) =>
  callGemini(
    `You are a clinical pharmacologist. Check interactions for: ${drugs.join(', ')}.
For each pair: severity (low/moderate/high/contraindicated), mechanism, clinical management.
Format as structured clinical report with clear sections.`
  )

// ── Genomic analysis ──
export const analyzeGenomicRisk = (variants: string[]) =>
  callGemini(
    `You are a clinical geneticist. Analyze variants: ${variants.join(', ')}.
Provide: disease risk percentages, pharmacogenomic drug alerts, screening recommendations.
Reference OMIM, ClinVar, PharmGKB. Be evidence-based.`
  )

// ── Claude timeline analysis ──
export const analyzeHealthJourneyWithClaude = async (prompt: string): Promise<string> => {
  if (!CLAUDE_KEY) {
    throw new Error('Missing VITE_CLAUDE_API_KEY in .env')
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 700,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    throw new Error(`Claude ${res.status}: Check VITE_CLAUDE_API_KEY in .env`)
  }

  const data = await res.json()
  const first = data.content?.[0]
  return typeof first?.text === 'string' && first.text.trim() ? first.text : 'No response.'
}