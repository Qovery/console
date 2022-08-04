import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import Icon from '../icon/icon'

export interface WarningBoxProps {
  icon?: IconAwesomeEnum | string
  message: string
  className?: string
}

export function WarningBox(props: WarningBoxProps) {
  return (
    <div
      data-testid="warning-box"
      className={`bg-warning-50 border border-warning-500 px-4 py-2 rounded flex ${props.className}`}
    >
      <Icon name={props.icon || IconAwesomeEnum.TRIANGLE_EXCLAMATION} className="mr-2 text-ssm text-warning-600" />
      <p className="text-xs text-text-500">{props.message}</p>
    </div>
  )
}

export default WarningBox
