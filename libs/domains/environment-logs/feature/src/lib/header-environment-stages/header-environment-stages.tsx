import clsx from 'clsx'
import { type DeploymentHistoryEnvironmentV2, type Environment, type EnvironmentStatus } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { Badge, DeploymentAction, Icon, StatusChip } from '@qovery/shared/ui'
import { dateUTCString } from '@qovery/shared/util-dates'

export interface HeaderEnvironmentStagesProps extends PropsWithChildren {
  environment: Environment
  environmentStatus: EnvironmentStatus
  deploymentHistory?: DeploymentHistoryEnvironmentV2
}

export function HeaderEnvironmentStages({
  environment,
  environmentStatus,
  deploymentHistory,
  children,
}: HeaderEnvironmentStagesProps) {
  const totalDurationSec = environmentStatus?.total_deployment_duration_in_seconds ?? 0

  return (
    <div className="flex h-12 w-full items-center justify-between">
      <div className="flex h-full">
        <div
          className={clsx('flex h-full items-center gap-4 text-sm font-medium text-neutral', {
            'pr-2': environmentStatus?.state === 'DEPLOYING',
          })}
        >
          <div className="flex items-center justify-between gap-3">
            <DeploymentAction
              status={deploymentHistory?.trigger_action}
              className="gap-3 text-2xl"
              iconClassName="text-neutral-subtle"
            />
            <StatusChip status={environmentStatus.state} className="h-5 w-5" />
          </div>

          <svg width="1" height="16" viewBox="0 0 1 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="1" height="16" fill="var(--neutral-6)" />
          </svg>

          {environmentStatus?.state !== 'DEPLOYING' && (
            <div className="flex items-center gap-2">
              <Badge variant="surface" className="max-w-full whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                  <Icon iconName="calendar-day" className="text-xs text-neutral-subtle" />
                  {dateUTCString(environmentStatus.last_deployment_date ?? '')}
                </span>
              </Badge>
              <Badge variant="surface" className="max-w-full whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                  <Icon iconName="stopwatch" iconStyle="regular" className="text-xs text-neutral-subtle" />
                  {Math.floor(totalDurationSec / 60)}m : {totalDurationSec % 60}s
                </span>
              </Badge>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export default HeaderEnvironmentStages
