import { IconEnum } from '@qovery/shared/enums'
import Button, { ButtonSize, ButtonStyle } from '../buttons/button/button'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

export interface BannerProps {
  children: React.ReactNode
  bannerStyle?: BannerStyle
  buttonLabel?: string
  buttonIconRight?: IconAwesomeEnum | IconEnum | string
  onClickButton?: () => void
}

export enum BannerStyle {
  WARNING = 'WARNING',
  PRIMARY = 'PRIMARY',
}

export function Banner(props: BannerProps) {
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
      classNameStyle = `bg-warning-500 text-warning-900`
      classNameButton = '!bg-warning-600/50 hover:!bg-warning-600/75 !text-warning-900'
      break
  }

  return (
    <div data-testid="banner" className={`${classNameStyle || ''}`}>
      <div className="flex h-10 items-center justify-center font-medium text-sm">
        {children}
        {props.buttonLabel && (
          <Button
            style={ButtonStyle.RAISED}
            size={ButtonSize.TINY}
            className={`ml-4 ${classNameButton || ''}`}
            iconRight={props.buttonIconRight}
            onClick={props.onClickButton}
          >
            {props.buttonLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

export default Banner
