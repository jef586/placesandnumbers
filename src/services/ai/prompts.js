const TONES = {
  casual: 'Tono casual, amigable y conversacional. Como si hablaras con un conocido. Sin rodeos, directo pero cordial.',
  professional: 'Tono profesional, formal y corporativo. Lenguaje cuidado, respetuoso y estructurado.',
  seller: 'Tono persuasivo y de ventas. Destaca beneficios, urgencia y valor. Orientado a conversión.',
  technical: 'Tono técnico y detallado. Explica aspectos específicos con precisión. Para dueños que valoran el expertise.',
}

const SOCIAL_HOSTS = [
  'facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.com',
  'instagram.com', 'www.instagram.com', 'm.instagram.com',
  'twitter.com', 'x.com', 'linkedin.com', 'www.linkedin.com',
]

function hasSocialWebsite(url) {
  if (!url) return false
  try {
    const host = new URL(url).hostname.toLowerCase()
    return SOCIAL_HOSTS.some(h => host === h || host.endsWith('.' + h))
  } catch {
    return SOCIAL_HOSTS.some(h => url.toLowerCase().includes(h))
  }
}

export function analyzeProspect(prospect) {
  const website = (prospect?.website || '').trim()
  const hasSite = !!website && !hasSocialWebsite(website)
  const isSocial = !!website && hasSocialWebsite(website)

  let https = false
  let looksOld = false
  if (hasSite) {
    try {
      const url = new URL(website)
      https = url.protocol === 'https:'
      looksOld = /\.(html?|php|asp|aspx)$/i.test(url.pathname) ||
        /(wordpress|wp-content|blogspot|wix|weebly|jimdo)/i.test(website)
    } catch {
      https = website.startsWith('https://')
      looksOld = /\.html?$/i.test(website)
    }
  }

  const rating = prospect?.rating || 0
  const reviewsQuality = rating >= 4.5 ? 'excelentes' : rating >= 4.0 ? 'buenas' : rating >= 3.5 ? 'regulares' : 'bajas'
  const fewReviews = rating > 0 && rating < 4.0

  let digitalPresence
  let analysisNotes = []

  if (!hasSite && !isSocial) {
    digitalPresence = 'none'
    analysisNotes.push('No tiene presencia web propia')
    analysisNotes.push('No tiene sitio web ni redes detectadas')
  } else if (!hasSite && isSocial) {
    digitalPresence = 'social_only'
    analysisNotes.push('Solo tiene presencia en redes sociales')
    analysisNotes.push('No cuenta con un sitio web propio')
  } else if (hasSite && !https) {
    digitalPresence = 'no_https'
    analysisNotes.push('Tiene sitio web pero sin HTTPS')
    analysisNotes.push('El sitio no es seguro (falta SSL)')
    if (looksOld) analysisNotes.push('El sitio web parece desactualizado')
  } else if (hasSite && looksOld) {
    digitalPresence = 'old_site'
    analysisNotes.push('El sitio web existe pero parece antiguo')
    analysisNotes.push('Probablemente no sea responsive ni moderno')
  } else if (hasSite && https && !looksOld) {
    digitalPresence = 'good'
    analysisNotes.push('Tiene un sitio web moderno con HTTPS')
    analysisNotes.push('Buena presencia digital base')
  }

  if (fewReviews) {
    analysisNotes.push(`Tiene ${rating}/5 estrellas - las reseñas son ${reviewsQuality}`)
  }
  if (rating === 0) {
    analysisNotes.push('No tiene calificación o reseñas visibles')
  }

  const recs = []
  if (!hasSite || digitalPresence === 'social_only') {
    recs.push('creación de sitio web profesional')
  }
  if (digitalPresence === 'no_https') {
    recs.push('migración a HTTPS')
  }
  if (digitalPresence === 'old_site') {
    recs.push('rediseño y modernización del sitio')
  }
  if (fewReviews) {
    recs.push('gestión de reputación y reseñas')
  }
  if (digitalPresence === 'none') {
    recs.push('presencia digital completa desde cero')
  }
  if (digitalPresence === 'good') {
    recs.push('optimización y estrategia digital avanzada')
  }
  if (prospect?.category) {
    recs.push(`soluciones específicas para ${prospect.category}`)
  }

  return {
    hasWebsite: hasSite,
    hasHttps: https,
    isSocialOnly: isSocial && !hasSite,
    looksOld,
    rating,
    reviewsQuality,
    fewReviews,
    digitalPresence,
    analysisNotes,
    recommendations: recs,
    category: prospect?.category || '',
  }
}

