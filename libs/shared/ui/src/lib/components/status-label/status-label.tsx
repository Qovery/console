import { StateEnum } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import StatusChip from '../status-chip/status-chip'

export interface StatusLabelProps {
  status?: StateEnum
  className?: string
}

export function StatusLabel(props: StatusLabelProps) {
  const { status, className = '' } = props

  if (!status || [StateEnum.READY, StateEnum.DEPLOYED].includes(status as StateEnum)) {
    return null
  }

  return (
    <span
      className={`flex items-center px-3 h-8 border border-neutral-250 rounded-full text-neutral-400 text-xs font-medium truncate ${className}`}
      data-testid="status-label"
    >
      <StatusChip className="mr-2" status={status} />
      {upperCaseFirstLetter(status?.replace('_', ' ').toLowerCase())}
    </span>
  )
}

export default StatusLabel
