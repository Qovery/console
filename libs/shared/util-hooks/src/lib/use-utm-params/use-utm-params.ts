import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface UtmParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

const UTM_KEYS: (keyof UtmParams)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

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

export function useUtmParams(): UtmParams {
  const [searchParams] = useSearchParams()

  const utmParams = useMemo(() => getUtmParams(searchParams), [searchParams])

  return utmParams
}

export function useCaptureUtmParams() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    UTM_KEYS.forEach((key) => {
      const value = params.get(key)
      if (value) {
        localStorage.setItem(key, value)
      }
    })
  }, [])
}
