export function useWhatsApp() {
  const MISSING_PHONE_MESSAGE = 'Este prospecto no tiene número de teléfono disponible.'
  const SOCIAL_HOSTS = [
    'facebook.com',
    'www.facebook.com',
    'm.facebook.com',
    'fb.com',
    'www.fb.com',
    'instagram.com',
    'www.instagram.com',
    'm.instagram.com',
  ]

  function hasWebsite(place) {
    const website = place?.website?.trim()
    if (!website) return false

    try {
      const url = new URL(website)
      return !SOCIAL_HOSTS.includes(url.hostname.toLowerCase())
    } catch {
      return !SOCIAL_HOSTS.some(host => website.toLowerCase().includes(host))
    }
  }

  function buildWhatsAppMessage(place) {
    const name = place?.name?.trim()
    const category = (place?.category || '').toLowerCase()

    if (category.includes('farmacia')) {
      const greeting = name
        ? `Hola ${name}, ¿cómo está?`
        : 'Hola, ¿cómo está?'
      return `${greeting} Soy Ezequiel Flores, representante comercial de Alfabeta en La Rioja.

Estamos ayudando a farmacias de la zona a modernizar su gestión con nuestro software especializado para farmacias, incluyendo facturación, stock y obras sociales.

¿Le interesaría que coordinemos una breve demostración de 15 minutos para mostrarle cómo funciona?

Quedo atento. ¡Muchas gracias!`
    }

    const greeting = name
      ? `Hola ${name}, ¿cómo están?`
      : 'Hola, ¿cómo están?'

    if (hasWebsite(place)) {
      return `${greeting} Vi su página web y me pareció interesante su negocio. Mi nombre es Ezequiel Flores ,soy desarrollador web y creo que podría ayudarlos a mejorar su sitio para que se vea más moderno, cargue más rápido y convierta mejor las visitas en consultas por WhatsApp. Si les interesa, podemos coordinar una reunión breve y les comparto algunas ideas concretas para mejorarlo. Conocé más en https://tikas.com.ar/`
    }
    return `${greeting} Vi su negocio en Google Maps y noté que todavía no tienen una página web visible. Mi nombre es Ezequiel Flores ,soy desarrollador web y puedo ayudarlos a crear un sitio profesional para mostrar sus servicios, fotos, ubicación, horarios y recibir más consultas por WhatsApp. ¿Les gustaría que les comparta una propuesta simple? Conocé más en https://tikas.com.ar/`
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

    const guessInternationalMobile = (localDigits) => {
      if (localDigits.length >= 10 && localDigits.length <= 11) {
        return `549${localDigits}`
      }
      return ''
    }

    if (digits.startsWith('549')) return digits

    if (digits.startsWith('54')) {
      const localDigits = digits.slice(2).replace(/^0/, '')
      return toInternationalMobile(localDigits) || guessInternationalMobile(localDigits) || `54${localDigits}`
    }

    const localDigits = digits.replace(/^0/, '')
    return toInternationalMobile(localDigits) || guessInternationalMobile(localDigits) || digits
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

  function createWhatsAppTargets(place) {
    const normalizedPhone = normalizePhone(getPhone(place))
    if (!normalizedPhone) {
      return {
        desktopUrl: '',
        apiUrl: '',
        webUrl: '',
      }
    }

    const encodedMessage = encodeURIComponent(buildWhatsAppMessage(place))
    return {
      desktopUrl: `whatsapp://send?phone=%2B${normalizedPhone}&text=${encodedMessage}`,
      apiUrl: `https://api.whatsapp.com/send/?phone=${normalizedPhone}&text=${encodedMessage}&type=phone_number&app_absent=0`,
      webUrl: `https://web.whatsapp.com/send?phone=${normalizedPhone}&text=${encodedMessage}`,
    }
  }

  function openExternalUrl(url) {
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'

      if (typeof document.body?.appendChild === 'function') {
        document.body.appendChild(link)
      }

      if (typeof link.click === 'function') {
        link.click()
      }

      if (typeof link.remove === 'function') {
        link.remove()
      } else if (typeof document.body?.removeChild === 'function') {
        document.body.removeChild(link)
      }

      return true
    }

    if (typeof window !== 'undefined' && typeof window.open === 'function') {
      const popup = window.open(url, '_blank', 'noopener,noreferrer')
      if (popup) return true
    }

    if (typeof window !== 'undefined' && window.location?.assign) {
      window.location.assign(url)
      return true
    }

    return false
  }

  async function copyWhatsAppMessage(place) {
    const message = buildWhatsAppMessage(place)

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(message)
        return true
      } catch {
        return false
      }
    }

    return false
  }

  async function copyPhoneNumber(place) {
    const normalizedPhone = normalizePhone(getPhone(place))
    if (!normalizedPhone) {
      notifyMissingPhone()
      return false
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(normalizedPhone)
        return true
      } catch {
        return false
      }
    }

    return false
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

    const { desktopUrl, apiUrl } = createWhatsAppTargets(place)
    if (!desktopUrl || !apiUrl) {
      notifyMissingPhone()
      return false
    }

    copyWhatsAppMessage(place)

    if (typeof window !== 'undefined' && typeof window.location?.assign === 'function') {
      window.location.assign(desktopUrl)

      if (typeof setTimeout === 'function') {
        setTimeout(() => {
          if (typeof document === 'undefined' || !document.hidden) {
            openExternalUrl(apiUrl)
          }
        }, 900)
      }

      return true
    }

    return openExternalUrl(apiUrl)
  }

  return {
    buildWhatsAppMessage,
    createWhatsAppUrl,
    createWhatsAppTargets,
    copyWhatsAppMessage,
    copyPhoneNumber,
    getPhone,
    normalizePhone,
    notifyMissingPhone,
    openExternalUrl,
    openWhatsApp,
  }
}
