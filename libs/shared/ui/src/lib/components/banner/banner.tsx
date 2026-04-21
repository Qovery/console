import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type PropsWithChildren, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Button from '../button/button'
import Icon from '../icon/icon'

const bannerVariants = cva('flex h-10 items-center justify-center text-sm font-medium', {
  variants: {
    color: {
      brand: ['bg-surface-brand-component', 'text-brand'],
      yellow: ['bg-surface-warning-component', 'text-warning'],
      purple: ['bg-surface-accent1-component', 'text-accent1'],
      red: ['bg-surface-negative-component', 'text-negative'],
    },
  },
})
type BannerDivProps = Omit<ComponentPropsWithoutRef<'div'>, 'color'>

export type BannerColor = NonNullable<VariantProps<typeof bannerVariants>['color']>

// Map banner colors to the subset supported by Button (no `purple` on Button)
const BANNER_TO_BUTTON_COLOR: Record<BannerColor, 'brand' | 'yellow' | 'red'> = {
  brand: 'brand',
  yellow: 'yellow',
  red: 'red',
  purple: 'brand',
}

export interface BannerProps extends BannerDivProps, VariantProps<typeof bannerVariants> {
  buttonLabel?: string
  buttonIconRight?: IconName
  onClickButton?: () => void
  dismissible?: boolean
  onDismiss?: () => void
}

export const Banner = forwardRef<HTMLDivElement, PropsWithChildren<BannerProps>>(function Banner(
  {
    children,
    buttonLabel,
    buttonIconRight,
    onClickButton,
    color = 'yellow',
    dismissible = false,
    onDismiss,
    className,
    ...props
  },
  forwardedRef
) {
  const buttonColor = color ? BANNER_TO_BUTTON_COLOR[color] : 'brand'

  return (
    <div className={twMerge(bannerVariants({ color }), 'relative', className)} ref={forwardedRef} {...props}>
      {children}
      {buttonLabel && (
        <Button type="button" className="ml-4 gap-1" variant="solid" color={buttonColor} onClick={onClickButton}>
          {buttonLabel}
          {buttonIconRight && <Icon iconName={buttonIconRight} />}
        </Button>
      )}
      {dismissible && (
        <Button
          type="button"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center p-0"
          color={buttonColor}
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
