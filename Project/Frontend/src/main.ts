import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/authStore.ts'

import './styles/main.css'
import './styles/variables.css'

async function startApp() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  await useAuthStore(pinia).restoreSession()

  app.use(router)
  app.mount('#app')
}

void startApp()
