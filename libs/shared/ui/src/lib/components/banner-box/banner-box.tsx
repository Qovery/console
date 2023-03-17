import { ReactNode } from 'react'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

export enum BannerBoxEnum {
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEFAULT = 'DEFAULT',
}

export interface BannerBoxProps {
  message: string | ReactNode
  icon?: IconAwesomeEnum | string
  title?: string
  className?: string
  type?: BannerBoxEnum
  dataTestId?: string
  iconRealColors?: boolean
  iconInCircle?: boolean
}

export function BannerBox(props: BannerBoxProps) {
  const {
    icon,
    title,
    message,
    className = '',
    type = BannerBoxEnum.DEFAULT,
    dataTestId,
    iconRealColors = false,
    iconInCircle = false,
  } = props

  const boxClasses = {
    [BannerBoxEnum.DEFAULT]: 'bg-accent2-50 border-accent2-500',
    [BannerBoxEnum.WARNING]: 'bg-warning-50 border-warning-500',
    [BannerBoxEnum.ERROR]: 'bg-error-50 border-error-500',
  }

  const iconClasses = {
    [BannerBoxEnum.DEFAULT]: 'text-accent2-600',
    [BannerBoxEnum.WARNING]: 'text-warning-600',
    [BannerBoxEnum.ERROR]: 'text-error-600',
  }

  const circleIconWrapperClasses = 'rounded-full overflow-hidden w-12 h-12 bg-white items-center justify-center flex'

  return (
    <div
      data-testid={'banner-box' || dataTestId}
      className={`border px-4 py-3 bg rounded flex ${className} ${boxClasses[type]}`}
    >
      <div className={`mr-3 shrink-0 ${iconInCircle ? circleIconWrapperClasses : ''}`}>
        <Icon
          name={icon || IconAwesomeEnum.TRIANGLE_EXCLAMATION}
          className={`${iconInCircle ? '' : 'relative top-[2px]'} ${!iconRealColors ? iconClasses[type] : ''}`}
        />
      </div>

      <div>
        {title && <h3 className="text-text-600 font-semibold text-sm mb-1">{title}</h3>}
        <p className="text-xs text-text-500">{message}</p>
      </div>
    </div>
  )
}

export default BannerBox
