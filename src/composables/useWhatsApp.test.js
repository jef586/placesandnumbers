import test from 'node:test'
import assert from 'node:assert/strict'

import { useWhatsApp } from './useWhatsApp.js'

test('buildWhatsAppMessage includes business name in the greeting', () => {
  const { buildWhatsAppMessage } = useWhatsApp()

  const message = buildWhatsAppMessage({
    name: 'Hotel Central',
    website: 'https://hotelcentral.example',
  })

  assert.match(message, /Hotel Central/i)
})

test('buildWhatsAppMessage uses website-focused pitch when the place has a website', () => {
  const { buildWhatsAppMessage } = useWhatsApp()

  const message = buildWhatsAppMessage({
    name: 'Hotel Central',
    website: 'https://hotelcentral.example',
  })

  assert.match(message, /Vi su p[aá]gina web/i)
  assert.match(message, /moderno|r[aá]pido|consultas por WhatsApp/i)
  assert.match(message, /reuni[oó]n/i)
})

test('buildWhatsAppMessage uses creation pitch when the place has no website', () => {
  const { buildWhatsAppMessage } = useWhatsApp()

  const message = buildWhatsAppMessage({
    name: 'Hotel Central',
    website: '',
  })

  assert.match(message, /Google Maps/i)
  assert.match(message, /sitio profesional|servicios|ubicaci[oó]n|horarios/i)
  assert.match(message, /propuesta simple/i)
})

test('buildWhatsAppMessage treats Facebook pages as no website', () => {
  const { buildWhatsAppMessage } = useWhatsApp()

  const message = buildWhatsAppMessage({
    name: 'Hotel Central',
    website: 'https://www.facebook.com/hotelcentral',
  })

  assert.match(message, /Google Maps/i)
  assert.doesNotMatch(message, /Vi su p[aá]gina web/i)
})

test('buildWhatsAppMessage treats Instagram pages as no website', () => {
  const { buildWhatsAppMessage } = useWhatsApp()

  const message = buildWhatsAppMessage({
    name: 'Hotel Central',
    website: 'https://www.instagram.com/hotelcentral',
  })

  assert.match(message, /Google Maps/i)
  assert.doesNotMatch(message, /Vi su p[aá]gina web/i)
})

test('buildWhatsAppMessage uses pharmacy template when category is Farmacia', () => {
  const { buildWhatsAppMessage } = useWhatsApp()

  const message = buildWhatsAppMessage({
    name: 'Farmacia San José',
    website: 'https://farmaciasanjose.example',
    category: 'Farmacia',
  })

  assert.match(message, /Alfabeta/i)
  assert.match(message, /software especializado para farmacias/i)
  assert.match(message, /facturaci[oó]n, stock y obras sociales/i)
  assert.match(message, /demostraci[oó]n de 15 minutos/i)
  assert.doesNotMatch(message, /desarrollador web/i)
  assert.doesNotMatch(message, /tikas\.com/i)
})

test('buildWhatsAppMessage includes pharmacy business name in pharmacy greeting', () => {
  const { buildWhatsAppMessage } = useWhatsApp()

  const message = buildWhatsAppMessage({
    name: 'Farmacia San José',
    category: 'Farmacia',
  })

  assert.match(message, /Farmacia San José/i)
})

test('buildWhatsAppMessage uses pharmacy template without name when name is empty', () => {
  const { buildWhatsAppMessage } = useWhatsApp()

  const message = buildWhatsAppMessage({
    name: '',
    category: 'Farmacia',
  })

  assert.match(message, /^Hola, ¿cómo está\?/i)
  assert.match(message, /Alfabeta/i)
})

test('normalizePhone strips separators and converts common Argentine mobile prefixes', () => {
  const { normalizePhone } = useWhatsApp()

  assert.equal(normalizePhone('(011) 15-2345-6789'), '5491123456789')
  assert.equal(normalizePhone('+54 9 11 2345-6789'), '5491123456789')
  assert.equal(normalizePhone('03825 66-7913'), '5493825667913')
})

test('getPhone returns either phoneNumber or phone', () => {
  const { getPhone } = useWhatsApp()

  assert.equal(getPhone({ phoneNumber: '+54 9 11 2345-6789' }), '+54 9 11 2345-6789')
  assert.equal(getPhone({ phone: '+54 261 456-7890' }), '+54 261 456-7890')
})

