import { subDays } from 'date-fns'
import { DatabaseModeEnum, type Environment } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { useQueryParams } from 'use-query-params'
import { useDeploymentStatus } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { Button, Icon, Link, LoaderDots, Tooltip } from '@qovery/shared/ui'
import { useServiceDeploymentId } from '../hooks/use-service-deployment-id/use-service-deployment-id'
import { queryParamsServiceLogs } from '../list-service-logs/service-logs-context/service-logs-context'

export function LoaderPlaceholder({
  title = 'Service logs are loading…',
  description,
}: {
  title?: ReactNode
  description?: ReactNode
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 text-center">
      <LoaderDots />
      <div className="flex flex-col gap-3">
        <p className="text-neutral-300">{title}</p>
        {description && <span className="text-sm text-neutral-350">{description}</span>}
      </div>
    </div>
  )
}

export interface ServiceLogsPlaceholderProps {
  environment: Environment
  type: 'live' | 'history'
  isFetched?: boolean
  serviceName?: string
  databaseMode?: DatabaseModeEnum
  itemsLength?: number
}

export function ServiceLogsPlaceholder({
  environment,
  type = 'live',
  isFetched = false,
  serviceName,
  databaseMode,
  itemsLength,
}: ServiceLogsPlaceholderProps) {
  const { organizationId, projectId, environmentId, serviceId } = useParams()
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId })
  const { state: deploymentState } = deploymentStatus ?? {}
  const [showPlaceholder, setShowPlaceholder] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [queryParams, setQueryParams] = useQueryParams(queryParamsServiceLogs)

  const { data: deploymentIds = [] } = useServiceDeploymentId({
    clusterId: environment.cluster_id ?? '',
    serviceId: serviceId ?? '',
    enabled: Boolean(environment.cluster_id) && Boolean(serviceId),
  })

  const hasFilters = useMemo(() => {
    return Object.values(queryParams).some((value) => value !== undefined && value !== '')
  }, [queryParams])

  const hasFilterHistory = useMemo(() => {
    const filteredValues = Object.values(
      Object.fromEntries(
        Object.entries(queryParams).filter(([key]) => key !== 'startDate' && key !== 'endDate')
      ) as Record<string, string | boolean | undefined>
    ).some((value) => value !== undefined && value !== '')
    return filteredValues
  }, [queryParams])

  const deploymentId = useMemo(() => {
    const currentDeploymentId = queryParams.deploymentId
    if (!currentDeploymentId) {
      return undefined
    }
    const currentNumber = parseInt(currentDeploymentId.split('-').pop() || '0', 10)
    const lowerDeployments = deploymentIds
      .filter((id) => {
        const number = parseInt(id.split('-').pop() || '0', 10)
        return number < currentNumber
      })
      .sort((a, b) => {
        const numA = parseInt(a.split('-').pop() || '0', 10)
        const numB = parseInt(b.split('-').pop() || '0', 10)
        return numB - numA
      })

    // Return the first one (highest of the lower ones) or undefined
    return lowerDeployments[0]
  }, [deploymentIds, queryParams.deploymentId])

  const hasDeploymentIdFilter = useMemo(() => {
    return Boolean(queryParams.deploymentId)
  }, [queryParams.deploymentId])

  useEffect(() => {
    // Hide the placeholder after x seconds if no logs are found
    const timer = setTimeout(() => {
      setShowPlaceholder(true)
    }, 4000)
    // Hack to avoid the placeholder from being shown for too long
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 4000)

    return () => {
      clearTimeout(timer)
      clearTimeout(loadingTimer)
      setIsLoading(true)
    }
  }, [])

  function NoLogsPlaceholder({
    serviceName,
    databaseMode,
    hasFilters,
    hasDeploymentIdFilter,
  }: {
    serviceName?: string
    databaseMode?: DatabaseModeEnum
    hasFilters?: boolean
    hasDeploymentIdFilter?: boolean
  }) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col gap-1">
          {hasDeploymentIdFilter ? (
            <p className="text-neutral-50">No logs found for the selected deployment id</p>
          ) : (
            <p className="text-neutral-50">
              {hasFilters
                ? 'No logs found for the selected filters'
                : `No logs are available for your service ${serviceName}`}
            </p>
          )}
          {databaseMode === DatabaseModeEnum.MANAGED && (
            <p className="text-sm text-neutral-350">
              Managed databases are handled by your cloud provider. Logs are accessible in your cloud provider console
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {hasFilters && type === 'history' && (
            <Button
              size="sm"
              variant="surface"
              color="neutral"
              className="max-w-max"
              onClick={() => {
                setQueryParams({
                  level: undefined,
                  instance: undefined,
                  message: undefined,
                  search: undefined,
                  version: undefined,
                  container: undefined,
                  nginx: undefined,
                  deploymentId: undefined,
                })

                setShowPlaceholder(false)
              }}
            >
              Reset filters
            </Button>
          )}
          {deploymentId && (
            <Tooltip content={deploymentId} side="bottom">
              <Link
                as="button"
                size="sm"
                color="brand"
                className="max-w-max"
                to={
                  ENVIRONMENT_LOGS_URL(organizationId, projectId, environment.id) +
                  SERVICE_LOGS_URL(serviceId, undefined, deploymentId, 'history', subDays(new Date(), 28).toISOString())
                }
              >
                Go to previous deployment with service logs associated
              </Link>
            </Tooltip>
          )}
        </div>
      </div>
    )
  }

  if (databaseMode === DatabaseModeEnum.MANAGED) {
    return <NoLogsPlaceholder serviceName={serviceName} databaseMode={databaseMode} />
  }

  return match({ itemsLength, deploymentState, type })
    .with(
      {
        itemsLength: 0,
        deploymentState: P.when((state) => state !== 'READY' && state !== 'STOPPED'),
        type: 'live',
      },
      () => {
        if (!showPlaceholder) {
          return <LoaderPlaceholder />
        }

        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex flex-col items-center justify-center gap-0.5">
              {hasFilters ? (
                <div className="flex flex-col gap-0.5">
                  <p className="text-neutral-50">No logs found for the selected filters for now</p>
                  <p className="text-sm text-neutral-350">Live logs will show up here once they're available</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <p className="text-neutral-50">No logs are available for your service {serviceName}</p>
                  <p className="text-sm text-neutral-350">Please check the service configuration</p>
                </div>
              )}
            </div>
            {hasFilters && (
              <Button
                size="sm"
                variant="surface"
                color="neutral"
                onClick={() => {
                  setQueryParams({
                    startDate: undefined,
                    endDate: undefined,
                    level: undefined,
                    instance: undefined,
                    message: undefined,
                    search: undefined,
                    version: undefined,
                    container: undefined,
                    nginx: undefined,
                    deploymentId: undefined,
                  })

                  setShowPlaceholder(false)
                }}
              >
                Reset filters
              </Button>
            )}
          </div>
        )
      }
    )
    .with(
      {
        itemsLength: 0,
        deploymentState: P.when((state) => state === 'READY' || state === 'STOPPED'),
      },
      () =>
        showPlaceholder ? (
          <>
            <p className="mb-1 text-neutral-300">No service logs available for {serviceName}</p>
            <p className="mb-4 text-sm text-neutral-350">Please check if the service is up and running</p>
            <Link
              as="button"
              size="sm"
              variant="surface"
              color="neutral"
              to={
                ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
                DEPLOYMENT_LOGS_VERSION_URL(serviceId, deploymentStatus?.execution_id)
              }
            >
              Go to latest deployment
              <Icon iconName="arrow-right" className="ml-1" />
            </Link>
          </>
        ) : (
          <LoaderPlaceholder />
        )
    )
    .otherwise(() => {
      if (!isLoading && isFetched) {
        if (type === 'history') {
          return (
            <NoLogsPlaceholder
              serviceName={serviceName}
              databaseMode={databaseMode}
              hasFilters={hasFilterHistory}
              hasDeploymentIdFilter={hasDeploymentIdFilter}
            />
          )
        } else {
          return (
            <NoLogsPlaceholder
              serviceName={serviceName}
              databaseMode={databaseMode}
              hasDeploymentIdFilter={hasDeploymentIdFilter}
            />
          )
        }
      }

      return <LoaderPlaceholder />
    })
}

export default ServiceLogsPlaceholder
