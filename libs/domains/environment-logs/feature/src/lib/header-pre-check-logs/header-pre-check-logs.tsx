import { useRouter } from '@tanstack/react-router'
import { type EnvironmentStatusesWithStagesPreCheckStage } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { Button, Icon, StatusChip } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface HeaderPreCheckLogsProps extends PropsWithChildren {
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
}

export function HeaderPreCheckLogs({ preCheckStage, children }: HeaderPreCheckLogsProps) {
  const router = useRouter()
  const onBack = () => router.history.back()
  const totalDurationSec = preCheckStage?.total_duration_sec ?? 0

  return (
    <div className="flex h-12 w-full items-center justify-between border-b border-neutral pr-4">
      <div className="flex h-full">
        <div className="flex h-full items-center gap-3 px-4 text-sm font-medium text-neutral">
          <div className="flex items-center gap-1.5">
            <Button onClick={onBack} variant="plain" iconOnly>
              <Icon className="text-base" iconName="arrow-left" iconStyle="regular" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-base font-medium">Pre-check</span>
              <Icon iconName="list-check" />
            </div>
          </div>
          {preCheckStage && (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
                <circle cx="2.5" cy="2.955" r="2.5" fill="var(--neutral-6)"></circle>
              </svg>
              <span className="flex items-center gap-2">
                <StatusChip status={preCheckStage?.status} />
                <span>{upperCaseFirstLetter(preCheckStage?.status).replace(/_/g, ' ')}</span>
              </span>
            </>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
            <circle cx="2.5" cy="2.955" r="2.5" fill="var(--neutral-6)"></circle>
          </svg>
          <span className="flex items-center gap-1.5 font-normal">
            <Icon iconName="stopwatch" iconStyle="regular" className="text-base text-neutral-subtle" />
            {Math.floor(totalDurationSec / 60)}m : {totalDurationSec % 60}s
          </span>
        </div>
      </div>
      {children}
    </div>
  )
}

export default HeaderPreCheckLogs