export function buildPrompt(prospect, toneKey, analysis) {
  const toneDesc = TONES[toneKey] || TONES.casual

  const businessInfo = [
    `Nombre: ${prospect?.name || 'No especificado'}`,
    `Rubro: ${analysis.category || 'No especificado'}`,
    `Ciudad: ${prospect?.city || 'No especificada'}`,
    `Calificación: ${prospect?.rating ? prospect.rating + '/5' : 'Sin calificación'}`,
    `Teléfono: ${prospect?.phone || 'No disponible'}`,
  ]

  if (analysis.hasWebsite) {
    businessInfo.push(`Sitio web: ${prospect?.website}`)
    businessInfo.push(`HTTPS: ${analysis.hasHttps ? 'Sí' : 'No'}`)
  } else {
    businessInfo.push('Sitio web: No tiene')
  }

  const systemPrompt = `Eres Ezequiel Flores, un experto en marketing digital y desarrollo web para negocios locales en Argentina. Generas mensajes de outreach comerciales altamente personalizados.

REGLAS ESTRICTAS:
- NUNCA uses frases genéricas como "Espero que este mensaje te encuentre bien" o "Espero que estés teniendo un excelente día"
- Cada mensaje debe referirse ESPECÍFICAMENTE al negocio: su nombre, su rubro, su ubicación
- Los mensajes deben sonar NATURALES, como escritos por una persona real, NO como una plantilla
- No uses emojis en exceso (máximo 1-2 si corresponde al tono)
- La firma siempre es: Ezequiel Flores
- Si el negocio no tiene sitio web, la oferta principal es creación de sitio web profesional
- Si el sitio es antiguo o sin HTTPS, la oferta es modernización y seguridad
- Si tiene buena presencia, la oferta es optimización y escalar resultados
- IMPORTANTE: Adapta el mensaje al RUBRO del negocio (ej: si es restaurante, habla de carta online y reservas; si es taller mecánico, habla de turnos online y mostrar trabajos)
- Los mensajes para WhatsApp e Instagram deben ser más cortos y directos
- El email puede ser más extenso y estructurado
- Al final de cada mensaje, agrega la frase: "Conocé más en https://tikas.com.ar/"`

  const userPrompt = `Genera 4 mensajes comerciales personalizados para el siguiente negocio:

${businessInfo.join('\n')}

Análisis de presencia digital:
${analysis.analysisNotes.map(n => `- ${n}`).join('\n')}

Recomendaciones: ${analysis.recommendations.join(', ')}

TONO: ${toneDesc}

Formato EXACTO requerido (responde SOLO con el JSON, sin explicaciones ni etiquetas de código):

{
  "whatsapp_corto": "Mensaje corto para WhatsApp (máx 200 caracteres, directo, sin saludo extenso)",
  "whatsapp_profesional": "Mensaje detallado para WhatsApp (presentación, propuesta de valor y llamado a la acción)",
  "email_formal": "ASUNTO|Cuerpo del email formal (el asunto va antes del |, luego el cuerpo completo)",
  "instagram_dm": "Mensaje para Instagram DM (máx 250 caracteres, casual y directo)"
}`

  return { systemPrompt, userPrompt }
}
