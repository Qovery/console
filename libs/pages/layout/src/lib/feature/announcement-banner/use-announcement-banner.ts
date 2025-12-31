import posthog from 'posthog-js'
import { useEffect, useState } from 'react'

export interface AnnouncementBannerPayload {
  title?: string
  message: string
  variant: 'info' | 'warning' | 'error'
  dismissible: boolean
}

export function useAnnouncementBanner() {
  const [bannerData, setBannerData] = useState<AnnouncementBannerPayload | null>(null)

  useEffect(() => {
    const checkBanner = () => {
      const isEnabled = posthog.isFeatureEnabled('banner_announcement')

      if (!isEnabled) {
        setBannerData(null)
        return
      }

      const payload = posthog.getFeatureFlagPayload('banner_announcement')

      if (!payload || typeof payload !== 'object') {
        setBannerData(null)
        return
      }

      const typedPayload = payload as Record<string, unknown>

      if (
        typeof typedPayload['message'] === 'string' &&
        (typedPayload['variant'] === 'info' ||
          typedPayload['variant'] === 'warning' ||
          typedPayload['variant'] === 'error') &&
        typeof typedPayload['dismissible'] === 'boolean'
      ) {
        setBannerData({
          title: typeof typedPayload['title'] === 'string' ? typedPayload['title'] : undefined,
          message: typedPayload['message'],
          variant: typedPayload['variant'],
          dismissible: typedPayload['dismissible'],
        })
      } else {
        setBannerData(null)
      }
    }

    checkBanner()

    posthog.onFeatureFlags(checkBanner)
  }, [])

  return bannerData
}
