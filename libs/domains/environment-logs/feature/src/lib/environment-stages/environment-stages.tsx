import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import {
  type DeploymentHistoryEnvironmentV2,
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { type Dispatch, type PropsWithChildren, type SetStateAction } from 'react'
import { EnvironmentActionToolbar, useDeploymentHistory } from '@qovery/domains/environments/feature'
import {
  Button,
  DropdownMenu,
  Icon,
  InputToggle,
  Link,
  LoaderSpinner,
  StageStatusChip,
  StatusChip,
  Tooltip,
} from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'
import { trimId, upperCaseFirstLetter } from '@qovery/shared/util-js'
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
  const { organizationId, projectId, environmentId, deploymentId } = useParams({ strict: false })
  const executionId = environmentStatus.last_deployment_id
  const { data: environmentDeploymentHistory = [] } = useDeploymentHistory({
    environmentId: environment.id,
    suspense: true,
  })
  const currentDeploymentHistory = environmentDeploymentHistory.find((d) => d.identifier.execution_id === deploymentId)
  const isLastVersion = environmentDeploymentHistory?.[0]?.identifier.execution_id === deploymentId || !deploymentId

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
      <HeaderEnvironmentStages environmentStatus={environmentStatus} deploymentHistory={deploymentHistory}>
        <div className="flex items-center gap-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline" className="gap-1.5" size="md">
                <Icon iconName="clock-rotate-left" className="text-neutral-subtle" />
                {isLastVersion
                  ? 'Latest'
                  : dateYearMonthDayHourMinuteSecond(
                      new Date(currentDeploymentHistory?.auditing_data.created_at ?? '')
                    )}
                <Icon iconName="angle-down" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" className="z-dropdown max-h-96 w-80 overflow-y-auto">
              {environmentDeploymentHistory.map((deployment) => (
                <DropdownMenu.Item
                  asChild
                  key={deployment.identifier.execution_id}
                  className={clsx('min-h-9', {
                    'bg-surface-brand-component': deployment.identifier.execution_id === deploymentId,
                  })}
                >
                  <Link
                    className="flex w-full justify-between"
                    to="/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId"
                    params={{
                      organizationId,
                      projectId,
                      environmentId: environment.id,
                      deploymentId: deployment.identifier.execution_id,
                    }}
                  >
                    <Tooltip content={deployment.identifier.execution_id}>
                      <span>{trimId(deployment.identifier.execution_id ?? '')}</span>
                    </Tooltip>
                    <span className="flex items-center gap-2.5 text-xs text-neutral-subtle">
                      {dateYearMonthDayHourMinuteSecond(new Date(deployment.auditing_data.created_at))}
                      <StatusChip status={deployment.status} />
                    </span>
                  </Link>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <EnvironmentActionToolbar variant="header" environment={environment} />
        </div>
      </HeaderEnvironmentStages>
      <hr className="mb-4 mt-2 w-full border-neutral" />
      <div className="flex items-center justify-end gap-4 text-sm font-medium text-neutral">
        <InputToggle
          name="skipped"
          value={hideSkipped}
          onChange={setHideSkipped}
          small
          title="Hide skipped"
          className="flex-row-reverse gap-2"
        />
      </div>
      <div className="flex justify-center">
        <div className="relative h-full w-full">
          {banner}
          <div className="scroll-shadow flex h-full gap-0.5 overflow-x-auto py-4">
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
                            to="/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId/pre-check-logs"
                            params={{ organizationId, projectId, environmentId, deploymentId: executionId }}
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
