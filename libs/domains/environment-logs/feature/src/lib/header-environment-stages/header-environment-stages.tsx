import clsx from 'clsx'
import { type DeploymentHistoryEnvironmentV2, type Environment, type EnvironmentStatus } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { EnvironmentActionToolbar } from '@qovery/domains/environments/feature'
import { IconEnum } from '@qovery/shared/enums'
import { ActionTriggerStatusChip, Icon, Tooltip } from '@qovery/shared/ui'
import { dateUTCString } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

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
          className={clsx('flex h-full items-center gap-4 text-sm font-medium text-neutral-50', {
            'pr-2': environmentStatus?.state === 'DEPLOYING',
          })}
        >
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-2.5">
              <Icon name={IconEnum.SERVICES} />
              {environment.name}
            </span>
            {environmentStatus.last_deployment_id && (
              <Tooltip content={`Execution id: ${environmentStatus.last_deployment_id}`} side="bottom">
                <span>
                  <Icon className="text-base" iconName="circle-info" iconStyle="regular" />
                </span>
              </Tooltip>
            )}
          </span>
          <EnvironmentActionToolbar variant="deployment" environment={environment} />
          {deploymentHistory?.trigger_action && (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
                <circle cx="2.5" cy="2.955" r="2.5" fill="#383E50"></circle>
              </svg>
              <Tooltip
                content={
                  <>
                    Action: {upperCaseFirstLetter(environmentStatus?.last_deployment_state)} <br /> Status:{' '}
                    {upperCaseFirstLetter(deploymentHistory.trigger_action).replace(/_/g, ' ')}
                  </>
                }
                side="bottom"
              >
                <span>
                  <ActionTriggerStatusChip
                    size="sm"
                    status={environmentStatus?.last_deployment_state}
                    triggerAction={deploymentHistory.trigger_action}
                  />
                </span>
              </Tooltip>
            </>
          )}
          {environmentStatus?.state !== 'DEPLOYING' && (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
                <circle cx="2.5" cy="2.955" r="2.5" fill="#383E50"></circle>
              </svg>
              <span
                className="flex items-center gap-1.5"
                title={dateUTCString(environmentStatus.last_deployment_date ?? '')}
              >
                <Icon iconName="stopwatch" iconStyle="regular" className="text-base text-neutral-250" />
                {Math.floor(totalDurationSec / 60)}m : {totalDurationSec % 60}s
              </span>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export default HeaderEnvironmentStages
