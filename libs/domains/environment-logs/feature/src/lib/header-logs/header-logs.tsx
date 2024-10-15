import { type Environment, type EnvironmentStatus } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { EnvironmentStateChip } from '@qovery/domains/environments/feature'
import { IconEnum } from '@qovery/shared/enums'
import { Icon, Tooltip } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface HeaderLogsProps extends PropsWithChildren {
  environment: Environment
  environmentStatus: EnvironmentStatus
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

export function HeaderLogs({ environment, environmentStatus, children }: HeaderLogsProps) {
  const totalDurationSec = environmentStatus?.total_deployment_duration_in_seconds ?? 0

  return (
    <div className="flex h-12 w-full items-center justify-between border-b border-neutral-500 bg-neutral-900 pr-4">
      <div className="flex h-full">
        <div className="flex h-full items-center gap-4 border-l border-t border-neutral-500 bg-neutral-600 py-2.5 pl-4 pr-0.5 text-sm font-medium text-neutral-50">
          <Tooltip content={`Cloud provider: ${environment.cloud_provider.provider}`} side="bottom">
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-2.5">
                <Icon name={IconEnum.SERVICES} />
                {environment.name}
              </span>
              <Icon className="text-base" iconName="circle-info" iconStyle="regular" />
            </span>
          </Tooltip>
          <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
            <circle cx="2.5" cy="2.955" r="2.5" fill="#383E50"></circle>
          </svg>
          <span className="flex items-center gap-2">
            <EnvironmentStateChip mode="deployment" environmentId={environment.id} />
            <span>{upperCaseFirstLetter(environmentStatus?.state).replace(/_/g, ' ')}</span>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
            <circle cx="2.5" cy="2.955" r="2.5" fill="#383E50"></circle>
          </svg>
          <span className="flex items-center gap-1.5">
            <Icon iconName="stopwatch" iconStyle="regular" className="text-base text-neutral-250" />
            {Math.floor(totalDurationSec / 60)}m : {totalDurationSec % 60}s
          </span>
        </div>
        <EndCurve />
      </div>
      {children}
    </div>
  )
}

export default HeaderLogs
