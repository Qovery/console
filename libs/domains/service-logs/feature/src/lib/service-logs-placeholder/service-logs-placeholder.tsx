import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { useDeploymentStatus } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Icon, Link, LoaderSpinner } from '@qovery/shared/ui'
import { useNetworkState } from '@qovery/shared/util-hooks'

export function LoaderPlaceholder() {
  return (
    <div className="flex w-full justify-center text-center">
      <LoaderSpinner className="h-6 w-6" theme="dark" />
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
        <div>
          <LoaderPlaceholder />
          <div className="mt-4 flex flex-col gap-1">
            {showPlaceholder && (
              <p className="text-center text-sm font-medium text-neutral-300">
                Processing is taking more than 10s <br /> No logs available, please check the service configuration
              </p>
            )}
            {effectiveType !== undefined && effectiveType !== '4g' && (
              <p className="text-center text-sm font-medium text-neutral-350">Your connection is slow.</p>
            )}
          </div>
        </div>
      )
    )
    .with(
      {
        itemsLength: 0,
        deploymentState: P.when((state) => state === 'READY' || state === 'STOPPED'),
      },
      () =>
        showPlaceholder ? (
          <div className="text-center">
            <p className="mb-1 font-medium text-neutral-50">
              No logs available for <span className="text-brand-400">{serviceName}</span>.
            </p>
            <p className="mb-4 text-sm font-normal text-neutral-300">Please check if the service is up and running.</p>
            <Link
              as="button"
              size="sm"
              color="neutral"
              to={ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(serviceId)}
            >
              Go to latest deployment
              <Icon iconName="arrow-right" className="ml-1" />
            </Link>
          </div>
        ) : (
          <LoaderPlaceholder />
        )
    )
    .otherwise(() => (
      <div className="text-center">
        <p className="mb-1 font-medium text-neutral-50">
          No logs are available for <span className="text-brand-400">{serviceName}</span>.
        </p>

        {databaseMode === DatabaseModeEnum.MANAGED && (
          <p className="text-sm font-normal text-neutral-300">
            Managed Databases are managed by your cloud providers. Logs can be found within your cloud provider console.
          </p>
        )}
      </div>
    ))
}

export default ServiceLogsPlaceholder
