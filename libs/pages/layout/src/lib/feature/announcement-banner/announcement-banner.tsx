import { useState } from 'react'
import { Banner, Icon } from '@qovery/shared/ui'
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
    <div className="relative">
      <Banner
        color={color}
        buttonLabel={hasActionButton ? buttonLabel : undefined}
        buttonIconRight={hasActionButton ? 'arrow-up-right-from-square' : undefined}
        onClickButton={hasActionButton ? handleActionButtonClick : undefined}
      >
        {title && <strong className="mr-2">{title}</strong>}
        {message}
      </Banner>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-black/10"
          aria-label="Dismiss"
        >
          <Icon name="icon-solid-xmark" className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default AnnouncementBanner
