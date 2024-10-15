import { type CheckedState } from '@radix-ui/react-checkbox'
import clsx from 'clsx'
import {
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { EnvironmentStateChip } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceAvatar, useServices } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Checkbox, Icon, LoaderSpinner, StatusChip, Tooltip, Truncate } from '@qovery/shared/ui'
import HeaderLogs from '../header-logs/header-logs'

function matchServicesWithStatuses(deploymentStages: DeploymentStageWithServicesStatuses[]) {
  return deploymentStages.map((deploymentStage) => {
    const serviceTypes = ['applications', 'databases', 'containers', 'jobs', 'helms'] as const

    const services = serviceTypes
      .map((serviceType) => deploymentStage[serviceType])
      .flat()
      .map((service) => ({ ...service, status: service?.state }))

    return { services, stage: deploymentStage.stage }
  })
}

export interface EnvironmentStagesProps {
  environment: Environment
  environmentStatus?: EnvironmentStatus
  deploymentStages?: DeploymentStageWithServicesStatuses[]
}

export function EnvironmentStages({ environment, environmentStatus, deploymentStages }: EnvironmentStagesProps) {
  const { data: services = [] } = useServices({ environmentId: environment.id })
  const [hideSkipped, setHideSkipped] = useState<CheckedState>(false)

  const getServiceById = (id: string) => services.find((service) => service.id === id) as AnyService

  if (!environmentStatus) {
    return (
      <div className="h-[calc(100vh-64px)] w-[calc(100vw-64px)] p-1">
        <div className="flex h-full w-full justify-center bg-neutral-600 pt-11">
          <LoaderSpinner className="h-6 w-6" theme="dark" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] w-[calc(100vw-64px)] p-1">
      <HeaderLogs environment={environment} environmentStatus={environmentStatus}>
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
      </HeaderLogs>
      <div className="flex h-[calc(100vh-120px)] justify-center border border-t-0 border-neutral-500 bg-neutral-600">
        <div className="h-full w-full">
          <div className="flex gap-0.5 overflow-y-scroll px-6 py-6">
            {!deploymentStages ? (
              <div className="mt-6 flex h-full w-full justify-center">
                <LoaderSpinner className="h-6 w-6" theme="dark" />
              </div>
            ) : (
              <>
                {matchServicesWithStatuses(deploymentStages)?.map((s, index) => {
                  const stageTotalDurationSec = s.stage?.steps?.total_duration_sec ?? 0

                  if (hideSkipped && stageTotalDurationSec === 0) return null

                  return (
                    <>
                      <div
                        key={index}
                        className={clsx(
                          'h-fit w-60 min-w-60 overflow-hidden rounded border border-neutral-500 bg-neutral-650',
                          {
                            'text-neutral-50': stageTotalDurationSec > 0,
                            'text-neutral-300': stageTotalDurationSec === 0,
                          }
                        )}
                      >
                        <div className="flex items-center gap-3.5 border-b border-neutral-500 px-3 py-2.5">
                          {stageTotalDurationSec > 0 ? (
                            <EnvironmentStateChip mode="running" environmentId={environment.id} />
                          ) : (
                            <StatusChip status="SKIP" />
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="flex gap-1.5 text-sm font-medium">
                              {s?.stage?.name}
                              <Tooltip content="Description">
                                <span className="text-neutral-250">
                                  <Icon iconName="info-circle" iconStyle="regular" />
                                </span>
                              </Tooltip>
                            </span>
                            <span className="text-xs">
                              {Math.floor(stageTotalDurationSec / 60)}m:{stageTotalDurationSec % 60}s
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 bg-neutral-800 p-1.5">
                          {s.services.length > 0 ? (
                            s.services.map((service) => {
                              const fullService = getServiceById(service.id!)
                              const serviceTotalDurationSec = service?.steps?.total_duration_sec

                              if (hideSkipped && serviceTotalDurationSec === 0) return null
                              if (!fullService) return null

                              return (
                                <NavLink
                                  key={service?.id}
                                  to={
                                    ENVIRONMENT_LOGS_URL(
                                      environment.organization.id,
                                      environment.project.id,
                                      environment.id
                                    ) + DEPLOYMENT_LOGS_URL(service.id)
                                  }
                                  className="flex w-full items-center gap-2.5 rounded border border-neutral-400 bg-neutral-550 px-2.5 py-2 hover:border-brand-400"
                                >
                                  <ServiceAvatar
                                    service={fullService}
                                    border="solid"
                                    size="sm"
                                    className={clsx('border-neutral-400', {
                                      'opacity-50': stageTotalDurationSec === 0,
                                    })}
                                  />
                                  <span className="flex flex-col gap-0.5 text-sm">
                                    <Truncate text={fullService.name} truncateLimit={28} />
                                    {serviceTotalDurationSec && (
                                      <span className="text-xs">
                                        {Math.floor(serviceTotalDurationSec / 60)}m:{serviceTotalDurationSec % 60}s
                                      </span>
                                    )}
                                  </span>
                                  <StatusChip
                                    className="ml-auto"
                                    status={stageTotalDurationSec > 0 ? service.state : 'SKIP'}
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
                          <path
                            fill="#C6D3E7"
                            d="M16.092 4.5L8.592.17v8.66l7.5-4.33zm-16 .75h9.25v-1.5H.092v1.5z"
                          ></path>
                        </svg>
                      </div>
                    </>
                  )
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnvironmentStages
