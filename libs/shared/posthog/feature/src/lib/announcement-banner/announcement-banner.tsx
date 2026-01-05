import { useState } from 'react'
import { Banner } from '@qovery/shared/ui'
import {
  type AnnouncementBannerPayload,
  useAnnouncementBanner,
} from '../hooks/use-announcement-banner/use-announcement-banner'

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

  const { title, message, variant, dismissible, buttonLabel, buttonUrl } = bannerData
  const color = VARIANT_TO_COLOR_MAP[variant]

  const hasActionButton = buttonLabel && buttonUrl

  const handleActionButtonClick = () => {
    if (hasActionButton) {
      window.open(buttonUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  return (
    <Banner
      color={color}
      buttonLabel={hasActionButton ? buttonLabel : undefined}
      buttonIconRight={hasActionButton ? 'arrow-up-right-from-square' : undefined}
      onClickButton={hasActionButton ? handleActionButtonClick : undefined}
      dismissible={dismissible}
      onDismiss={handleDismiss}
    >
      {title && <strong className="mr-2">{title}</strong>}
      {message}
    </Banner>
  )
}

export default AnnouncementBanner
