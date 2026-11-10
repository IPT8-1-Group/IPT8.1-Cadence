import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { loginApi, logoutApi, refreshApi, registerApi, verifyApi } from '@/api/auth.api.ts'
import { useRequestState } from '@/stores/requestState.ts'

type Session = {
  email: string
  privateKey: string
}

export const useAuthStore = defineStore('auth', () => {
  const { loading, error, runRequest } = useRequestState()
  const email = ref<string | null>(null)
  const isAuth = computed(() => email.value !== null)

  let session: Session | null = null
  let sessionVersion = 0

  function setSession(nextSession: Session | null) {
    session = nextSession
    email.value = nextSession?.email ?? null
  }

  async function register(email: string, password: string) {
    return await runRequest(() => registerApi(email, password), 'Registrierung fehlgeschlagen.')
  }

  async function login(email: string, password: string) {
    const version = ++sessionVersion

    const success = await runRequest(async () => {
      const data = await loginApi(email, password)

      if (version !== sessionVersion) {
        return false
      }

      setSession({ email, privateKey: data.private_key })
      return true
    }, 'Anmeldung fehlgeschlagen.')

    return success ?? false
  }

  async function checkSession(request: typeof verifyApi, fallbackError: string) {
    const activeSession = session

    if (activeSession === null) {
      return
    }

    return await runRequest(async () => {
      try {
        return await request(activeSession.email, activeSession.privateKey)
      } catch (e) {
        if (session === activeSession && e instanceof Error && e.message === 'Unauthorized') {
          setSession(null)
        }
        throw e
      }
    }, fallbackError)
  }

  async function verify() {
    return await checkSession(verifyApi, 'Sitzung konnte nicht überprüft werden.')
  }

  async function refresh() {
    return await checkSession(refreshApi, 'Sitzung konnte nicht verlängert werden.')
  }

  async function logout() {
    const activeSession = session
    sessionVersion += 1
    setSession(null)

    if (activeSession === null) {
      return
    }

    return await runRequest(
      () => logoutApi(activeSession.email, activeSession.privateKey),
      'Abmeldung fehlgeschlagen.'
    )
  }

  return { loading, error, email, isAuth, register, login, verify, refresh, logout }
})
