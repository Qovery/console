import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { type DeploymentHistoryEnvironmentV2, type EnvironmentStatus } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { Badge, DeploymentAction, Icon, StatusChip, Tooltip } from '@qovery/shared/ui'
import { trimId } from '@qovery/shared/util-js'

export interface HeaderEnvironmentStagesProps extends PropsWithChildren {
  environmentStatus: EnvironmentStatus
  deploymentHistory?: DeploymentHistoryEnvironmentV2
}

export function HeaderEnvironmentStages({
  environmentStatus,
  deploymentHistory,
  children,
}: HeaderEnvironmentStagesProps) {
  const { deploymentId } = useParams({ strict: false })
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
            <StatusChip status={deploymentHistory?.status} className="h-5 w-5" />
          </div>

          <svg width="1" height="16" viewBox="0 0 1 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="1" height="16" fill="var(--neutral-6)" />
          </svg>

          {environmentStatus?.state !== 'DEPLOYING' && (
            <div className="flex items-center gap-2">
              <Badge variant="surface" className="max-w-full whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                  <Icon iconName="stopwatch" iconStyle="regular" className="text-xs text-neutral-subtle" />
                  {Math.floor(totalDurationSec / 60)}m : {totalDurationSec % 60}s
                </span>
              </Badge>
              <Badge variant="surface" className="max-w-full whitespace-nowrap">
                <Tooltip side="bottom" content={<span>Execution id: {deploymentId}</span>}>
                  <span className="flex items-center gap-1.5 truncate">
                    <Icon iconName="code" iconStyle="regular" className="text-xs text-neutral-subtle" />
                    <span className="font-normal text-neutral">{trimId(deploymentId ?? '')}</span>
                  </span>
                </Tooltip>
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
