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

const RUBRO_KEYWORDS = {
  ferretería: ['ferretería', 'ferreteria', 'ferretero'],
  mercado: ['mercado', 'autoservicio', 'supermercado', 'supermercado', 'almacén', 'almacen', 'kiosco'],
  corralón: ['corralón', 'corralon', 'materiales', 'construcción'],
  distribuidora: ['distribuidora', 'distribucion', 'distribución', 'mayorista'],
  veterinaria: ['veterinaria', 'veterinario', 'pet shop', 'mascotas'],
  librería: ['librería', 'libreria', 'papelería', 'papeleria', 'libros'],
}

function detectRubroCategory(prospect) {
  const rubro = (prospect?.rubro || '').toLowerCase()
  const category = (prospect?.category || '').toLowerCase()
  const name = (prospect?.name || '').toLowerCase()
  const haystack = `${rubro} ${category} ${name}`

  for (const [cat, keywords] of Object.entries(RUBRO_KEYWORDS)) {
    if (keywords.some(k => haystack.includes(k))) return cat
  }
  return null
}

function buildRubroMention(rubroCategory) {
  const mentions = {
    ferretería: 'control de stock y gestión de artículos. Un sistema que les permita saber exactamente qué tienen en depósito, automatizar pedidos y llevar un control preciso de precios y proveedores.',
    mercado: 'facturación rápida, control de stock y gestión de ventas. Un sistema que agilice las cobranzas, evite faltantes y les dé visibilidad en tiempo real de todo el negocio.',
    corralón: 'control de inventario y cuentas corrientes. Un sistema que ordene el depósito, gestione los pedidos a proveedores y permita manejar las cuentas corrientes de sus clientes de forma sencilla.',
    distribuidora: 'gestión de clientes, control de stock y facturación electrónica. Un sistema que centralice los pedidos, automatice la facturación y les dé trazabilidad completa de las entregas.',
    veterinaria: 'control de stock de productos, gestión de turnos y administración comercial. Un sistema que integre la venta de productos con la gestión de pacientes y servicios.',
    librería: 'control de inventario y gestión de ventas. Un sistema que ordene el stock de libros y artículos de librería, agilice las ventas y evite pérdidas por falta de control.',
  }
  return mentions[rubroCategory] || 'facturación electrónica, control de stock y gestión de ventas. Un sistema que centralice toda la operación diaria del negocio en un solo lugar.'
}

export function buildCommercialPrompt(prospect, toneKey, analysis) {
  const toneDesc = TONES[toneKey] || TONES.casual
  const rubroCategory = detectRubroCategory(prospect)
  const rubroMention = buildRubroMention(rubroCategory)
  const rubroDisplay = prospect?.rubro || prospect?.category || 'comercio'

  const businessInfo = [
    `Nombre: ${prospect?.name || 'No especificado'}`,
    `Rubro: ${rubroDisplay}`,
    `Ciudad: ${prospect?.city || 'No especificada'}`,
    `Teléfono: ${prospect?.phone || 'No disponible'}`,
  ]

  if (prospect?.website) {
    businessInfo.push(`Sitio web: ${prospect.website}`)
  } else {
    businessInfo.push('Sitio web: No tiene')
  }

  if (prospect?.software_actual) {
    businessInfo.push(`Software actual: ${prospect.software_actual}`)
  } else {
    businessInfo.push('Software actual: No utiliza sistema / método manual')
  }

  const systemPrompt = `Eres Ezequiel Flores, un asesor comercial especializado en sistemas de facturación y gestión para comercios en Argentina. Estás realizando un relevamiento comercial en la zona. Generas mensajes de outreach para ofrecer software de facturación y gestión empresarial.

REGLAS ESTRICTAS:
- NUNCA hables de desarrollo web, páginas web, sitios web, diseño web, marketing digital ni presencia digital
- El objetivo es vender SOFTWARE DE FACTURACIÓN Y GESTIÓN, NO servicios web
- NUNCA uses frases genéricas como "Espero que este mensaje te encuentre bien"
- Cada mensaje debe referirse ESPECÍFICAMENTE al negocio: su nombre, su rubro, su ubicación
- Los mensajes deben sonar NATURALES, como escritos por una persona real, NO como una plantilla
- No uses emojis en exceso (máximo 1-2 si corresponde al tono)
- La firma siempre es: Ezequiel Flores
- Los mensajes para WhatsApp deben ser más cortos y directos
- El email puede ser más extenso y estructurado
- IMPORTANTE: Adapta el mensaje al RUBRO del negocio. Para ${rubroDisplay}, habla específicamente de ${rubroMention}
- Mencioná que estás haciendo un relevamiento comercial en la zona
- No incluyas URLs ni enlaces al final`

  const userPrompt = `Genera 4 mensajes comerciales personalizados para ofrecer SOFTWARE DE FACTURACIÓN Y GESTIÓN al siguiente negocio:

${businessInfo.join('\n')}

Personalización por rubro (${rubroDisplay}):
${rubroMention}

TONO: ${toneDesc}

Formato EXACTO requerido (responde SOLO con el JSON, sin explicaciones ni etiquetas de código):

{
  "whatsapp_corto": "Mensaje corto para WhatsApp (máx 200 caracteres, directo, mencionando el rubro)",
  "whatsapp_profesional": "Mensaje detallado para WhatsApp (presentación como relevador comercial, propuesta de software y llamado a coordinar demo)",
  "email_formal": "ASUNTO|Cuerpo del email formal (el asunto va antes del |, luego el cuerpo completo)",
  "instagram_dm": "Mensaje para Instagram DM (máx 250 caracteres, casual y directo)"
}`

  return { systemPrompt, userPrompt }
}

export { detectRubroCategory, buildRubroMention }
