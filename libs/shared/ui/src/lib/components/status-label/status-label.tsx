import { type StateEnum } from 'qovery-typescript-axios'
import { twMerge } from '@qovery/shared/util-js'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import StatusChip from '../status-chip/status-chip'

export interface StatusLabelProps {
  status?: StateEnum
  className?: string
}

export function StatusLabel(props: StatusLabelProps) {
  const { status, className = '' } = props

  if (!status || status === 'READY' || status === 'DEPLOYED') {
    return null
  }

  return (
    <span
      className={twMerge(
        'shrink-0 flex items-center px-3 h-8 border border-neutral-250 rounded-full text-neutral-400 text-xs font-medium truncate',
        className
      )}
      data-testid="status-label"
    >
      <StatusChip className="mr-2" status={status} />
      {upperCaseFirstLetter(status?.replace('_', ' '))}
    </span>
  )
}

export default StatusLabel
