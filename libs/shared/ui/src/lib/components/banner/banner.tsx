import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type VariantProps, cva } from 'class-variance-authority'
import { type PropsWithChildren, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Button from '../button/button'
import Icon from '../icon/icon'

const bannerVariants = cva('flex h-10 items-center justify-center text-sm font-medium', {
  variants: {
    color: {
      brand: ['bg-surface-brand-component', 'text-brand'],
      yellow: ['bg-surface-warning-component', 'text-warning'],
      red: ['bg-surface-negative-component', 'text-negative'],
    },
  },
})
export interface BannerProps extends VariantProps<typeof bannerVariants> {
  buttonLabel?: string
  buttonIconRight?: IconName
  onClickButton?: () => void
  dismissible?: boolean
  onDismiss?: () => void
}

export const Banner = forwardRef<HTMLDivElement, PropsWithChildren<BannerProps>>(function Banner(
  { children, buttonLabel, buttonIconRight, onClickButton, color = 'yellow', dismissible = false, onDismiss },
  forwardedRef
) {
  return (
    <div className={twMerge(bannerVariants({ color }), 'relative')} ref={forwardedRef}>
      {children}
      {buttonLabel && (
        <Button type="button" className="ml-4 gap-1" variant="solid" color={color} onClick={onClickButton}>
          {buttonLabel}
          {buttonIconRight && <Icon iconName={buttonIconRight} />}
        </Button>
      )}
      {dismissible && (
        <Button
          type="button"
          variant="plain"
          color={color}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 justify-center"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <Icon iconName="xmark" iconStyle="solid" />
        </Button>
      )}
    </div>
  )
})

export default Banner
