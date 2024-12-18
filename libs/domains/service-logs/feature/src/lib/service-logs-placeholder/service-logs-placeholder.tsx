import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { useDeploymentStatus } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Icon, Link, LoaderDots } from '@qovery/shared/ui'
import { useNetworkState } from '@qovery/shared/util-hooks'

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
  serviceName?: string
  databaseMode?: DatabaseModeEnum
  itemsLength?: number
}

export function ServiceLogsPlaceholder({ serviceName, databaseMode, itemsLength }: ServiceLogsPlaceholderProps) {
  const { organizationId, projectId, environmentId, serviceId } = useParams()
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId })
  const { state: deploymentState } = deploymentStatus ?? {}
  const [showPlaceholder, setShowPlaceholder] = useState(false)
  const { effectiveType } = useNetworkState()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPlaceholder(true)
    }, 10000)
    return () => clearTimeout(timer)
  }, [])

  return match({ databaseMode, itemsLength, deploymentState })
    .with(
      {
        databaseMode: P.not(DatabaseModeEnum.MANAGED),
        itemsLength: 0,
        deploymentState: P.when((state) => state !== 'READY' && state !== 'STOPPED'),
      },
      () => (
        <>
          <LoaderPlaceholder
            title={showPlaceholder ? 'Processing is taking more than 10s' : 'Service logs are loading…'}
            description={showPlaceholder && 'No logs available, please check the service configuration.'}
          />
          {effectiveType !== undefined && effectiveType !== '4g' && (
            <p className="mt-0.5 text-center text-sm text-neutral-350">Your connection is slow</p>
          )}
        </>
      )
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
    .otherwise(() => (
      <>
        <p className="mb-1 text-neutral-50">No logs are available for {serviceName}.</p>
        {databaseMode === DatabaseModeEnum.MANAGED && (
          <p className="text-sm text-neutral-300">
            Managed Databases are managed by your cloud providers. Logs can be found within your cloud provider console.
          </p>
        )}
      </>
    ))
}

export default ServiceLogsPlaceholder
