import { type CheckedState } from '@radix-ui/react-checkbox'
import clsx from 'clsx'
import {
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Fragment } from 'react/jsx-runtime'
import { match } from 'ts-pattern'
import { EnvironmentStages } from '@qovery/domains/environment-logs/feature'
import { useDeploymentHistory, useDeploymentHistoryExecutionId } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceAvatar, useServices } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
import {
  Banner,
  Icon,
  Indicator,
  LoaderSpinner,
  StageStatusChip,
  StatusChip,
  Tooltip,
  TriggerActionIcon,
  Truncate,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface EnvironmentStagesFeatureProps {
  environment: Environment
  deploymentStages?: DeploymentStageWithServicesStatuses[]
  environmentStatus?: EnvironmentStatus
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
}

export function matchServicesWithStatuses(deploymentStages?: DeploymentStageWithServicesStatuses[]) {
  if (!deploymentStages) return []

  return deploymentStages.map((deploymentStage) => {
    const serviceTypes = ['applications', 'databases', 'containers', 'jobs', 'helms'] as const

    const services = serviceTypes
      .map((serviceType) => deploymentStage[serviceType])
      .flat()
      .map((service) => ({ ...service, status: service?.state }))

    return { services, stage: deploymentStage.stage }
  })
}

export function EnvironmentStagesFeature({
  environment,
  environmentStatus,
  deploymentStages,
  preCheckStage,
}: EnvironmentStagesFeatureProps) {
  useDocumentTitle(`Environment stages ${environment ? `- ${environment?.name}` : '- Loading...'}`)

  const executionId = environmentStatus?.last_deployment_id

  const { data: services = [] } = useServices({ environmentId: environment.id })
  const { data: listDeploymentHistory = [] } = useDeploymentHistory({ environmentId: environment.id })
  const { data: deploymentHistory } = useDeploymentHistoryExecutionId({
    environmentId: environment.id,
    executionId,
  })

  const [hideSkipped, setHideSkipped] = useState<CheckedState>(false)
  const navigate = useNavigate()

  const getServiceById = (id: string) => services.find((service) => service.id === id) as AnyService
  const getServiceFromDeploymentHistoryId = (id: string) =>
    deploymentHistory?.stages.flatMap((s) => s.services).find((s) => s.identifier.service_id === id)

  if (!environmentStatus) {
    return (
      <div className="h-[calc(100vh-64px)] w-[calc(100vw-64px)] p-1">
        <div className="flex h-full w-full justify-center border border-neutral-500 bg-neutral-600 pt-11">
          <LoaderSpinner className="h-6 w-6" theme="dark" />
        </div>
      </div>
    )
  }

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

  return (
    <div className="h-full w-full bg-neutral-800">
      {showBannerNew && (
        <Banner
          color="purple"
          buttonLabel="See latest"
          buttonIconRight="arrow-right"
          onClickButton={() =>
            navigate(
              ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id) +
                ENVIRONMENT_STAGES_URL(lastDeploymentExecutionId)
            )
          }
        >
          A new deployment has been initiated
        </Banner>
      )}
      <EnvironmentStages
        environment={environment}
        environmentStatus={environmentStatus}
        deploymentStages={deploymentStages}
        preCheckStage={preCheckStage}
        hideSkipped={hideSkipped}
        setHideSkipped={setHideSkipped}
        deploymentHistory={deploymentHistory}
      >
        <>
          {matchServicesWithStatuses(deploymentStages)?.map((s) => {
            const stageTotalDurationSec = s.stage?.steps?.total_duration_sec ?? 0
            const stageName = s?.stage?.name || ''

            if (hideSkipped && s?.stage?.status === 'SKIPPED') return null

            return (
              <Fragment key={s.stage?.id}>
                <div
                  className={clsx(
                    'h-fit w-60 min-w-60 overflow-hidden rounded border border-neutral-500 bg-neutral-650',
                    {
                      'text-neutral-50': s?.stage?.status !== 'SKIPPED',
                      'text-neutral-300': s?.stage?.status === 'SKIPPED',
                    }
                  )}
                >
                  <div className="flex h-[58px] items-center gap-3.5 border-b border-neutral-500 px-3 py-2.5">
                    <Indicator
                      align="end"
                      side="right"
                      content={
                        s?.stage?.status !== 'SKIPPED' && (
                          <Tooltip content={upperCaseFirstLetter(deploymentHistory?.trigger_action)}>
                            <span>
                              <TriggerActionIcon
                                triggerAction={deploymentHistory?.trigger_action}
                                className="relative -left-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-650 text-xs text-neutral-250"
                              />
                            </span>
                          </Tooltip>
                        )
                      }
                    >
                      <StageStatusChip status={s.stage?.status} />
                    </Indicator>
                    <div className="flex flex-col gap-0.5">
                      <span className="flex gap-1.5 text-sm font-medium">
                        <Truncate text={upperCaseFirstLetter(stageName) || ''} truncateLimit={20} />
                        {s?.stage?.description && (
                          <Tooltip content={s?.stage?.description}>
                            <span className="text-neutral-250">
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
                  <div className="flex flex-col gap-1.5 bg-neutral-800 p-1.5">
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
                              className="flex w-full items-center gap-2.5 rounded border border-neutral-400 bg-neutral-550 px-2.5 py-2"
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 text-neutral-250">
                                <Icon iconName="trash-can-xmark" iconStyle="solid" />
                              </span>
                              <span className="text-sm">{serviceFromDeploymentHistoryId?.identifier.name}</span>
                            </div>
                          )

                        return (
                          <NavLink
                            key={service?.id}
                            to={
                              ENVIRONMENT_LOGS_URL(
                                environment.organization.id,
                                environment.project.id,
                                environment.id
                              ) + DEPLOYMENT_LOGS_VERSION_URL(service.id, executionId ?? '')
                            }
                            className={clsx(
                              'flex w-full items-center gap-2.5 rounded border border-neutral-400 bg-neutral-550 px-2.5 py-2 hover:border-brand-400',
                              {
                                'text-neutral-300': !service.is_part_last_deployment,
                              }
                            )}
                          >
                            <Indicator
                              align="end"
                              side="right"
                              content={
                                service.is_part_last_deployment && (
                                  <Tooltip content={upperCaseFirstLetter(deploymentHistory?.trigger_action)}>
                                    <span>
                                      <TriggerActionIcon
                                        triggerAction={deploymentHistory?.trigger_action}
                                        className="relative -left-0.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-550 text-xs text-neutral-250"
                                      />
                                    </span>
                                  </Tooltip>
                                )
                              }
                            >
                              <ServiceAvatar
                                service={fullService}
                                border="solid"
                                size="sm"
                                className={clsx('border-neutral-400', {
                                  'opacity-50': !service.is_part_last_deployment,
                                })}
                              />
                            </Indicator>
                            <span className="flex flex-col gap-0.5 text-sm">
                              <Truncate text={fullService.name} truncateLimit={18} />
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
                          </NavLink>
                        )
                      })
                    ) : (
                      <div className="px-3 py-6 text-center" data-testid="placeholder-stage">
                        <Icon iconName="wave-pulse" className="text-neutral-350" />
                        <p className="mt-1 text-xs font-medium text-neutral-350">No service for this stage.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 w-4 last:hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="9" fill="none" viewBox="0 0 17 9">
                    <path fill="#383E50" d="M16.092 4.5L8.592.17v8.66l7.5-4.33zm-16 .75h9.25v-1.5H.092v1.5z"></path>
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

export default EnvironmentStagesFeature
