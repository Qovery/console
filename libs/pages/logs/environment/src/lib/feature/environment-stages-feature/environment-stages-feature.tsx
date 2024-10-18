import { type CheckedState } from '@radix-ui/react-checkbox'
import clsx from 'clsx'
import {
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { Fragment } from 'react/jsx-runtime'
import { match } from 'ts-pattern'
import { EnvironmentStages } from '@qovery/domains/environment-logs/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceAvatar, useServices } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_URL, DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Icon, LoaderSpinner, StageStatusChip, StatusChip, Tooltip, Truncate } from '@qovery/shared/ui'
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

  const { versionId } = useParams()
  const { data: services = [] } = useServices({ environmentId: environment.id })

  const [hideSkipped, setHideSkipped] = useState<CheckedState>(false)

  const getServiceById = (id: string) => services.find((service) => service.id === id) as AnyService

  if (!environmentStatus) {
    return (
      <div className="h-[calc(100vh-64px)] w-[calc(100vw-64px)] p-1">
        <div className="flex h-full w-full justify-center border border-neutral-500 bg-neutral-600 pt-11">
          <LoaderSpinner className="h-6 w-6" theme="dark" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-neutral-800">
      <EnvironmentStages
        environment={environment}
        environmentStatus={environmentStatus}
        deploymentStages={deploymentStages}
        preCheckStage={preCheckStage}
        hideSkipped={hideSkipped}
        setHideSkipped={setHideSkipped}
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
                    <StageStatusChip status={s.stage?.status} />
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
                  <div className="flex max-h-[75vh] flex-col gap-1.5 overflow-x-hidden overflow-y-scroll bg-neutral-800 p-1.5">
                    {s.services.length > 0 ? (
                      s.services.map((service) => {
                        const fullService = getServiceById(service.id!)
                        const serviceTotalDurationSec = service?.steps?.total_duration_sec

                        if (hideSkipped && !service.is_part_last_deployment) return null
                        if (!fullService) return null

                        return (
                          <NavLink
                            key={service?.id}
                            to={
                              versionId
                                ? ENVIRONMENT_LOGS_URL(
                                    environment.organization.id,
                                    environment.project.id,
                                    environment.id
                                  ) + DEPLOYMENT_LOGS_VERSION_URL(service.id, versionId)
                                : ENVIRONMENT_LOGS_URL(
                                    environment.organization.id,
                                    environment.project.id,
                                    environment.id
                                  ) + DEPLOYMENT_LOGS_URL(service.id)
                            }
                            className={clsx(
                              'flex w-full items-center gap-2.5 rounded border border-neutral-400 bg-neutral-550 px-2.5 py-2 hover:border-brand-400',
                              {
                                'text-neutral-300': !service.is_part_last_deployment,
                              }
                            )}
                          >
                            <ServiceAvatar
                              service={fullService}
                              border="solid"
                              size="sm"
                              className={clsx('border-neutral-400', {
                                'opacity-50': !service.is_part_last_deployment,
                              })}
                            />
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
