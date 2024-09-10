import { type Dispatch, type SetStateAction } from 'react'
import { Button, Icon } from '@qovery/shared/ui'

export interface StateIndicatorsProps {
  message: string
  pauseLogs: boolean
  setPauseLogs: Dispatch<SetStateAction<boolean>>
  newMessagesAvailable: boolean
}

export function StateIndicators({ pauseLogs, setPauseLogs, newMessagesAvailable, message }: StateIndicatorsProps) {
  return (
    <div
      role="progressbar"
      className="relative -top-8 flex h-8 items-center border-b border-neutral-500 pl-3 text-sm text-neutral-350"
    >
      <span className="mr-1.5">{pauseLogs ? 'Streaming paused' : message}</span>
      {!pauseLogs && (
        <>
          <span className="mr-[2px] h-[3px] w-[3px] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_100ms_infinite] rounded-[0.5px] bg-neutral-350" />
          <span className="mr-[2px] h-[3px] w-[3px] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_300ms_infinite]  rounded-[0.5px] bg-neutral-350" />
          <span className="h-[3px] w-[3px] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_600ms_infinite] rounded-[0.5px] bg-neutral-350" />
        </>
      )}
      {pauseLogs && newMessagesAvailable && (
        <Button
          className="absolute bottom-5 left-1/2 flex w-72 -translate-x-1/2 items-center justify-center gap-2 text-sm"
          variant="solid"
          radius="full"
          size="md"
          type="button"
          onClick={() => setPauseLogs(false)}
        >
          New logs
          <Icon iconName="arrow-down-to-line" />
        </Button>
      )}
    </div>
  )
}

export default StateIndicators
