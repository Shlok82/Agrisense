const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

const ADVISORY_FALLBACK = [
  {
    id: 1,
    icon: '🌿',
    severity: 'Info',
    title: 'Monitor crop regularly',
    advice:
      'Inspect your crop every morning for early signs of pest or disease. Early detection saves cost.',
    category: 'General',
  },
  {
    id: 2,
    icon: '💧',
    severity: 'Info',
    title: 'Check soil moisture',
    advice:
      'Feel the topsoil before irrigating. Water only when top 2 inches feel dry to avoid overwatering.',
    category: 'Irrigation',
  },
  {
    id: 3,
    icon: '☀️',
    severity: 'Info',
    title: 'Weather looks stable',
    advice: 'No extreme weather expected. Good time to apply scheduled fertilizer doses.',
    category: 'Weather',
  },
]

// ── Text-only call (advisory, irrigation tips, cost suggestions) ──
export async function askGemini(prompt, systemContext = '') {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: `${systemContext}\n\n${prompt}` }],
        },
      ],
    }),
  })
  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

// ── Image + text call (pest detection) ──
export async function analyseLeafImage(base64Image, mimeType = 'image/jpeg') {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are an expert agricultural pathologist. Analyse this crop 
leaf image and respond ONLY in valid JSON with this exact structure:
{
  "disease_name": "",
  "severity": "Low | Medium | High | Healthy",
  "affected_area_percent": 0,
  "action_steps": ["step1", "step2", "step3"],
  "treatment": {
    "name": "",
    "dosage": "",
    "method": ""
  },
  "prevention_tips": ["tip1", "tip2", "tip3"],
  "is_healthy": false
}`,
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
    }),
  })
  const data = await response.json()
  const raw = data.candidates[0].content.parts[0].text
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ── Generate daily crop advisory ──
export async function generateAdvisory(farmerProfile, weather) {
  try {
    const crop = farmerProfile?.crop || 'Tomato'
    const stage = farmerProfile?.stage || 'Vegetative'
    const soilType = farmerProfile?.soilType || 'Black'
    const district = farmerProfile?.district || 'Pune'
    const state = farmerProfile?.state || 'Maharashtra'
    const name = farmerProfile?.name || 'Farmer'
    const landSize = farmerProfile?.landSize ?? farmerProfile?.landAcres ?? '3'

    const temp = weather?.temp ?? '28'
    const humidity = weather?.humidity ?? '65'
    const rainChance = weather?.rainChance ?? '20'
    const condition = weather?.condition || 'Partly Cloudy'

    const prompt = `
Farmer Profile:
- Name: ${name}
- Crop: ${crop}
- Growth Stage: ${stage}
- Soil Type: ${soilType}
- Location: ${district}, ${state}
- Land Size: ${landSize} acres

Current Weather:
- Temperature: ${temp}°C
- Humidity: ${humidity}%
- Rain Chance: ${rainChance}%
- Condition: ${condition}

Generate 3 farming advisory cards for today.

You MUST respond ONLY with a raw valid JSON array. No markdown, no backticks, no explanation. Just the JSON array.

Each element must match this shape:
[
  {
    "id": 1,
    "icon": "🌿",
    "severity": "Info | Warning | Critical",
    "title": "",
    "advice": "",
    "category": "Pest | Irrigation | Fertilizer | Weather | General"
  }
]`

    const system = `You are an expert Indian agricultural advisor with 20 years 
of experience in Maharashtra farming. Give practical, specific, actionable 
advice in simple language. Keep each advice under 3 sentences.`

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${system}\n\n${prompt}` }],
          },
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
      }),
    })

    const data = await response.json()
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (raw == null || raw === '') {
      throw new Error('Empty response from Gemini')
    }

    const stripped = raw.replace(/```json/gi, '').replace(/```/g, '').trim()
    const start = stripped.indexOf('[')
    const end = stripped.lastIndexOf(']')
    if (start === -1 || end === -1 || end <= start) {
      throw new Error('No JSON array in response')
    }

    const parsed = JSON.parse(stripped.slice(start, end + 1))
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Invalid advisory payload')
    }

    return parsed
  } catch {
    return ADVISORY_FALLBACK
  }
}

// ── Generate irrigation recommendation ──
export async function getIrrigationTip(crop, stage, soilMoisture, weather) {
  const prompt = `
Crop: ${crop}, Stage: ${stage}
Current soil moisture: ${soilMoisture}%
Weather forecast: ${weather}

Give a 2-sentence water saving irrigation tip for this farmer.
Be specific and practical.`

  return await askGemini(prompt, 'You are an irrigation expert for Indian farms.')
}

// ── Generate cost saving suggestions ──
export async function getCostSuggestions(costBreakdown, crop) {
  const fallback = [
    "Shift a portion of basal fertilizer closer to active roots to reduce top-dress repeats.",
    "Batch spray days with neighbours to share knapsack calibration time.",
    "Negotiate staggered labour payments tied to picking milestones instead of flat weekly hires."
  ];

  try {
    const prompt = `
A farmer growing ${crop} has this cost structure:
${JSON.stringify(costBreakdown, null, 2)}

Suggest 3 specific ways to reduce costs without hurting yield.
Respond ONLY in valid JSON:
["suggestion 1", "suggestion 2", "suggestion 3"]`;

    const systemContext = 'You are an agricultural economist advising small Indian farmers.';

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemContext}\n\n${prompt}` }],
          },
        ],
      }),
    });

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (raw === undefined || raw === null) {
      return fallback;
    }

    const clean = raw.replace(/```json|```/gi, '').trim();
    const start = clean.indexOf('[');
    const end = clean.lastIndexOf(']');

    if (start === -1 || end === -1 || start >= end) {
      return fallback;
    }

    const parsed = JSON.parse(clean.slice(start, end + 1));
    
    if (!Array.isArray(parsed)) {
      return fallback;
    }
    
    if (parsed.length === 0) {
      return fallback;
    }

    return parsed;
  } catch (err) {
    return fallback;
  }
}
