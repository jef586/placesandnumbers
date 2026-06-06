const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const MODELS = {
  flash: 'gemini-2.0-flash',
  pro: 'gemini-2.0-pro-exp',
}

export async function generateWithGemini(systemPrompt, userPrompt, model = 'flash') {
  const apiKey = import.meta.env.VITE_AI_API_KEY
  if (!apiKey) {
    throw new Error('VITE_AI_API_KEY no está configurada en .env')
  }

  const modelName = MODELS[model] || MODELS.flash
  const url = `${GEMINI_API_BASE}/${modelName}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt + '\n\n' + userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
        topP: 0.95,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Gemini API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()

  if (!data.candidates || data.candidates.length === 0) {
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Bloqueado por seguridad: ${data.promptFeedback.blockReason}`)
    }
    throw new Error('Gemini no generó respuesta')
  }

  const text = data.candidates[0].content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Respuesta vacía de Gemini')
  }

  return text
}

export function extractJsonFromResponse(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No se pudo extraer JSON de la respuesta')
  }
  return JSON.parse(jsonMatch[0])
}
