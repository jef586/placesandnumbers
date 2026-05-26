import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
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
