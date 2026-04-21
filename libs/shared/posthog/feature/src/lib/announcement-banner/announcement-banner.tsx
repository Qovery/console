import { useState } from 'react'
import { Banner, Button, Icon } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import {
  type AnnouncementBannerPayload,
  useAnnouncementBanner,
} from '../hooks/use-announcement-banner/use-announcement-banner'

const VARIANT_TO_COLOR_MAP: Record<AnnouncementBannerPayload['variant'], 'brand' | 'yellow' | 'red'> = {
  info: 'brand',
  warning: 'yellow',
  error: 'red',
}

const VARIANT_PRIORITY: Record<AnnouncementBannerPayload['variant'], number> = {
  error: 0,
  warning: 1,
  info: 2,
}

const BANNER_ICON_BUTTON_CLASSNAME = 'flex h-7 w-7 items-center justify-center p-0'

const LEGACY_DISMISSED_KEY = 'announcement_banner_dismissed'
const DISMISSED_MESSAGES_KEY = 'announcement_banners_dismissed'

function isLegacyDismissed(message: string): boolean {
  if (typeof window === 'undefined') return false

  const raw = localStorage.getItem(LEGACY_DISMISSED_KEY)
  if (!raw) return false
  try {
    return JSON.parse(raw) === message
  } catch {
    return false
  }
}

function getBannerKey(banner: AnnouncementBannerPayload): string {
  return banner.id ?? banner.message
}

export function AnnouncementBanner() {
  const banners = useAnnouncementBanner()
  const [dismissedMessages, setDismissedMessages] = useLocalStorage<string[]>(DISMISSED_MESSAGES_KEY, [])
  const [selectedBannerKey, setSelectedBannerKey] = useState<string>()

  function isBannerDismissed(banner: AnnouncementBannerPayload): boolean {
    const key = getBannerKey(banner)
    if (dismissedMessages?.includes(key)) return true
    return isLegacyDismissed(banner.message)
  }

  const visibleBanners = banners
    .filter((b) => !b.dismissible || !isBannerDismissed(b))
    .sort((a, b) => VARIANT_PRIORITY[a.variant] - VARIANT_PRIORITY[b.variant])

  if (visibleBanners.length === 0) return null

  const selectedBannerIndex =
    selectedBannerKey === undefined
      ? -1
      : visibleBanners.findIndex((visibleBanner) => getBannerKey(visibleBanner) === selectedBannerKey)
  const currentIndex = selectedBannerIndex === -1 ? 0 : selectedBannerIndex
  const banner = visibleBanners[currentIndex]
  const { title, message, variant, dismissible, buttonLabel, buttonUrl } = banner
  const currentBannerKey = getBannerKey(banner)
  const color = VARIANT_TO_COLOR_MAP[variant]
  const hasActionButton = Boolean(buttonLabel && buttonUrl)
  const hasMultiple = visibleBanners.length > 1
  const usesBannerDismissButton = dismissible && !hasMultiple

  const handlePrev = () => {
    const previousIndex = (currentIndex - 1 + visibleBanners.length) % visibleBanners.length
    setSelectedBannerKey(getBannerKey(visibleBanners[previousIndex]))
  }

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % visibleBanners.length
    setSelectedBannerKey(getBannerKey(visibleBanners[nextIndex]))
  }

  const handleDismiss = () => {
    if (visibleBanners.length === 1) {
      setSelectedBannerKey(undefined)
    } else if (currentIndex >= visibleBanners.length - 1) {
      setSelectedBannerKey(getBannerKey(visibleBanners[currentIndex - 1]))
    } else {
      setSelectedBannerKey(getBannerKey(visibleBanners[currentIndex + 1]))
    }

    if (!dismissedMessages?.includes(currentBannerKey)) {
      setDismissedMessages([...(dismissedMessages ?? []), currentBannerKey])
    }
  }

  return (
    <Banner
      color={color}
      buttonLabel={hasActionButton ? buttonLabel : undefined}
      buttonIconRight={hasActionButton ? 'arrow-up-right-from-square' : undefined}
      onClickButton={hasActionButton ? () => window.open(buttonUrl, '_blank', 'noopener,noreferrer') : undefined}
      dismissible={usesBannerDismissButton}
      onDismiss={usesBannerDismissButton ? handleDismiss : undefined}
    >
      {title && <strong className="mr-2">{title}</strong>}
      {message}
      {hasMultiple && (
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
          <Button
            type="button"
            className={BANNER_ICON_BUTTON_CLASSNAME}
            color={color}
            onClick={handlePrev}
            aria-label="Previous"
          >
            <Icon iconName="chevron-left" />
          </Button>
          <span className="min-w-[28px] text-center text-xs">
            {currentIndex + 1}/{visibleBanners.length}
          </span>
          <Button
            type="button"
            className={BANNER_ICON_BUTTON_CLASSNAME}
            color={color}
            onClick={handleNext}
            aria-label="Next"
          >
            <Icon iconName="chevron-right" />
          </Button>
          {dismissible && <div className="mx-3 h-4 w-px bg-current opacity-20" />}
          {dismissible && (
            <Button
              type="button"
              className={BANNER_ICON_BUTTON_CLASSNAME}
              color={color}
              onClick={handleDismiss}
              aria-label="Dismiss"
            >
              <Icon iconName="xmark" />
            </Button>
          )}
        </div>
      )}
    </Banner>
  )
}

export default AnnouncementBanner
