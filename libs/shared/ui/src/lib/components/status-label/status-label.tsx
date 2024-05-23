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
        'flex h-8 shrink-0 items-center truncate rounded-full border border-neutral-250 px-3 text-xs font-medium text-neutral-400',
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
