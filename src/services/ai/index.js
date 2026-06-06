import { analyzeProspect, buildPrompt, buildCommercialPrompt } from './prompts'
import { generateWithGemini, extractJsonFromResponse } from './gemini'

const FALLBACK_MESSAGES = {
  whatsapp_corto: 'Hola, soy Ezequiel Flores, desarrollador web. Vi su negocio y tengo ideas para mejorar su presencia digital. ¿Tienen un momento para conversar? Conocé más en https://tikas.com.ar/',
  whatsapp_profesional: 'Hola, soy Ezequiel Flores, desarrollador web especializado en negocios locales. Vi su negocio y creo que puedo ayudarlos a mejorar su presencia digital con un sitio web moderno y estrategias de marketing. ¿Les interesaría conocer una propuesta? Conocé más en https://tikas.com.ar/',
  email_formal: 'Propuesta de mejora digital|Estimados, soy Ezequiel Flores, desarrollador web. Me contacté porque vi su negocio y creo que puedo ayudarlos a mejorar su presencia digital. Quedo a disposición para conversar. Conocé más en https://tikas.com.ar/. Saludos, Ezequiel Flores',
  instagram_dm: 'Hola! Soy Ezequiel, desarrollador web. Vi su negocio y me encantaría ayudarles a mejorar su presencia digital. ¿Les interesa? Conocé más en https://tikas.com.ar/',
}

const FALLBACK_COMMERCIAL_MESSAGES = {
  whatsapp_corto: 'Hola, ¿cómo está? Soy Ezequiel Flores, estoy realizando un relevamiento comercial en la zona. Vi su negocio y quería comentarle que tenemos un sistema de facturación y gestión que podría serle útil. ¿Podemos coordinar una breve demo?',
  whatsapp_profesional: 'Hola, ¿cómo está? Mi nombre es Ezequiel Flores y estoy realizando un relevamiento comercial en la zona. Vi su negocio y quería comentarle que estamos ayudando a comercios a simplificar la gestión diaria mediante un sistema de facturación, control de stock y administración de ventas. Me gustaría coordinar una breve demostración para mostrarle cómo funciona y evaluar si puede ser útil para su negocio. Quedo atento. Muchas gracias.',
  email_formal: 'Propuesta de software de gestión|Estimados, soy Ezequiel Flores. Estoy realizando un relevamiento comercial en la zona y quería acercarles nuestra propuesta de software de facturación y gestión empresarial. Con nuestro sistema podrán administrar ventas, stock, cuentas corrientes y más. Quedo a disposición para coordinar una demostración sin compromiso. Saludos, Ezequiel Flores',
  instagram_dm: 'Hola! Soy Ezequiel Flores, estoy haciendo un relevamiento comercial en la zona. Vi su negocio y tenemos un sistema de facturación y gestión que podría interesarles. ¿Tienen un momento para charlar?',
}

function validateMessages(messages, isCommercial = false) {
  const fallback = isCommercial ? FALLBACK_COMMERCIAL_MESSAGES : FALLBACK_MESSAGES
  const valid = {}
  for (const key of ['whatsapp_corto', 'whatsapp_profesional', 'email_formal', 'instagram_dm']) {
    const val = messages[key]
    if (typeof val === 'string' && val.trim().length > 10) {
      valid[key] = val.trim()
    } else {
      valid[key] = fallback[key]
    }
  }
  return valid
}

export async function generateMessages(prospect, tone = 'casual') {
  if (!prospect || !prospect.name) {
    throw new Error('Prospecto inválido: se requiere nombre')
  }

  const isCommercial = prospect.tipo_relevamiento === 'comercial'

  const analysis = analyzeProspect(prospect)
  const promptFn = isCommercial ? buildCommercialPrompt : buildPrompt
  const { systemPrompt, userPrompt } = promptFn(prospect, tone, analysis)

  const raw = await generateWithGemini(systemPrompt, userPrompt)
  const parsed = extractJsonFromResponse(raw)
  const messages = validateMessages(parsed, isCommercial)

  return {
    messages,
    analysis,
    tone,
    prospectName: prospect.name,
    campaignType: isCommercial ? 'software_facturacion' : 'desarrollo_web',
  }
}

export async function generateCommercialMessages(prospect, tone = 'casual') {
  if (!prospect || !prospect.name) {
    throw new Error('Prospecto inválido: se requiere nombre')
  }

  const analysis = analyzeProspect(prospect)
  const { systemPrompt, userPrompt } = buildCommercialPrompt(prospect, tone, analysis)

  const raw = await generateWithGemini(systemPrompt, userPrompt)
  const parsed = extractJsonFromResponse(raw)
  const messages = validateMessages(parsed, true)

  return {
    messages,
    analysis,
    tone,
    prospectName: prospect.name,
    campaignType: 'software_facturacion',
  }
}

export async function regenerateMessage(prospect, tone, channel) {
  const isCommercial = prospect.tipo_relevamiento === 'comercial'
  const result = await generateMessages(prospect, tone)
  return result.messages[channel] || (isCommercial ? FALLBACK_COMMERCIAL_MESSAGES[channel] : FALLBACK_MESSAGES[channel])
}

export { analyzeProspect, buildPrompt, buildCommercialPrompt }
