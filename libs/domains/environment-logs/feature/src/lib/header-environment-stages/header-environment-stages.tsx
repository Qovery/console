import clsx from 'clsx'
import { type DeploymentHistoryEnvironmentV2, type Environment, type EnvironmentStatus } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { EnvironmentActionToolbar } from '@qovery/domains/environments/feature'
import { IconEnum } from '@qovery/shared/enums'
import { ActionTriggerStatusChip, Icon, Tooltip } from '@qovery/shared/ui'
import { dateUTCString } from '@qovery/shared/util-dates'

export interface HeaderEnvironmentStagesProps extends PropsWithChildren {
  environment: Environment
  environmentStatus: EnvironmentStatus
  deploymentHistory?: DeploymentHistoryEnvironmentV2
}

function EndCurve() {
  return (
    <svg
      className="relative -left-0.5 -top-[1px]"
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="48"
      fill="none"
      viewBox="0 0 40 49"
    >
      <path fill="#1A2031" d="M0 .955h5.071a16 16 0 0114.545 9.334l17.722 38.666H0v-48z"></path>
      <path stroke="#2A3041" d="M37.084 48.955L18.037 7.764A11 11 0 008.052 1.38H0"></path>
    </svg>
  )
}

export function HeaderEnvironmentStages({
  environment,
  environmentStatus,
  deploymentHistory,
  children,
}: HeaderEnvironmentStagesProps) {
  const totalDurationSec = environmentStatus?.total_deployment_duration_in_seconds ?? 0

  return (
    <div className="flex h-12 w-full items-center justify-between border-b border-neutral-500 bg-neutral-900 pr-4">
      <div className="flex h-full">
        <div
          className={clsx(
            'flex h-full items-center gap-4 border-l border-t border-neutral-500 bg-neutral-600 py-2.5 pl-4 pr-0.5 text-sm font-medium text-neutral-50',
            {
              'pr-2': environmentStatus?.state === 'DEPLOYING',
            }
          )}
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
              <ActionTriggerStatusChip
                status={environmentStatus?.last_deployment_state}
                triggerAction={deploymentHistory.trigger_action}
              />
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
        <EndCurve />
      </div>
      {children}
    </div>
  )
}

export default HeaderEnvironmentStages
