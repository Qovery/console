import { useParams } from '@tanstack/react-router'
import {
  type DeploymentHistoryEnvironmentV2,
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { type Dispatch, type PropsWithChildren, type SetStateAction } from 'react'
import { EnvironmentActionToolbar } from '@qovery/domains/environments/feature'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_PRE_CHECK_LOGS_URL } from '@qovery/shared/routes'
import { Icon, InputToggle, Link, LoaderSpinner, StageStatusChip, StatusChip, Tooltip } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { HeaderEnvironmentStages } from '../header-environment-stages/header-environment-stages'

export interface EnvironmentStagesProps extends PropsWithChildren {
  environment: Environment
  environmentStatus: EnvironmentStatus
  hideSkipped: boolean
  setHideSkipped: Dispatch<SetStateAction<boolean>>
  deploymentStages?: DeploymentStageWithServicesStatuses[]
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
  deploymentHistory?: DeploymentHistoryEnvironmentV2
  banner?: React.ReactNode
}

export function EnvironmentStages({
  environment,
  environmentStatus,
  deploymentStages,
  deploymentHistory,
  preCheckStage,
  hideSkipped,
  setHideSkipped,
  banner,
  children,
}: EnvironmentStagesProps) {
  const { organizationId, projectId, environmentId } = useParams({ strict: false })
  const executionId = environmentStatus.last_deployment_id

  return (
    <div className="h-full">
      <div className="flex shrink-0 flex-col gap-6">
        <div className="flex flex-col items-start gap-3">
          <Link
            to="/organization/$organizationId/project/$projectId/environment/$environmentId/deployments"
            params={{ organizationId, projectId, environmentId }}
            color="neutral"
            className="flex gap-2 text-neutral-subtle"
          >
            <Icon iconName="arrow-left" />
            Deployment history
          </Link>
        </div>
      </div>
      <HeaderEnvironmentStages
        environment={environment}
        environmentStatus={environmentStatus}
        deploymentHistory={deploymentHistory}
      >
        <div className="flex items-center gap-4 text-sm font-medium text-neutral">
          <InputToggle
            name="skipped"
            value={hideSkipped}
            onChange={setHideSkipped}
            small
            title="Hide skipped"
            className="flex-row-reverse gap-2"
          />
          <EnvironmentActionToolbar variant="header" environment={environment} />
        </div>
      </HeaderEnvironmentStages>
      <hr className="mt-2 w-full border-neutral" />

      <div className="flex justify-center">
        <div className="relative h-full w-full">
          {banner}
          <div className="scroll-shadow flex h-full gap-0.5 overflow-x-auto py-6">
            {!deploymentStages ? (
              <div className="mt-6 flex h-full w-full justify-center">
                <LoaderSpinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                {preCheckStage && (
                  <>
                    <div className="h-fit w-60 min-w-60 overflow-hidden rounded border border-neutral bg-surface-neutral text-neutral-subtle">
                      <div className="flex h-[58px] items-center gap-3.5 border-b border-neutral px-3 py-2.5">
                        <Tooltip content={upperCaseFirstLetter(preCheckStage?.status)}>
                          <span>
                            <StageStatusChip status={preCheckStage?.status} />
                          </span>
                        </Tooltip>
                        <div className="flex flex-col gap-0.5">
                          <span className="flex gap-1.5 text-sm font-medium text-neutral">Pre-check</span>
                          <span className="text-xs text-neutral-subtle">
                            {Math.max(0, Math.floor((preCheckStage?.total_duration_sec ?? 0) / 60))}m{' '}
                            {preCheckStage?.total_duration_sec ?? 0 % 60}s
                          </span>
                        </div>
                      </div>
                      {executionId && (
                        <div className="flex flex-col gap-1.5 bg-surface-neutral-subtle p-1.5">
                          <Link
                            // TODO new-nav : Route not yet created
                            // @ts-expect-error-next-line
                            to={
                              ENVIRONMENT_LOGS_URL(
                                environment.organization.id,
                                environment.project.id,
                                environment.id
                              ) + ENVIRONMENT_PRE_CHECK_LOGS_URL(executionId)
                            }
                            className="flex w-full items-center gap-2.5 rounded border border-neutral bg-surface-neutral px-2.5 py-2 text-neutral hover:border-neutral-component hover:bg-surface-neutral-subtle hover:text-neutral"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral text-neutral-subtle">
                              <Icon iconName="list-check" iconStyle="solid" />
                            </span>
                            <span className="text-sm">Pre-check logs</span>
                            <StatusChip className="ml-auto" status={preCheckStage.status} />
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 w-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="9" fill="none" viewBox="0 0 17 9">
                        <path
                          fill="var(--neutral-6)"
                          d="M16.092 4.5L8.592.17v8.66l7.5-4.33zm-16 .75h9.25v-1.5H.092v1.5z"
                        ></path>
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
