import { type VariantProps, cva } from 'class-variance-authority'
import { type PropsWithChildren, forwardRef } from 'react'
import { type IconEnum } from '@qovery/shared/enums'
import ButtonLegacy, { ButtonSize, ButtonStyle } from '../buttons/button-legacy/button-legacy'
import { type IconAwesomeEnum } from '../icon/icon-awesome.enum'

const bannerVariants = cva('', {
  variants: {
    color: {
      brand: ['bg-brand-500', 'text-white'],
      yellow: ['bg-yellow-500', 'text-yellow-900'],
    },
  },
})

const buttonVariants = cva('ml-4', {
  variants: {
    color: {
      brand: ['!bg-brand-400/50', 'hover:!bg-brand-400/75', '!text-white'],
      yellow: ['!bg-yellow-600/50', 'hover:!bg-yellow-600/75', '!text-yellow-900'],
    },
  },
})

export interface BannerProps extends VariantProps<typeof bannerVariants> {
  buttonLabel?: string
  buttonIconRight?: IconAwesomeEnum | IconEnum | string
  onClickButton?: () => void
}

export const Banner = forwardRef<HTMLDivElement, PropsWithChildren<BannerProps>>(function Banner(
  { children, buttonLabel, buttonIconRight, onClickButton, color = 'yellow' },
  forwardedRef
) {
  return (
    <div data-testid="banner" className={bannerVariants({ color })}>
      <div className="flex h-10 items-center justify-center font-medium text-sm" ref={forwardedRef}>
        {children}
        {buttonLabel && (
          <ButtonLegacy
            style={ButtonStyle.RAISED}
            size={ButtonSize.TINY}
            className={buttonVariants({ color })}
            iconRight={buttonIconRight}
            onClick={onClickButton}
          >
            {buttonLabel}
          </ButtonLegacy>
        )}
      </div>
    </div>
  )
})

export default Banner
