import { IconEnum } from '@qovery/shared/enums'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

export const enum BannerBoxEnum {
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEFAULT = 'DEFAULT',
}

export interface BannerBoxProps {
  message: string
  icon?: IconAwesomeEnum | IconEnum | string
  title?: string
  className?: string
  type?: BannerBoxEnum
  dataTestId?: string
}

export function BannerBox(props: BannerBoxProps) {
  const { icon, title, message, className = '', type = BannerBoxEnum.WARNING, dataTestId } = props

  return (
    <div
      data-testid={'warning-box' || dataTestId}
      className={`border ${
        type === BannerBoxEnum.WARNING ? 'bg-warning-50 border-warning-500' : 'bg-error-50 border-error-500'
      } px-4 py-3 rounded flex ${className}`}
    >
      <Icon
        name={icon || IconAwesomeEnum.TRIANGLE_EXCLAMATION}
        className={`mr-3 relative top-[2px] ${type === BannerBoxEnum.WARNING ? 'text-warning-600' : 'text-error-600'}`}
      />
      <div>
        {title && <h5 className="text-sm text-text-600 mb-1">{title}</h5>}
        <p className="text-xs text-text-500">{message}</p>
      </div>
    </div>
  )
}

export default BannerBox
