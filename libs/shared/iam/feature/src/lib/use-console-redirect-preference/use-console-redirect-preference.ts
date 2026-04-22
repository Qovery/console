import { useCallback, useEffect, useState } from 'react'

export type ConsolePreference = 'legacy' | 'new'

const CONSOLE_PREFERENCE_STORAGE_KEY = 'qovery-console-preference'
const CONSOLE_PREFERENCE_COOKIE_KEY = 'qovery-console-preference'
const CONSOLE_PREFERENCE_CHANGED_EVENT = 'qovery-console-preference-changed'
const LEGACY_CONSOLE_BYPASS_QUERY_PARAM = 'legacy'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

function isConsolePreference(value: string | null | undefined): value is ConsolePreference {
  return value === 'legacy' || value === 'new'
}

function getCookieDomain(hostname: string): string | undefined {
  return hostname.endsWith('.qovery.com') ? '.qovery.com' : undefined
}

function readCookieValue(cookieName: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${cookieName}=`))
    ?.split('=')
    .slice(1)
    .join('=')

  return cookie ? decodeURIComponent(cookie) : null
}

function persistConsolePreference(preference: ConsolePreference) {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(CONSOLE_PREFERENCE_STORAGE_KEY, preference)

  const domain = getCookieDomain(window.location.hostname)
  document.cookie = `${CONSOLE_PREFERENCE_COOKIE_KEY}=${encodeURIComponent(preference)}; Path=/; Max-Age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax${
    domain ? `; Domain=${domain}` : ''
  }`
  window.dispatchEvent(new CustomEvent<ConsolePreference>(CONSOLE_PREFERENCE_CHANGED_EVENT, { detail: preference }))
}

export function getStoredConsolePreference(): ConsolePreference {
  if (typeof window === 'undefined') {
    return 'legacy'
  }

  const cookiePreference = readCookieValue(CONSOLE_PREFERENCE_COOKIE_KEY)

  if (isConsolePreference(cookiePreference)) {
    return cookiePreference
  }

  const localStoragePreference = localStorage.getItem(CONSOLE_PREFERENCE_STORAGE_KEY)

  if (isConsolePreference(localStoragePreference)) {
    return localStoragePreference
  }

  return 'legacy'
}

export function getNewConsoleUrl(currentUrl = window.location.href): string | null {
  const url = new URL(currentUrl)

  if (!url.hostname.startsWith('console.')) {
    return null
  }

  url.hostname = url.hostname.replace(/^console\./, 'new-console.')

  return url.toString()
}

export function getLegacyConsoleUrl(currentUrl = window.location.href): string | null {
  const url = new URL(currentUrl)

  if (!url.hostname.startsWith('new-console.')) {
    return null
  }

  url.hostname = url.hostname.replace(/^new-console\./, 'console.')

  return url.toString()
}

export function shouldBypassLegacyConsoleRedirect(search = window.location.search): boolean {
  const searchParams = new URLSearchParams(search)
  return searchParams.get(LEGACY_CONSOLE_BYPASS_QUERY_PARAM) === '1'
}

export function useConsoleRedirectPreference() {
  const [preferredConsole, setPreferredConsoleState] = useState<ConsolePreference>(() => getStoredConsolePreference())

  useEffect(() => {
    const syncConsolePreference = (event?: Event) => {
      const preference = (event as CustomEvent<ConsolePreference> | undefined)?.detail
      setPreferredConsoleState(isConsolePreference(preference) ? preference : getStoredConsolePreference())
    }

    const syncConsolePreferenceFromStorage = (event: StorageEvent) => {
      if (event.key === CONSOLE_PREFERENCE_STORAGE_KEY) {
        syncConsolePreference()
      }
    }

    window.addEventListener(CONSOLE_PREFERENCE_CHANGED_EVENT, syncConsolePreference)
    window.addEventListener('storage', syncConsolePreferenceFromStorage)

    return () => {
      window.removeEventListener(CONSOLE_PREFERENCE_CHANGED_EVENT, syncConsolePreference)
      window.removeEventListener('storage', syncConsolePreferenceFromStorage)
    }
  }, [])

  const setPreferredConsole = useCallback((preference: ConsolePreference) => {
    persistConsolePreference(preference)
    setPreferredConsoleState(preference)
  }, [])

  const setIsNewConsoleDefault = useCallback(
    (value: boolean) => {
      setPreferredConsole(value ? 'new' : 'legacy')
    },
    [setPreferredConsole]
  )

  return {
    preferredConsole,
    isNewConsoleDefault: preferredConsole === 'new',
    setPreferredConsole,
    setIsNewConsoleDefault,
  }
}
