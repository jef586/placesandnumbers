import test from 'node:test'
import assert from 'node:assert/strict'

import { useWhatsApp } from './useWhatsApp.js'

test('buildWhatsAppMessage uses website-focused pitch when the place has a website', () => {
  const { buildWhatsAppMessage } = useWhatsApp()

  const message = buildWhatsAppMessage({
    name: 'Hotel Central',
    website: 'https://hotelcentral.example',
  })

  assert.match(message, /Vi su p[aá]gina web/i)
  assert.match(message, /moderno|r[aá]pido|consultas por WhatsApp/i)
})

test('buildWhatsAppMessage uses creation pitch when the place has no website', () => {
  const { buildWhatsAppMessage } = useWhatsApp()

  const message = buildWhatsAppMessage({
    name: 'Hotel Central',
    website: '',
  })

  assert.match(message, /Google Maps/i)
  assert.match(message, /sitio profesional|servicios|ubicaci[oó]n|horarios/i)
})

test('normalizePhone strips separators and converts common Argentine mobile prefixes', () => {
  const { normalizePhone } = useWhatsApp()

  assert.equal(normalizePhone('(011) 15-2345-6789'), '5491123456789')
  assert.equal(normalizePhone('+54 9 11 2345-6789'), '5491123456789')
})

test('openWhatsApp opens wa.me with an encoded message', () => {
  const { openWhatsApp, buildWhatsAppMessage } = useWhatsApp()
  const openedUrls = []
  const previousWindow = globalThis.window

  globalThis.window = {
    open(url) {
      openedUrls.push(url)
      return { closed: false }
    },
    location: {
      assign() {
        throw new Error('location.assign should not be used when window.open succeeds')
      },
    },
  }

  const place = {
    phoneNumber: '+54 9 11 2345-6789',
    website: 'https://hotelcentral.example',
  }

  openWhatsApp(place)

  assert.equal(openedUrls.length, 1)
  assert.equal(
    openedUrls[0],
    `https://wa.me/5491123456789?text=${encodeURIComponent(buildWhatsAppMessage(place))}`,
  )

  globalThis.window = previousWindow
})

test('openWhatsApp alerts clearly when the place has no phone number', () => {
  const { openWhatsApp } = useWhatsApp()
  const alerts = []
  const previousAlert = globalThis.alert

  globalThis.alert = (message) => {
    alerts.push(message)
  }

  openWhatsApp({ website: 'https://hotelcentral.example' })

  assert.deepEqual(alerts, ['Este prospecto no tiene número de teléfono disponible.'])

  globalThis.alert = previousAlert
})
