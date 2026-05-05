import { type QueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { clsx } from 'clsx'
import {
  type DeploymentStageWithServicesStatuses,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { Fragment, Suspense, useCallback, useState } from 'react'
import { match } from 'ts-pattern'
import { useDeploymentHistoryExecutionId, useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceAvatar, useServices } from '@qovery/domains/services/feature'
import {
  Icon,
  Indicator,
  Link,
  Skeleton,
  StageStatusChip,
  StatusChip,
  Tooltip,
  TriggerActionIcon,
  Truncate,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { EnvironmentStages } from '../environment-stages/environment-stages'

function matchServicesWithStatuses(deploymentStages?: DeploymentStageWithServicesStatuses[]) {
  if (!deploymentStages) return []

  return deploymentStages.map((deploymentStage) => {
    const serviceTypes = ['applications', 'databases', 'containers', 'jobs', 'helms', 'terraforms'] as const

    const services = serviceTypes
      .map((serviceType) => deploymentStage[serviceType])
      .flat()
      .map((service) => ({ ...service, status: service?.state }))

    return { services, stage: deploymentStage.stage }
  })
}

function PipelineContent({
  deploymentStages,
  environmentStatus,
  preCheckStage,
}: {
  deploymentStages?: DeploymentStageWithServicesStatuses[]
  environmentStatus?: EnvironmentStatus
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
}) {
  const { environmentId = '', deploymentId = '' } = useParams({ strict: false })
  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: services = [] } = useServices({ environmentId, suspense: true })
  const { data: deploymentHistory } = useDeploymentHistoryExecutionId({
    environmentId,
    executionId: deploymentId,
    suspense: true,
  })

  if (!environment || !environmentStatus) {
    // Suspend until WS data arrives.
    // The parent Pipeline component will re-render this component once setEnvironmentStatus is called.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    throw new Promise(() => {})
  }

  const getServiceById = (id: string) => services.find((service) => service.id === id) as AnyService
  const getServiceFromDeploymentHistoryId = (id: string) =>
    deploymentHistory?.stages.flatMap((s) => s.services).find((s) => s.identifier.service_id === id)

  return (
    <div>
      <EnvironmentStages
        environment={environment}
        environmentStatus={environmentStatus}
        deploymentStages={deploymentStages}
        preCheckStage={preCheckStage}
        deploymentHistory={deploymentHistory}
      >
        {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
        <>
          {matchServicesWithStatuses(deploymentStages)?.map((s) => {
            const stageTotalDurationSec = s.stage?.steps?.total_duration_sec ?? 0
            const stageName = s?.stage?.name || ''

            if (s?.stage?.status === 'SKIPPED') return null

            return (
              <Fragment key={s.stage?.id}>
                <div className="h-fit w-60 min-w-60 overflow-hidden rounded border border-neutral bg-surface-neutral text-neutral">
                  <div className="flex h-[58px] items-center gap-3.5 border-b border-neutral px-3 py-2.5">
                    <Indicator
                      align="end"
                      side="right"
                      content={
                        <Tooltip content={upperCaseFirstLetter(deploymentHistory?.trigger_action)}>
                          <span>
                            <TriggerActionIcon
                              triggerAction={deploymentHistory?.trigger_action}
                              className="relative -left-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-surface-neutral text-xs text-neutral-subtle"
                            />
                          </span>
                        </Tooltip>
                      }
                    >
                      <Tooltip content={upperCaseFirstLetter(s.stage?.status)}>
                        <span>
                          <StageStatusChip status={s.stage?.status} />
                        </span>
                      </Tooltip>
                    </Indicator>
                    <div className="flex flex-col gap-0.5">
                      <span className="flex gap-1.5 text-sm font-medium text-neutral">
                        <Truncate text={upperCaseFirstLetter(stageName) || ''} truncateLimit={20} />
                        {s?.stage?.description && (
                          <Tooltip content={s?.stage?.description}>
                            <span className="text-neutral-subtle">
                              <Icon iconName="info-circle" iconStyle="regular" />
                            </span>
                          </Tooltip>
                        )}
                      </span>
                      {match(s.stage?.status)
                        .with('CANCELED', 'DONE', 'ERROR', () => (
                          <span className="text-xs">
                            {Math.floor(stageTotalDurationSec / 60)}m {stageTotalDurationSec % 60}s
                          </span>
                        ))
                        .otherwise(() => null)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 bg-surface-neutral-subtle p-1.5">
                    {s.services.length > 0 ? (
                      s.services.map((service) => {
                        const fullService = getServiceById(service.id!)
                        const serviceTotalDurationSec = service?.steps?.total_duration_sec
                        // NOTE: This one is necessary to catch edge case with delete service because we don't have information in the service list and environment status (except their id)
                        const serviceFromDeploymentHistoryId = getServiceFromDeploymentHistoryId(service.id!)

                        if (!service.is_part_last_deployment) return null
                        if (!fullService)
                          return (
                            <div
                              key={service?.id}
                              className="flex w-full items-center gap-2.5 rounded border border-neutral bg-surface-neutral px-2.5 py-2"
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral text-neutral-subtle">
                                <Icon iconName="trash-can-xmark" iconStyle="solid" />
                              </span>
                              <span className="text-sm">{serviceFromDeploymentHistoryId?.identifier.name}</span>
                            </div>
                          )

                        const serviceItemClassName =
                          'flex w-full items-center gap-2.5 rounded border border-neutral bg-surface-neutral px-2.5 py-2'

                        return (
                          <Link
                            key={service?.id}
                            to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId"
                            params={{
                              organizationId: environment.organization.id,
                              projectId: environment.project.id,
                              environmentId: environment.id,
                              serviceId: service.id,
                              executionId: deploymentHistory?.identifier.execution_id ?? '',
                            }}
                            className={clsx(
                              serviceItemClassName,
                              'text-neutral hover:border-neutral-component hover:bg-surface-neutral-subtle hover:text-neutral'
                            )}
                          >
                            <ServiceAvatar service={fullService} border="solid" size="sm" className="border-neutral" />
                            <span className="flex flex-col gap-0.5 text-sm">
                              <Truncate text={fullService.name} truncateLimit={16} />
                              {serviceTotalDurationSec && (
                                <span className="text-xs">
                                  {Math.floor(serviceTotalDurationSec / 60)}m {serviceTotalDurationSec % 60}s
                                </span>
                              )}
                            </span>
                            <StatusChip className="ml-auto" status={service.state} />
                          </Link>
                        )
                      })
                    ) : (
                      <div className="px-3 py-6 text-center" data-testid="placeholder-stage">
                        <Icon iconName="wave-pulse" className="text-neutral-subtle" />
                        <p className="mt-1 text-xs font-medium text-neutral-subtle">No service for this stage.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 w-4 last:hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="9" fill="none" viewBox="0 0 17 9">
                    <path
                      className="fill-surface-neutral-component"
                      d="M16.092 4.5L8.592.17v8.66l7.5-4.33zm-16 .75h9.25v-1.5H.092v1.5z"
                    ></path>
                  </svg>
                </div>
              </Fragment>
            )
          })}
        </>
      </EnvironmentStages>
    </div>
  )
}

function Loading() {
  const { organizationId, projectId, environmentId } = useParams({ strict: false })
  return (
    <div className="flex flex-col gap-3">
      <Link
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/deployments"
        params={{ organizationId, projectId, environmentId }}
        color="neutral"
        className="gap-1.5 text-neutral-subtle hover:text-neutral"
      >
        <Icon iconName="arrow-left" />
        Deployment history
      </Link>
      <div className="flex flex-col border-b border-neutral pb-5">
        <div className="flex gap-3">
          <Skeleton height={24} width={190} />
          <Skeleton height={24} width={24} />
          <Skeleton height={24} width={50} />
        </div>
      </div>
      <div className="mt-3 flex gap-5">
        <Skeleton height={122} width={240} />
        <Skeleton height={122} width={240} />
        <Skeleton height={122} width={240} />
        <Skeleton height={122} width={240} />
      </div>
    </div>
  )
}

export function EnvironmentPipeline() {
  const { organizationId, environmentId = '', projectId = '', deploymentId = '' } = useParams({ strict: false })
  const { data: environment } = useEnvironment({ environmentId, suspense: true })

  const [deploymentStages, setDeploymentStages] = useState<DeploymentStageWithServicesStatuses[]>()
  const [environmentStatus, setEnvironmentStatus] = useState<EnvironmentStatus>()
  const [preCheckStage, setPreCheckStage] = useState<EnvironmentStatusesWithStagesPreCheckStage>()

  const messageHandler = useCallback(
    (
      _: QueryClient,
      {
        stages,
        environment,
        pre_check_stage,
      }: {
        stages: DeploymentStageWithServicesStatuses[]
        environment: EnvironmentStatus
        pre_check_stage: EnvironmentStatusesWithStagesPreCheckStage
      }
    ) => {
      setDeploymentStages(stages)
      setEnvironmentStatus(environment)
      setPreCheckStage(pre_check_stage)
    },
    [setDeploymentStages]
  )

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/status',
    urlSearchParams: {
      organization: organizationId,
      cluster: environment?.cluster_id,
      project: projectId,
      environment: environmentId,
      version: deploymentId,
    },
    enabled:
      Boolean(organizationId) && Boolean(environment?.cluster_id) && Boolean(projectId) && Boolean(environmentId),
    onMessage: messageHandler,
  })

  return (
    <Suspense fallback={<Loading />}>
      <PipelineContent
        deploymentStages={deploymentStages}
        environmentStatus={environmentStatus}
        preCheckStage={preCheckStage}
      />
    </Suspense>
  )
}
