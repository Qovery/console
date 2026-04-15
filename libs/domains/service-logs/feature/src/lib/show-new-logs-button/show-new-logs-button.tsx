import { useLocation, useNavigate } from '@tanstack/react-router'
import { type Dispatch, type SetStateAction } from 'react'
import { Button, Icon } from '@qovery/shared/ui'

export interface ShowNewLogsButtonProps {
  pauseLogs: boolean
  setPauseLogs: Dispatch<SetStateAction<boolean>>
  bufferedLogsCount?: number
}

export function ShowNewLogsButton({ pauseLogs, setPauseLogs, bufferedLogsCount }: ShowNewLogsButtonProps) {
  const navigate = useNavigate()
  const { hash, pathname, search } = useLocation()

  if (pauseLogs) {
    return (
      <Button
        className="absolute bottom-[7px] left-1/2 flex w-72 -translate-x-1/2 items-center justify-center gap-2 text-sm"
        variant="solid"
        radius="full"
        size="md"
        type="button"
        onClick={() => {
          setPauseLogs(false)
          if (hash) navigate({ to: pathname + search })
        }}
      >
        Jump to latest log
        {bufferedLogsCount !== undefined && bufferedLogsCount > 0 && (
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-semibold tabular-nums">
            {bufferedLogsCount > 999 ? '999+' : bufferedLogsCount}
          </span>
        )}
        <Icon iconName="arrow-down" />
      </Button>
    )
  }

  return null
}

export default ShowNewLogsButton
