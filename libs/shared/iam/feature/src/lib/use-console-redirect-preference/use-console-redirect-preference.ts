import { useCallback, useEffect, useState } from 'react'

export type ConsolePreference = 'legacy' | 'new'

// Legacy key kept only to purge stale values written before the cookie-only migration.
const LEGACY_CONSOLE_PREFERENCE_STORAGE_KEY = 'qovery-console-preference'
const CONSOLE_PREFERENCE_COOKIE_KEY = 'qovery-console-preference'
const CONSOLE_PREFERENCE_CHANGED_EVENT = 'qovery-console-preference-changed'
const LEGACY_CONSOLE_BYPASS_QUERY_PARAM = 'legacy'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365
const ORGANIZATION_PATH_PATTERN = '/organization/[^/]+'
const PROJECT_PATH_PATTERN = `${ORGANIZATION_PATH_PATTERN}/project/[^/]+`
const ENVIRONMENT_PATH_PATTERN = `${PROJECT_PATH_PATTERN}/environment/[^/]+`

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

// localStorage is per-origin and does NOT propagate between `console.qovery.com` and
// `new-console.qovery.com`. Any value stored under this key by older builds can leave
// users ping-ponging across subdomains, so we proactively remove it on read.
function purgeLegacyLocalStorageKey() {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.removeItem(LEGACY_CONSOLE_PREFERENCE_STORAGE_KEY)
  } catch {
    // ignore (Safari private mode, quota, ...)
  }
}

function persistConsolePreference(preference: ConsolePreference) {
  if (typeof window === 'undefined') {
    return
  }

  purgeLegacyLocalStorageKey()

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

  // The cookie (scoped to `.qovery.com`) is the only source of truth that works across
  // `console.qovery.com` and `new-console.qovery.com`. localStorage is intentionally ignored.
  purgeLegacyLocalStorageKey()

  const cookiePreference = readCookieValue(CONSOLE_PREFERENCE_COOKIE_KEY)

  if (isConsolePreference(cookiePreference)) {
    return cookiePreference
  }

  return 'legacy'
}

