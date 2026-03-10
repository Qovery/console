import { type CheckedState } from '@radix-ui/react-checkbox'
import { type QueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { clsx } from 'clsx'
import {
  type DeploymentStageWithServicesStatuses,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { Fragment, Suspense, useCallback, useState } from 'react'
import { match } from 'ts-pattern'
import { EnvironmentStages, HeaderEnvironmentStages } from '@qovery/domains/environment-logs/feature'
import {
  useDeploymentHistory,
  useDeploymentHistoryExecutionId,
  useEnvironment,
} from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceAvatar, useServices } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import {
  Checkbox,
  Heading,
  Icon,
  Indicator,
  Link,
  Section,
  StageStatusChip,
  StatusChip,
  Tooltip,
  TriggerActionIcon,
  Truncate,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId/'
)({
  component: RouteComponent,
})

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

function Pipeline() {
  const { organizationId, environmentId, projectId, deploymentId } = Route.useParams()
  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: services = [] } = useServices({ environmentId, suspense: true })
  const { data: listDeploymentHistory = [] } = useDeploymentHistory({ environmentId, suspense: true })
  const { data: deploymentHistory } = useDeploymentHistoryExecutionId({
    environmentId,
    executionId: deploymentId,
    suspense: true,
  })

  const [hideSkipped, setHideSkipped] = useState<boolean>(true)
  const [deploymentStages, setDeploymentStages] = useState<DeploymentStageWithServicesStatuses[]>()
  const [environmentStatus, setEnvironmentStatus] = useState<EnvironmentStatus>()
  const [preCheckStage, setPreCheckStage] = useState<EnvironmentStatusesWithStagesPreCheckStage>()

  const getServiceById = (id: string) => services.find((service) => service.id === id) as AnyService
  const getServiceFromDeploymentHistoryId = (id: string) =>
    deploymentHistory?.stages.flatMap((s) => s.services).find((s) => s.identifier.service_id === id)

  // if (!environmentStatus) {
  //   return (
  //     <div className="h-[calc(100vh-64px)] w-[calc(100vw-64px)] p-1">
  //       <div className="flex h-full w-full justify-center border border-neutral-500 bg-neutral-600 pt-11">
  //         <LoaderSpinner className="h-6 w-6" />
  //       </div>
  //     </div>
  //   )
  // }

  const latestDeployment =
    Array.isArray(listDeploymentHistory) && listDeploymentHistory.length > 0 ? listDeploymentHistory[0] : null

  const lastDeploymentStatus = latestDeployment?.status ?? null
  const lastDeploymentExecutionId = latestDeployment?.identifier?.execution_id ?? ''

  const showBannerNew =
    deploymentHistory?.identifier.execution_id !== lastDeploymentExecutionId &&
    match(lastDeploymentStatus)
      .with(
        'DEPLOYING',
        'DELETING',
        'RESTARTING',
        'BUILDING',
        'STOP_QUEUED',
        'CANCELING',
        'QUEUED',
        'DELETE_QUEUED',
        'DEPLOYMENT_QUEUED',
        () => true
      )
      .otherwise(() => false)

  // const versionIdUrl = deploymentVersionId || preCheckVersionId || stageVersionId
  // const versionIdUrl = deploymentId
  // const isLatestVersion = environmentDeploymentHistory[0]?.identifier.execution_id === versionIdUrl

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
  // XXX: If we don't have a version, it works like WS otherwise, it works like a REST API
  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/status',
    urlSearchParams: {
      organization: organizationId,
      cluster: environment?.cluster_id,
      project: projectId,
      environment: environmentId,
      version: deploymentId,
      // version: isLatestVersion ? undefined : versionIdUrl,
    },
    enabled:
      Boolean(organizationId) && Boolean(environment?.cluster_id) && Boolean(projectId) && Boolean(environmentId),
    onMessage: messageHandler,
  })

  if (!environment || !environmentStatus) {
    return
  }

  return (
    <div>
      <EnvironmentStages
        environment={environment}
        environmentStatus={environmentStatus}
        deploymentStages={deploymentStages}
        preCheckStage={preCheckStage}
        hideSkipped={hideSkipped}
        setHideSkipped={setHideSkipped}
        deploymentHistory={deploymentHistory}
      >
        {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
        <>
          {matchServicesWithStatuses(deploymentStages)?.map((s) => {
            const stageTotalDurationSec = s.stage?.steps?.total_duration_sec ?? 0
            const stageName = s?.stage?.name || ''

            if (hideSkipped && s?.stage?.status === 'SKIPPED') return null

            return (
              <Fragment key={s.stage?.id}>
                <div
                  className={clsx(
                    'h-fit w-60 min-w-60 overflow-hidden rounded border border-neutral bg-surface-neutral',
                    {
                      'text-neutral-50': s?.stage?.status !== 'SKIPPED',
                      'text-neutral-300': s?.stage?.status === 'SKIPPED',
                    }
                  )}
                >
                  <div className="flex h-[58px] items-center gap-3.5 border-b border-neutral px-3 py-2.5">
                    <Indicator
                      align="end"
                      side="right"
                      content={
                        s?.stage?.status !== 'SKIPPED' && (
                          <Tooltip content={upperCaseFirstLetter(deploymentHistory?.trigger_action)}>
                            <span>
                              <TriggerActionIcon
                                triggerAction={deploymentHistory?.trigger_action}
                                className="relative -left-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-surface-neutral text-xs text-neutral-subtle"
                              />
                            </span>
                          </Tooltip>
                        )
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

                        if (hideSkipped && !service.is_part_last_deployment) return null
                        if (!fullService)
                          return (
                            <div
                              key={service?.id}
                              className="bg-neutral flex w-full items-center gap-2.5 rounded border border-neutral px-2.5 py-2"
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral text-neutral-250">
                                <Icon iconName="trash-can-xmark" iconStyle="solid" />
                              </span>
                              <span className="text-sm">{serviceFromDeploymentHistoryId?.identifier.name}</span>
                            </div>
                          )

                        return (
                          <Link
                            key={service?.id}
                            // @ts-expect-error-next-line
                            to={
                              ENVIRONMENT_LOGS_URL(
                                environment.organization.id,
                                environment.project.id,
                                environment.id
                                // ) + DEPLOYMENT_LOGS_VERSION_URL(service.id, executionId ?? '')
                              ) + DEPLOYMENT_LOGS_VERSION_URL(service.id, deploymentId ?? '')
                            }
                            className={clsx(
                              'flex w-full items-center gap-2.5 rounded border border-neutral bg-surface-neutral px-2.5 py-2 text-neutral hover:border-neutral-component hover:text-neutral',
                              {
                                'text-neutral-300': !service.is_part_last_deployment,
                              }
                            )}
                          >
                            <ServiceAvatar
                              service={fullService}
                              border="solid"
                              size="sm"
                              className={clsx('border-neutral', {
                                'opacity-50': !service.is_part_last_deployment,
                              })}
                            />
                            <span className="flex flex-col gap-0.5 text-sm">
                              <Truncate text={fullService.name} truncateLimit={16} />
                              {serviceTotalDurationSec && (
                                <span className="text-xs">
                                  {Math.floor(serviceTotalDurationSec / 60)}m {serviceTotalDurationSec % 60}s
                                </span>
                              )}
                            </span>
                            <StatusChip
                              className="ml-auto"
                              status={!service.is_part_last_deployment ? 'SKIPPED' : service.state}
                            />
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
                      fill="var(--neutral-6)"
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

function RouteComponent() {
  const { organizationId, projectId, environmentId } = Route.useParams()

  return (
    <div className="container mx-auto flex min-h-page-container flex-col pt-6">
      <Section className="min-h-0 flex-1 gap-8">
        <div className="flex min-h-0 flex-1 flex-col gap-8 pb-20">
          <Suspense fallback={<div>loading....</div>}>
            <Pipeline />
          </Suspense>
        </div>
      </Section>
    </div>
  )
}
