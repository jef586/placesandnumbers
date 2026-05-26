import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#2563eb',
          secondary: '#8b5cf6',
        },
      },
    },
  },
  defaults: {
    VCard: { elevation: 0 },
    VBtn: { elevation: 0 },
  },
})