export function getNewConsolePathname(pathname: string): string {
  return pathname
    .replace(/^\/user\/general\/?$/, '/organization')
    .replace(new RegExp(`^(${ORGANIZATION_PATH_PATTERN})/alerting(/|$)`), '$1/alerts$2')
    .replace(new RegExp(`^(${ORGANIZATION_PATH_PATTERN})/audit-logs/general(/|$)`), '$1/audit-logs$2')
    .replace(new RegExp(`^(${ORGANIZATION_PATH_PATTERN})/settings/api(/|$)`), '$1/settings/api-token$2')
    .replace(new RegExp(`^(${ORGANIZATION_PATH_PATTERN})/settings/credentials(/|$)`), '$1/settings/cloud-credentials$2')
    .replace(
      new RegExp(`^(${ORGANIZATION_PATH_PATTERN})/settings/billing-detail(/|$)`),
      '$1/settings/billing-details$2'
    )
    .replace(new RegExp(`^(${ORGANIZATION_PATH_PATTERN})/settings/webhooks(/|$)`), '$1/settings/webhook$2')
    .replace(
      new RegExp(`^(${ORGANIZATION_PATH_PATTERN})/settings/([^/]+)/project/(general|danger-zone)(/|$)`),
      '$1/project/$2/settings/$3$4'
    )
    .replace(new RegExp(`^(${ORGANIZATION_PATH_PATTERN})/clusters/general(/|$)`), '$1/clusters$2')
    .replace(new RegExp(`^(${ORGANIZATION_PATH_PATTERN})/clusters/new(/|$)`), '$1/cluster/new$2')
    .replace(
      new RegExp(`^(${ORGANIZATION_PATH_PATTERN})/clusters/create/([^/]+)/access(/|$)`),
      '$1/cluster/create/$2/general$3'
    )
    .replace(new RegExp(`^(${ORGANIZATION_PATH_PATTERN})/clusters/create(/|$)`), '$1/cluster/create$2')
    .replace(new RegExp(`^(${ORGANIZATION_PATH_PATTERN}/cluster/[^/]+)/logs(/|$)`), '$1/cluster-logs$2')
    .replace(new RegExp(`^(${PROJECT_PATH_PATTERN})/environments/general(/|$)`), '$1/overview$2')
    .replace(new RegExp(`^(${PROJECT_PATH_PATTERN})/environments/variables(/|$)`), '$1/variables$2')
    .replace(new RegExp(`^(${PROJECT_PATH_PATTERN})/environments/deployment-rules(/|$)`), '$1/deployment-rules$2')
    .replace(new RegExp(`^(${ENVIRONMENT_PATH_PATTERN})/(environments|services)/general(/|$)`), '$1/overview$3')
    .replace(new RegExp(`^(${ENVIRONMENT_PATH_PATTERN})/services/deployments(/|$)`), '$1/deployments$2')
    .replace(new RegExp(`^(${ENVIRONMENT_PATH_PATTERN})/services/variables(/|$)`), '$1/variables$2')
    .replace(
      new RegExp(`^(${ENVIRONMENT_PATH_PATTERN})/services/settings/rules(/|$)`),
      '$1/settings/deployment-rules$2'
    )
    .replace(new RegExp(`^(${ENVIRONMENT_PATH_PATTERN})/services/settings/pipeline(/|$)`), '$1/overview/pipeline$2')
    .replace(new RegExp(`^(${ENVIRONMENT_PATH_PATTERN})/services/settings(/|$)`), '$1/settings$2')
    .replace(
      new RegExp(`^(${ENVIRONMENT_PATH_PATTERN})/logs/([^/]+)/service-logs(/|$)`),
      '$1/service/$2/service-logs$3'
    )
    .replace(
      new RegExp(`^(${ENVIRONMENT_PATH_PATTERN})/logs/([^/]+)/deployment-logs/([^/]+)(/|$)`),
      '$1/service/$2/deployments/logs/$3$4'
    )
    .replace(
      new RegExp(`^(${ENVIRONMENT_PATH_PATTERN})/logs/pre-check-logs/([^/]+)(/|$)`),
      '$1/deployment/$2/pre-check-logs$3'
    )
    .replace(new RegExp(`^(${ENVIRONMENT_PATH_PATTERN})/logs(/stages/[^/]+|/stages)?(/|$)`), '$1/deployments$3')
    .replace(new RegExp(`^(${ENVIRONMENT_PATH_PATTERN})/(application|database)/([^/]+)(/|$)`), '$1/service/$3$4')
    .replace(new RegExp(`^(${ENVIRONMENT_PATH_PATTERN})/services(/|$)`), '$1/service$2')
    .replace(new RegExp(`^(${ENVIRONMENT_PATH_PATTERN}/service/[^/]+)/general(/|$)`), '$1/overview$2')
    .replace(
      new RegExp(`^(${ENVIRONMENT_PATH_PATTERN}/service/[^/]+)/monitoring/create/alerts/metric/([^/]+)(/|$)`),
      '$1/monitoring/alerts/create/metric/$2$3'
    )
    .replace(
      new RegExp(`^(${ENVIRONMENT_PATH_PATTERN}/service/[^/]+)/monitoring/create/alerts(/|$)`),
      '$1/monitoring/alerts$2'
    )
    .replace(
      new RegExp(`^(${ENVIRONMENT_PATH_PATTERN}/service/[^/]+)/monitoring/metric/([^/]+)(/|$)`),
      '$1/monitoring/alerts/create/metric/$2$3'
    )
    .replace(new RegExp(`^(${ENVIRONMENT_PATH_PATTERN}/service/create/[^/]+)/post(/|$)`), '$1/summary$2')
    .replace(new RegExp(`^(${ENVIRONMENT_PATH_PATTERN}/service/create/[^/]+)/variable(/|$)`), '$1/variables$2')
    .replace(new RegExp(`^(${ENVIRONMENT_PATH_PATTERN}/service/create/[^/]+)/introduction(/|$)`), '$1/general$2')
    .replace(
      new RegExp(`^(${ENVIRONMENT_PATH_PATTERN}/service/create/helm)/values-override/repository-and-yaml(/|$)`),
      '$1/values-override-file$2'
    )
    .replace(
      new RegExp(`^(${ENVIRONMENT_PATH_PATTERN}/service/create/helm)/values-override/arguments(/|$)`),
      '$1/values-override-arguments$2'
    )
    .replace(
      new RegExp(`^(${ENVIRONMENT_PATH_PATTERN}/service/create/terraform)/basic-configuration(/|$)`),
      '$1/terraform-configuration$2'
    )
}

function getNewConsoleRedirectPathname(pathname: string): string {
  return /^\/organization\/?$/.test(pathname) ? '/' : pathname
}

export function getNewConsoleUrl(currentUrl = window.location.href): string | null {
  const url = new URL(currentUrl)

  if (!url.hostname.startsWith('console.')) {
    return null
  }

  url.hostname = url.hostname.replace(/^console\./, 'new-console.')
  url.pathname = getNewConsoleRedirectPathname(getNewConsolePathname(url.pathname))

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

    window.addEventListener(CONSOLE_PREFERENCE_CHANGED_EVENT, syncConsolePreference)

    return () => {
      window.removeEventListener(CONSOLE_PREFERENCE_CHANGED_EVENT, syncConsolePreference)
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
