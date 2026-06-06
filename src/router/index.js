import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/views/Auth.vue'),
  },
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
      },
      {
        path: 'buscar',
        name: 'Buscar',
        component: () => import('@/views/Buscar.vue'),
      },
      {
        path: 'prospectos',
        name: 'Prospectos',
        component: () => import('@/views/Prospectos.vue'),
      },
      {
        path: 'relevamiento-farmacias',
        name: 'RelevamientoFarmacias',
        component: () => import('@/views/RelevamientoFarmacias.vue'),
      },
      {
        path: 'relevamiento-comercial',
        name: 'RelevamientoComercial',
        component: () => import('@/views/RelevamientoComercial.vue'),
      },
      {
        path: 'emails',
        name: 'Emails',
        component: () => import('@/views/Emails.vue'),
      },
      {
        path: 'estadisticas',
        name: 'Estadisticas',
        component: () => import('@/views/Estadisticas.vue'),
      },
      {
        path: 'ai-outreach',
        name: 'AiOutreach',
        component: () => import('@/views/AiOutreach.vue'),
      },
      {
        path: 'configuracion',
        name: 'Configuracion',
        component: () => import('@/views/Configuracion.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
