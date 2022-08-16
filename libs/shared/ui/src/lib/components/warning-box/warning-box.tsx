import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

export interface WarningBoxProps {
  message: string
  icon?: IconAwesomeEnum | string
  title?: string
  className?: string
}

export function WarningBox(props: WarningBoxProps) {
  const { icon, title, message, className = '' } = props

  return (
    <div
      data-testid="warning-box"
      className={`bg-warning-50 border border-warning-500 px-4 py-3 rounded flex ${className}`}
    >
      <Icon name={icon || IconAwesomeEnum.TRIANGLE_EXCLAMATION} className="mr-3 text-warning-600 relative top-[2px]" />
      <div>
        {title && <h5 className="text-sm text-text-600">{title}</h5>}
        <p className="text-xs text-text-500">{message}</p>
      </div>
    </div>
  )
}

export default WarningBox
