import { type CheckedState } from '@radix-ui/react-checkbox'
import {
  type DeploymentHistoryEnvironmentV2,
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { type Dispatch, type PropsWithChildren, type SetStateAction } from 'react'
import { NavLink } from 'react-router-dom'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_PRE_CHECK_LOGS_URL } from '@qovery/shared/routes'
import { Checkbox, Icon, LoaderSpinner, StageStatusChip, StatusChip } from '@qovery/shared/ui'
import { HeaderEnvironmentStages } from '../header-environment-stages/header-environment-stages'

export interface EnvironmentStagesProps extends PropsWithChildren {
  environment: Environment
  environmentStatus: EnvironmentStatus
  hideSkipped: CheckedState
  setHideSkipped: Dispatch<SetStateAction<CheckedState>>
  deploymentStages?: DeploymentStageWithServicesStatuses[]
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
  deploymentHistory?: DeploymentHistoryEnvironmentV2
}

export function EnvironmentStages({
  environment,
  environmentStatus,
  deploymentStages,
  deploymentHistory,
  preCheckStage,
  hideSkipped,
  setHideSkipped,
  children,
}: EnvironmentStagesProps) {
  const executionId = environmentStatus.last_deployment_id

  return (
    <div className="h-[calc(100vh-64px)] w-[calc(100vw-64px)] p-1">
      <HeaderEnvironmentStages
        environment={environment}
        environmentStatus={environmentStatus}
        deploymentHistory={deploymentHistory}
      >
        <div className="flex items-center gap-3 text-sm font-medium text-neutral-50">
          <Checkbox
            name="skipped"
            id="skipped"
            className="shrink-0"
            color="brand"
            checked={hideSkipped}
            onCheckedChange={setHideSkipped}
          />
          <label htmlFor="skipped">Hide skipped</label>
        </div>
      </HeaderEnvironmentStages>
      <div className="flex h-[calc(100vh-120px)] justify-center border border-t-0 border-neutral-500 bg-neutral-600">
        <div className="h-full w-full">
          <div className="flex h-full gap-0.5 overflow-y-scroll py-6 pl-4 pr-3">
            {!deploymentStages ? (
              <div className="mt-6 flex h-full w-full justify-center">
                <LoaderSpinner className="h-6 w-6" theme="dark" />
              </div>
            ) : (
              <>
                {preCheckStage && (
                  <>
                    <div className="h-fit w-60 min-w-60 overflow-hidden rounded border border-neutral-500 bg-neutral-650 text-neutral-50">
                      <div className="flex h-[58px] items-center gap-3.5 border-b border-neutral-500 px-3 py-2.5">
                        <StageStatusChip status={preCheckStage?.status} />
                        <div className="flex flex-col gap-0.5">
                          <span className="flex gap-1.5 text-sm font-medium">Pre-check</span>
                          <span className="text-xs">
                            {Math.max(0, Math.floor((preCheckStage?.total_duration_sec ?? 0) / 60))}m{' '}
                            {preCheckStage?.total_duration_sec ?? 0 % 60}s
                          </span>
                        </div>
                      </div>
                      {executionId && (
                        <div className="flex flex-col gap-1.5 bg-neutral-800 p-1.5">
                          <NavLink
                            to={
                              ENVIRONMENT_LOGS_URL(
                                environment.organization.id,
                                environment.project.id,
                                environment.id
                              ) + ENVIRONMENT_PRE_CHECK_LOGS_URL(executionId)
                            }
                            className="flex w-full items-center gap-2.5 rounded border border-neutral-400 bg-neutral-550 px-2.5 py-2 hover:border-brand-400"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 text-neutral-250">
                              <Icon iconName="list-check" iconStyle="solid" />
                            </span>
                            <span className="text-sm">Pre-check logs</span>
                            <StatusChip className="ml-auto" status={preCheckStage.status} />
                          </NavLink>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 w-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="9" fill="none" viewBox="0 0 17 9">
                        <path fill="#383E50" d="M16.092 4.5L8.592.17v8.66l7.5-4.33zm-16 .75h9.25v-1.5H.092v1.5z"></path>
                      </svg>
                    </div>
                  </>
                )}
                {children}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnvironmentStages
