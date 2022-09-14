import { CustomDomainStatusEnum } from 'qovery-typescript-axios'
import { Icon, IconAwesomeEnum, Tooltip } from '@qovery/shared/ui'

export interface InputApprovalBadgeProps {
  status?: CustomDomainStatusEnum
}

export function InputApprovalBadge(props: InputApprovalBadgeProps) {
  const { status } = props
  let statusClass: string
  let statusIcon: IconAwesomeEnum
  let message: string

  switch (status) {
    case CustomDomainStatusEnum.VALIDATION_PENDING:
      statusIcon = IconAwesomeEnum.TRIANGLE_EXCLAMATION
      statusClass = 'text-warning-600'
      message = 'Validation pending'
      break
    default:
      statusIcon = IconAwesomeEnum.CHECK
      statusClass = 'text-warning-600'
      message = 'Valid'
  }

  return (
    <Tooltip content={message}>
      <div className="flex items-center">
        <Icon name={statusIcon} className={statusClass} />
      </div>
    </Tooltip>
  )
}
