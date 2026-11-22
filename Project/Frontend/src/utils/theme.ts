export type ThemePreference = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'cadence-theme'
let systemThemeListener: (() => void) | null = null

export function getThemePreference(): ThemePreference {
  const preference = localStorage.getItem(THEME_STORAGE_KEY)
  return preference === 'light' || preference === 'dark' || preference === 'system'
    ? preference
    : 'light'
}

export function applyThemePreference(preference: ThemePreference): void {
  localStorage.setItem(THEME_STORAGE_KEY, preference)

  systemThemeListener?.()
  systemThemeListener = null

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const applyResolvedTheme = () => {
    const resolvedTheme =
      preference === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : preference

    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.style.colorScheme = resolvedTheme
  }

  applyResolvedTheme()

  if (preference === 'system') {
    const listener = () => applyResolvedTheme()
    mediaQuery.addEventListener('change', listener)
    systemThemeListener = () => mediaQuery.removeEventListener('change', listener)
  }
}

export function initializeTheme(): void {
  applyThemePreference(getThemePreference())
}
