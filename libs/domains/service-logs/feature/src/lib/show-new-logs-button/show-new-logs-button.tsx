import { type Dispatch, type SetStateAction } from 'react'
import { Button, Icon } from '@qovery/shared/ui'

export interface ShowNewLogsButtonProps {
  pauseLogs: boolean
  setPauseLogs: Dispatch<SetStateAction<boolean>>
  newMessagesAvailable: boolean
}

export function ShowNewLogsButton({ pauseLogs, setPauseLogs, newMessagesAvailable }: ShowNewLogsButtonProps) {
  if (pauseLogs && newMessagesAvailable) {
    return (
      <Button
        className="absolute bottom-[7px] left-1/2 flex w-72 -translate-x-1/2 items-center justify-center gap-2 text-sm"
        variant="solid"
        radius="full"
        size="md"
        type="button"
        onClick={() => setPauseLogs(false)}
      >
        New logs
        <Icon iconName="arrow-down-to-line" />
      </Button>
    )
  }

  return null
}

export default ShowNewLogsButton
