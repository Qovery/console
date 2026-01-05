import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type VariantProps, cva } from 'class-variance-authority'
import { type PropsWithChildren, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Button from '../button/button'
import Icon from '../icon/icon'

const bannerVariants = cva('flex h-10 items-center justify-center text-sm font-medium', {
  variants: {
    color: {
      brand: ['bg-brand-500', 'text-white'],
      yellow: ['bg-yellow-500', 'text-yellow-900'],
      purple: ['bg-purple-500', 'text-white'],
      red: ['bg-red-500', 'text-white'],
    },
  },
})

const buttonVariants = cva('ml-4', {
  variants: {
    color: {
      brand: ['!bg-brand-400/50', 'hover:!bg-brand-400/75', '!text-white'],
      yellow: ['!bg-yellow-600/50', 'hover:!bg-yellow-600/75', '!text-yellow-900'],
      purple: ['!bg-purple-400', 'hover:!bg-purple-600', '!text-white'],
      red: ['!bg-red-400', 'hover:!bg-red-600', '!text-white'],
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
        <Button type="button" className={twMerge('gap-1', buttonVariants({ color }))} onClick={onClickButton}>
          {buttonLabel}
          {buttonIconRight && <Icon iconName={buttonIconRight} />}
        </Button>
      )}
      {dismissible && (
        <Button
          type="button"
          className={twMerge(
            'absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 justify-center',
            buttonVariants({ color })
          )}
          onClick={onDismiss}
        >
          <Icon iconName="xmark" iconStyle="solid" />
        </Button>
      )}
    </div>
  )
})

export default Banner
