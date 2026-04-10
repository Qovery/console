import { useState } from 'react'
import { Banner, Button, Icon } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
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

const CONTROL_BUTTON_CLASSNAME = 'flex h-7 w-7 items-center justify-center p-0'
const CONTROL_BUTTON_COLOR_CLASSNAME: Record<'brand' | 'yellow' | 'red', string> = {
  brand: 'bg-brand-400/50 hover:bg-brand-400/75 text-white',
  yellow: 'bg-yellow-600/50 hover:bg-yellow-600/75 text-yellow-900',
  red: 'bg-red-400 hover:bg-red-600 text-white',
}

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
  const [currentIndex, setCurrentIndex] = useState(0)

  function isBannerDismissed(banner: AnnouncementBannerPayload): boolean {
    const key = getBannerKey(banner)
    if (dismissedMessages?.includes(key)) return true
    return isLegacyDismissed(banner.message)
  }

  const visibleBanners = banners
    .filter((b) => !b.dismissible || !isBannerDismissed(b))
    .sort((a, b) => VARIANT_PRIORITY[a.variant] - VARIANT_PRIORITY[b.variant])

  const safeIndex = Math.min(currentIndex, Math.max(0, visibleBanners.length - 1))

  if (visibleBanners.length === 0) return null

  const banner = visibleBanners[safeIndex]
  const { title, message, variant, dismissible, buttonLabel, buttonUrl } = banner
  const color = VARIANT_TO_COLOR_MAP[variant]
  const hasActionButton = Boolean(buttonLabel && buttonUrl)
  const hasMultiple = visibleBanners.length > 1
  const usesBannerDismissButton = dismissible && !hasMultiple
  const buttonColorClass = CONTROL_BUTTON_COLOR_CLASSNAME[color]

  const handlePrev = () => setCurrentIndex((i) => (i - 1 + visibleBanners.length) % visibleBanners.length)
  const handleNext = () => setCurrentIndex((i) => (i + 1) % visibleBanners.length)

  const handleDismiss = () => {
    const bannerKey = getBannerKey(banner)

    if (!dismissedMessages?.includes(bannerKey)) {
      setDismissedMessages([...(dismissedMessages ?? []), bannerKey])
    }

    if (safeIndex >= visibleBanners.length - 1) {
      setCurrentIndex(Math.max(0, safeIndex - 1))
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
            className={twMerge(CONTROL_BUTTON_CLASSNAME, buttonColorClass)}
            onClick={handlePrev}
            aria-label="Previous"
          >
            <Icon iconName="chevron-left" iconStyle="solid" />
          </Button>
          <span className="min-w-[28px] text-center text-xs">
            {safeIndex + 1}/{visibleBanners.length}
          </span>
          <Button
            type="button"
            className={twMerge(CONTROL_BUTTON_CLASSNAME, buttonColorClass)}
            onClick={handleNext}
            aria-label="Next"
          >
            <Icon iconName="chevron-right" iconStyle="solid" />
          </Button>
          {dismissible && <div className="mx-3 h-4 w-px bg-current opacity-20" />}
          {dismissible && (
            <Button
              type="button"
              className={twMerge(CONTROL_BUTTON_CLASSNAME, buttonColorClass)}
              onClick={handleDismiss}
              aria-label="Dismiss"
            >
              <Icon iconName="xmark" iconStyle="solid" />
            </Button>
          )}
        </div>
      )}
    </Banner>
  )
}

export default AnnouncementBanner
