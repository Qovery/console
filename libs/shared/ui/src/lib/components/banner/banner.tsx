import { type PropsWithChildren } from 'react'
import { type IconEnum } from '@qovery/shared/enums'
import ButtonLegacy, { ButtonSize, ButtonStyle } from '../buttons/button-legacy/button-legacy'
import { type IconAwesomeEnum } from '../icon/icon-awesome.enum'

export interface BannerProps {
  bannerStyle?: BannerStyle
  buttonLabel?: string
  buttonIconRight?: IconAwesomeEnum | IconEnum | string
  onClickButton?: () => void
}

export enum BannerStyle {
  WARNING = 'WARNING',
  PRIMARY = 'PRIMARY',
}

export function Banner(props: PropsWithChildren<BannerProps>) {
  const { children, bannerStyle = BannerStyle.WARNING } = props

  let classNameStyle: string
  let classNameButton: string

  switch (bannerStyle) {
    case BannerStyle.PRIMARY:
      classNameStyle = `bg-brand-500 text-white`
      classNameButton = '!bg-brand-400/50 hover:!bg-brand-400/75 !text-white'
      break
    case BannerStyle.WARNING:
    default:
      classNameStyle = `bg-yellow-500 text-yellow-900`
      classNameButton = '!bg-yellow-600/50 hover:!bg-yellow-600/75 !text-yellow-900'
      break
  }

  return (
    <div data-testid="banner" className={`${classNameStyle || ''}`}>
      <div className="flex h-10 items-center justify-center font-medium text-sm">
        {children}
        {props.buttonLabel && (
          <ButtonLegacy
            style={ButtonStyle.RAISED}
            size={ButtonSize.TINY}
            className={`ml-4 ${classNameButton || ''}`}
            iconRight={props.buttonIconRight}
            onClick={props.onClickButton}
          >
            {props.buttonLabel}
          </ButtonLegacy>
        )}
      </div>
    </div>
  )
}

export default Banner
