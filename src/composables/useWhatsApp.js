export function useWhatsApp() {
  const MISSING_PHONE_MESSAGE = 'Este prospecto no tiene número de teléfono disponible.'

  function hasWebsite(place) {
    return Boolean(place?.website?.trim())
  }

  function buildWhatsAppMessage(place) {
    if (hasWebsite(place)) {
      return 'Hola, ¿cómo están? Vi su página web y me pareció interesante su negocio. Soy desarrollador web y creo que podría ayudarlos a mejorar su sitio para que se vea más moderno, cargue más rápido y convierta mejor las visitas en consultas por WhatsApp. ¿Les gustaría que les comparta algunas ideas?'
    }
    return 'Hola, ¿cómo están? Vi su negocio en Google Maps y noté que todavía no tienen una página web visible. Soy desarrollador web y puedo ayudarlos a crear un sitio profesional para mostrar sus servicios, fotos, ubicación, horarios y recibir más consultas por WhatsApp. ¿Les gustaría que les comparta una propuesta simple?'
  }

  function getPhone(place) {
    return place?.phoneNumber || place?.phone || ''
  }

  function normalizeArgentinianMobileNumber(phone) {
    const digits = phone.replace(/\D/g, '').replace(/^00/, '')

    const toInternationalMobile = (localDigits) => {
      for (const areaCodeLength of [2, 3, 4]) {
        const mobilePrefixIndex = areaCodeLength
        if (localDigits.slice(mobilePrefixIndex, mobilePrefixIndex + 2) === '15') {
          return `549${localDigits.slice(0, mobilePrefixIndex)}${localDigits.slice(mobilePrefixIndex + 2)}`
        }
      }
      return ''
    }

    if (digits.startsWith('549')) return digits

    if (digits.startsWith('54')) {
      const localDigits = digits.slice(2).replace(/^0/, '')
      return toInternationalMobile(localDigits) || `54${localDigits}`
    }

    const localDigits = digits.replace(/^0/, '')
    return toInternationalMobile(localDigits) || digits
  }

  function normalizePhone(phone) {
    if (!phone) return ''
    return normalizeArgentinianMobileNumber(phone)
  }

  function createWhatsAppUrl(place) {
    const normalizedPhone = normalizePhone(getPhone(place))
    if (!normalizedPhone) return ''

    const message = buildWhatsAppMessage(place)
    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
  }

  function notifyMissingPhone() {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: {
          message: MISSING_PHONE_MESSAGE,
          type: 'warning',
        },
      }))
    }

    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(MISSING_PHONE_MESSAGE)
      return
    }

    if (typeof alert === 'function') {
      alert(MISSING_PHONE_MESSAGE)
    }
  }

  function openWhatsApp(place) {
    const phone = getPhone(place)
    if (!phone) {
      notifyMissingPhone()
      return false
    }

    const url = createWhatsAppUrl(place)
    if (!url) {
      notifyMissingPhone()
      return false
    }

    const popup = typeof window !== 'undefined' && typeof window.open === 'function'
      ? window.open(url, '_blank', 'noopener,noreferrer')
      : null

    if (!popup && typeof window !== 'undefined' && window.location?.assign) {
      window.location.assign(url)
    }

    return true
  }

  return {
    buildWhatsAppMessage,
    createWhatsAppUrl,
    getPhone,
    normalizePhone,
    notifyMissingPhone,
    openWhatsApp,
  }
}
