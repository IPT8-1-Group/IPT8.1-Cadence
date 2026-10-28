import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '@/pages/Landing/LandingView.vue'
import LoginView from '@/pages/Auth/LoginView.vue'
import RegisterRequestView from '@/pages/Auth/RegisterRequestView.vue'
import DashboardView from '@/pages/Dashboard/DashboardView.vue'
import ModulesView from '@/pages/Modules/ModulesView.vue'
import ModuleDetailView from '@/pages/Modules/ModuleDetailView.vue'
import RegistrationRequestsView from '@/pages/Admin/RegistrationRequestsView.vue'
import UsersView from '@/pages/Admin/UsersView.vue'
import NotFoundView from '@/pages/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'Landingpage',
      path: '/',
      component: LandingView,
      meta: { requiresAuth: false }
    },
    {
      name: 'Login',
      path: '/login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      name: 'Register',
      path: '/register',
      component: RegisterRequestView,
      meta: { requiresAuth: false }
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      name: 'Modules',
      path: '/modules',
      component: ModulesView,
      meta: { requiresAuth: true }
    },
    {
      name: 'ModuleDetail',
      path: '/moduledetail',
      component: ModuleDetailView,
      meta: { requiresAuth: true }
    },
    {
      name: 'RegistrationRequest',
      path: '/registrationrequest',
      component: RegistrationRequestsView,
      meta: { requiresAuth: true }
    },
    {
      name: 'Users',
      path: '/users',
      component: UsersView,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
      meta: { requiresAuth: false },
    },
  ],
})

export default router
