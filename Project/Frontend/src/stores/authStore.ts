import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ApiError } from '@/api/api.ts'
import {
  changePasswordApi,
  getMeApi,
  loginApi,
  logoutApi,
  refreshApi,
  registerApi,
  setPasswordApi,
  verifyApi,
} from '@/api/auth.api.ts'
import { useRequestState } from '@/stores/requestState.ts'
import type { RegisterRequest, User } from '@/types/auth.ts'

const TOKEN_KEY = 'cadence.jwt'

export const useAuthStore = defineStore('auth', () => {
  const { loading, error, runRequest, loadData } = useRequestState()
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const email = computed(() => user.value?.email ?? null)
  const isAuth = computed(() => token.value !== null)
  const isAdmin = computed(() => isAuth.value && user.value?.role === 'admin')

  let privateKey: string | null = null
  let sessionVersion = 0

  async function restoreSession() {
    const savedToken = sessionStorage.getItem(TOKEN_KEY)
    if (!savedToken || token.value) return

    const version = sessionVersion

    await runRequest(async () => {
      try {
        const { user: profile } = await getMeApi(savedToken)
        if (version !== sessionVersion) return

        user.value = profile
        token.value = savedToken
      } catch (cause) {
        if (version === sessionVersion && cause instanceof ApiError && cause.status === 401) {
          clearSession()
        }

        throw cause
      }
    }, 'Sitzung konnte nicht wiederhergestellt werden.')
  }

  function clearSession() {
    sessionVersion += 1
    privateKey = null
    token.value = null
    user.value = null
    sessionStorage.removeItem(TOKEN_KEY)
  }

  function invalidateSession(requestToken: string) {
    if (token.value === requestToken) clearSession()
  }

  async function login(email: string, password: string) {
    const version = ++sessionVersion

    const success = await runRequest(async () => {
      const data = await loginApi(email.trim(), password)
      if (version !== sessionVersion) return false

      privateKey = data.private_key
      user.value = data.user
      token.value = data.token
      sessionStorage.setItem(TOKEN_KEY, data.token)
      return true
    }, 'Anmeldung fehlgeschlagen.')

    return success ?? false
  }

  function getMe() {
    return loadData(
      user,
      async () => (await getMeApi()).user,
      'Profil konnte nicht geladen werden.',
    )
  }

  function register(data: RegisterRequest | string, password = '') {
    return runRequest(() => registerApi(data, password), 'Registrierung fehlgeschlagen.')
  }

  function setPassword(resetToken: string, password: string) {
    return runRequest(
      () => setPasswordApi(resetToken, password),
      'Passwort konnte nicht gesetzt werden.',
    )
  }

  function changePassword(oldPassword: string, newPassword: string) {
    return runRequest(
      () => changePasswordApi(oldPassword, newPassword),
      'Passwort konnte nicht geändert werden.',
    )
  }

  function checkRsaSession(request: typeof verifyApi, fallbackError: string) {
    const sessionEmail = email.value
    const sessionKey = privateKey
    if (!sessionEmail || !sessionKey) return

    return runRequest(() => request(sessionEmail, sessionKey), fallbackError)
  }

  async function verify() {
    return await checkRsaSession(verifyApi, 'RSA-Sitzung konnte nicht überprüft werden.')
  }

  async function refresh() {
    return await checkRsaSession(refreshApi, 'RSA-Sitzung konnte nicht verlängert werden.')
  }

  async function logout(): Promise<boolean> {
    const sessionEmail = email.value
    const sessionKey = privateKey
    const version = sessionVersion

    const success = await runRequest(async () => {
      if (sessionEmail && sessionKey) {
        try {
          await logoutApi(sessionEmail, sessionKey)
        } catch (cause) {
          if (!(cause instanceof ApiError) || cause.status !== 401) throw cause
        }
      }

      if (version !== sessionVersion) return false

      clearSession()
      return true
    }, 'Abmeldung fehlgeschlagen.')

    return success === true
  }

  return {
    loading,
    error,
    user,
    token,
    email,
    isAuth,
    isAdmin,
    login,
    logout,
    verify,
    refresh,
    invalidateSession,
    getMe,
    register,
    setPassword,
    changePassword,
    restoreSession,
  }
})
