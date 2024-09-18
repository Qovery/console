import { type Dispatch, type SetStateAction } from 'react'
import { Icon } from '@qovery/shared/ui'

export interface ShowPreviousLogsButtonProps {
  showPreviousLogs: boolean
  setShowPreviousLogs: Dispatch<SetStateAction<boolean>>
  setPauseLogs: Dispatch<SetStateAction<boolean>>
}

export function ShowPreviousLogsButton({
  showPreviousLogs,
  setShowPreviousLogs,
  setPauseLogs,
}: ShowPreviousLogsButtonProps) {
  if (!showPreviousLogs) {
    return (
      <button
        type="button"
        className="block w-full bg-neutral-500 py-1.5 text-center text-sm font-medium text-neutral-250 transition hover:bg-neutral-550"
        onClick={() => {
          setPauseLogs(false)
          setShowPreviousLogs(true)
        }}
      >
        Load previous logs
        <Icon iconName="arrow-up" className="ml-1.5" />
      </button>
    )
  }

  return null
}

export default ShowPreviousLogsButton