test('createWhatsAppTargets builds desktop and web fallback urls', () => {
  const { createWhatsAppTargets, buildWhatsAppMessage } = useWhatsApp()

  const place = {
    phoneNumber: '+54 9 11 2345-6789',
    website: 'https://hotelcentral.example',
  }

  assert.deepEqual(createWhatsAppTargets(place), {
    desktopUrl: `whatsapp://send?phone=%2B5491123456789&text=${encodeURIComponent(buildWhatsAppMessage(place))}`,
    apiUrl: `https://api.whatsapp.com/send/?phone=5491123456789&text=${encodeURIComponent(buildWhatsAppMessage(place))}&type=phone_number&app_absent=0`,
    webUrl: `https://web.whatsapp.com/send?phone=5491123456789&text=${encodeURIComponent(buildWhatsAppMessage(place))}`,
  })
})

test('copyWhatsAppMessage copies the generated message to the clipboard', async () => {
  const { copyWhatsAppMessage, buildWhatsAppMessage } = useWhatsApp()
  const previousNavigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const copiedMessages = []
  const place = {
    phoneNumber: '+54 9 11 2345-6789',
    website: '',
  }

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      clipboard: {
        async writeText(message) {
          copiedMessages.push(message)
        },
      },
    },
  })

  const result = await copyWhatsAppMessage(place)

  assert.equal(result, true)
  assert.deepEqual(copiedMessages, [buildWhatsAppMessage(place)])

  if (previousNavigatorDescriptor) {
    Object.defineProperty(globalThis, 'navigator', previousNavigatorDescriptor)
  } else {
    delete globalThis.navigator
  }
})

test('copyPhoneNumber copies the normalized phone number to the clipboard', async () => {
  const { copyPhoneNumber } = useWhatsApp()
  const previousNavigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const copiedValues = []

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      clipboard: {
        async writeText(message) {
          copiedValues.push(message)
        },
      },
    },
  })

  const result = await copyPhoneNumber({ phoneNumber: '(011) 15-2345-6789' })

  assert.equal(result, true)
  assert.deepEqual(copiedValues, ['5491123456789'])

  if (previousNavigatorDescriptor) {
    Object.defineProperty(globalThis, 'navigator', previousNavigatorDescriptor)
  } else {
    delete globalThis.navigator
  }
})

test('openWhatsApp opens the desktop app url first and prepares the web fallback', () => {
  const { openWhatsApp, buildWhatsAppMessage } = useWhatsApp()
  const clickedUrls = []
  const previousWindow = globalThis.window
  const previousDocument = globalThis.document
  const previousNavigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const previousSetTimeout = globalThis.setTimeout
  const assignedUrls = []
  const copiedMessages = []
  let scheduledDelay = null

  const anchor = {
    href: '',
    target: '',
    rel: '',
    click() {
      clickedUrls.push(this.href)
    },
    remove() {},
  }

  globalThis.window = {
    location: {
      assign(url) {
        assignedUrls.push(url)
      },
    },
  }
  globalThis.document = {
    hidden: true,
    createElement(tagName) {
      assert.equal(tagName, 'a')
      return anchor
    },
    body: {
      appendChild() {},
      removeChild() {},
    },
  }
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
    clipboard: {
      async writeText(message) {
        copiedMessages.push(message)
      },
    },
    },
  })
  globalThis.setTimeout = (callback, delay) => {
    scheduledDelay = delay
    return callback
  }

  const place = {
    phoneNumber: '+54 9 11 2345-6789',
    website: 'https://hotelcentral.example',
  }

  openWhatsApp(place)

  assert.deepEqual(assignedUrls, [
    `whatsapp://send?phone=%2B5491123456789&text=${encodeURIComponent(buildWhatsAppMessage(place))}`,
  ])
  assert.equal(clickedUrls.length, 0)
  assert.deepEqual(copiedMessages, [buildWhatsAppMessage(place)])
  assert.equal(scheduledDelay, 900)
  
  assert.equal(
    assignedUrls[0],
    `whatsapp://send?phone=%2B5491123456789&text=${encodeURIComponent(buildWhatsAppMessage(place))}`,
  )

  globalThis.window = previousWindow
  globalThis.document = previousDocument
  if (previousNavigatorDescriptor) {
    Object.defineProperty(globalThis, 'navigator', previousNavigatorDescriptor)
  } else {
    delete globalThis.navigator
  }
  globalThis.setTimeout = previousSetTimeout
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
