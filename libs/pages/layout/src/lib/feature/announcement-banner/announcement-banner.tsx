import { useState } from 'react'
import { Banner } from '@qovery/shared/ui'
import { type AnnouncementBannerPayload, useAnnouncementBanner } from './use-announcement-banner'

const VARIANT_TO_COLOR_MAP: Record<AnnouncementBannerPayload['variant'], 'brand' | 'yellow' | 'red'> = {
  info: 'brand',
  warning: 'yellow',
  error: 'red',
}

export function AnnouncementBanner() {
  const bannerData = useAnnouncementBanner()
  const [isDismissed, setIsDismissed] = useState(false)

  if (!bannerData || isDismissed) {
    return null
  }

  const { title, message, variant, dismissible } = bannerData
  const color = VARIANT_TO_COLOR_MAP[variant]

  const handleDismiss = () => {
    if (dismissible) {
      setIsDismissed(true)
    }
  }

  return (
    <Banner
      color={color}
      buttonLabel={dismissible ? 'Dismiss' : undefined}
      buttonIconRight={dismissible ? 'xmark' : undefined}
      onClickButton={handleDismiss}
    >
      {title && <strong className="mr-2">{title}</strong>}
      {message}
    </Banner>
  )
}

export default AnnouncementBanner
