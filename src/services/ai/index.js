import { analyzeProspect, buildPrompt } from './prompts'
import { generateWithGemini, extractJsonFromResponse } from './gemini'

const FALLBACK_MESSAGES = {
  whatsapp_corto: 'Hola, soy Ezequiel Flores, desarrollador web. Vi su negocio y tengo ideas para mejorar su presencia digital. ¿Tienen un momento para conversar? Conocé más en https://tikas.com.ar/',
  whatsapp_profesional: 'Hola, soy Ezequiel Flores, desarrollador web especializado en negocios locales. Vi su negocio y creo que puedo ayudarlos a mejorar su presencia digital con un sitio web moderno y estrategias de marketing. ¿Les interesaría conocer una propuesta? Conocé más en https://tikas.com.ar/',
  email_formal: 'Propuesta de mejora digital|Estimados, soy Ezequiel Flores, desarrollador web. Me contacté porque vi su negocio y creo que puedo ayudarlos a mejorar su presencia digital. Quedo a disposición para conversar. Conocé más en https://tikas.com.ar/. Saludos, Ezequiel Flores',
  instagram_dm: 'Hola! Soy Ezequiel, desarrollador web. Vi su negocio y me encantaría ayudarles a mejorar su presencia digital. ¿Les interesa? Conocé más en https://tikas.com.ar/',
}

function validateMessages(messages) {
  const valid = {}
  for (const key of ['whatsapp_corto', 'whatsapp_profesional', 'email_formal', 'instagram_dm']) {
    const val = messages[key]
    if (typeof val === 'string' && val.trim().length > 10) {
      valid[key] = val.trim()
    } else {
      valid[key] = FALLBACK_MESSAGES[key]
    }
  }
  return valid
}

export async function generateMessages(prospect, tone = 'casual') {
  if (!prospect || !prospect.name) {
    throw new Error('Prospecto inválido: se requiere nombre')
  }

  const analysis = analyzeProspect(prospect)
  const { systemPrompt, userPrompt } = buildPrompt(prospect, tone, analysis)

  const raw = await generateWithGemini(systemPrompt, userPrompt)
  const parsed = extractJsonFromResponse(raw)
  const messages = validateMessages(parsed)

  return {
    messages,
    analysis,
    tone,
    prospectName: prospect.name,
  }
}

export async function regenerateMessage(prospect, tone, channel) {
  const result = await generateMessages(prospect, tone)
  return result.messages[channel] || FALLBACK_MESSAGES[channel]
}

export { analyzeProspect, buildPrompt }
