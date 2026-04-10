import posthog from 'posthog-js'
import { useEffect, useState } from 'react'

export interface AnnouncementBannerPayload {
  id?: string
  title?: string
  message: string
  variant: 'info' | 'warning' | 'error'
  dismissible: boolean
  buttonLabel?: string
  buttonUrl?: string
}

const BANNER_FLAG = 'banners-annoucement'

function validateBannerItem(item: unknown): AnnouncementBannerPayload | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null

  const p = item as Record<string, unknown>

  if (
    typeof p['message'] === 'string' &&
    (p['variant'] === 'info' || p['variant'] === 'warning' || p['variant'] === 'error') &&
    typeof p['dismissible'] === 'boolean'
  ) {
    return {
      id: typeof p['id'] === 'string' ? p['id'] : undefined,
      title: typeof p['title'] === 'string' ? p['title'] : undefined,
      message: p['message'],
      variant: p['variant'],
      dismissible: p['dismissible'],
      buttonLabel: typeof p['buttonLabel'] === 'string' ? p['buttonLabel'] : undefined,
      buttonUrl: typeof p['buttonUrl'] === 'string' ? p['buttonUrl'] : undefined,
    }
  }

  return null
}

export function useAnnouncementBanner(): AnnouncementBannerPayload[] {
  const [banners, setBanners] = useState<AnnouncementBannerPayload[]>([])

  useEffect(() => {
    const checkBanner = () => {
      const isEnabled = posthog.isFeatureEnabled(BANNER_FLAG)

      if (!isEnabled) {
        setBanners([])
        return
      }

      const rawPayload = posthog.getFeatureFlagPayload(BANNER_FLAG)

      let payload: unknown = rawPayload
      if (typeof rawPayload === 'string') {
        try {
          payload = JSON.parse(rawPayload)
        } catch {
          setBanners([])
          return
        }
      }

      if (!Array.isArray(payload)) {
        setBanners([])
        return
      }

      const validBanners = payload.map(validateBannerItem).filter((b): b is AnnouncementBannerPayload => b !== null)

      setBanners(validBanners)
    }

    checkBanner()

    posthog.onFeatureFlags(checkBanner)
  }, [])

  return banners
}
