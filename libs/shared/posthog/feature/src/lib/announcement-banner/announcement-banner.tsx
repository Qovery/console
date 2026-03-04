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

function getBannerStorageKey(message: string, variant: string): string {
  const content = `${variant}:${message}`
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) - hash + content.charCodeAt(i)
    hash |= 0
  }
  return `announcement_banner_dismissed_${Math.abs(hash)}`
}

export function AnnouncementBanner() {
  const bannerData = useAnnouncementBanner()
  const [manuallyDismissed, setManuallyDismissed] = useState(false)

  const dismissKey = bannerData ? getBannerStorageKey(bannerData.message, bannerData.variant) : null
  const isDismissed = manuallyDismissed || Boolean(dismissKey && localStorage.getItem(dismissKey) === 'true')

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
    if (dismissKey) {
      localStorage.setItem(dismissKey, 'true')
    }
    setManuallyDismissed(true)
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
