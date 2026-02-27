import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export const TRACKING_PARAMS_STORAGE_KEY = 'tracking_params'

/** Returns all URL search params as a record (dynamic keys only). */
export function getTrackingParams(searchParams: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    if (value) result[key] = value
  })
  return result
}

/** Returns all URL params stored at landing. */
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
  return {}
}

export function useTrackingParams(): Record<string, string> {
  const [searchParams] = useSearchParams()
  return useMemo(() => getTrackingParams(searchParams), [searchParams])
}

// Auth0 OAuth callback params — excluded from tracking storage and from payloads sent to HubSpot
const OAUTH_PARAMS = ['code', 'state']

/** Persists URL tracking params to localStorage. Merges with existing so Auth0 redirect (?code=&state=) does not overwrite UTMs. Excludes Auth0 code/state from storage. */
export function useCaptureUtmParams() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromUrl: Record<string, string> = {}
    params.forEach((value, key) => {
      if (value && !OAUTH_PARAMS.includes(key)) fromUrl[key] = value
    })
    const existing = getStoredTrackingParams()
    const merged = { ...existing, ...fromUrl }
    if (Object.keys(merged).length > 0) {
      localStorage.setItem(TRACKING_PARAMS_STORAGE_KEY, JSON.stringify(merged))
    }
  }, [])
}
