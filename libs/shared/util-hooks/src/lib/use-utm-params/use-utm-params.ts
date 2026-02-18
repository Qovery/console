import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface UtmParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string
}

const UTM_KEYS: (keyof UtmParams)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid']

export const TRACKING_PARAMS_STORAGE_KEY = 'tracking_params'

export function getUtmParams(searchParams: URLSearchParams): UtmParams {
  const utmParams: UtmParams = {}

  for (const key of UTM_KEYS) {
    const value = searchParams.get(key)
    if (value) {
      utmParams[key] = value
    }
  }

  return utmParams
}

/** Returns all URL params stored at landing. Fallback: legacy UTM/gclid keys from localStorage. */
export function getStoredTrackingParams(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TRACKING_PARAMS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      return Object.fromEntries(
        Object.entries(parsed).filter(
          (entry): entry is [string, string] =>
            typeof entry[0] === 'string' && typeof entry[1] === 'string' && entry[1].length > 0
        )
      )
    }
  } catch {
    // ignore invalid JSON
  }
  const fallback: Record<string, string> = {}
  UTM_KEYS.forEach((key) => {
    const value = localStorage.getItem(key)
    if (value) fallback[key] = value
  })
  return fallback
}

export function useUtmParams(): UtmParams {
  const [searchParams] = useSearchParams()

  const utmParams = useMemo(() => getUtmParams(searchParams), [searchParams])

  return utmParams
}

/** Persists all current URL search params to localStorage for later use (e.g. HubSpot signup). */
export function useCaptureUtmParams() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const all: Record<string, string> = {}
    params.forEach((value, key) => {
      if (value) all[key] = value
    })
    if (Object.keys(all).length > 0) {
      localStorage.setItem(TRACKING_PARAMS_STORAGE_KEY, JSON.stringify(all))
    }
    UTM_KEYS.forEach((key) => {
      const value = params.get(key)
      if (value) localStorage.setItem(key, value)
    })
  }, [])
}
