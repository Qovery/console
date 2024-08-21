import { DatabaseModeEnum, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { P, match } from 'ts-pattern'
import { type LoadingStatus } from '@qovery/shared/interfaces'
import { type logsType } from '../layout-logs'
import LivePlaceholder from './live-placeholder/live-placeholder'
import { LoaderPlaceholder } from './loader-placeholder/loader-placeholder'

export interface PlaceholderLogsProps {
  type: logsType
  serviceName?: string
  loadingStatus?: LoadingStatus
  databaseMode?: DatabaseModeEnum
  customPlaceholder?: string | ReactNode
  serviceDeploymentStatus?: ServiceDeploymentStatusEnum
  itemsLength?: number
  hideLogs?: boolean
}

export function PlaceholderLogs({
  type,
  serviceName,
  loadingStatus,
  databaseMode,
  customPlaceholder,
  serviceDeploymentStatus,
  itemsLength,
  hideLogs,
}: PlaceholderLogsProps) {
  const deploymentPlaceholder = () => {
    const outOfDateOrUpToDate =
      serviceDeploymentStatus === ServiceDeploymentStatusEnum.NEVER_DEPLOYED ||
      serviceDeploymentStatus === ServiceDeploymentStatusEnum.UP_TO_DATE

    const displaySpinner = match({ loadingStatus, itemsLength, hideLogs, serviceDeploymentStatus })
      .with(
        {
          loadingStatus: P.not('loaded'),
          itemsLength: 0,
          hideLogs: false,
          serviceDeploymentStatus: P.nullish,
        },
        () => true
      )
      .otherwise(() => false)

    const displayPlaceholders = loadingStatus === 'loaded' && hideLogs

    if (displaySpinner) {
      // Display loader spinner
      return <LoaderPlaceholder />
    } else {
      if (displayPlaceholders) {
        return (
          <div>
            {!customPlaceholder && outOfDateOrUpToDate ? (
              <>
                {/* Display message about no logs available */}
                <p className="mb-1 font-medium text-neutral-50">
                  No logs on this execution for <span className="text-brand-400">{serviceName}</span>.
                </p>
                {serviceDeploymentStatus !== ServiceDeploymentStatusEnum.NEVER_DEPLOYED && (
                  <p className="text-sm font-normal text-neutral-300">
                    This service was deployed more than 30 days ago and thus no deployment logs are available.
                  </p>
                )}
              </>
            ) : (
              // Display custom placeholder with list of history deployments
              customPlaceholder
            )}
          </div>
        )
      }

      // Return the default loader spinner
      return <LoaderPlaceholder />
    }
  }

  return (
    <div data-testid="placeholder-screen" className="h-full w-full bg-neutral-650 pt-[88px] text-center">
      {type === 'deployment' && deploymentPlaceholder()}

      {type === 'live' && (
        <LivePlaceholder
          serviceName={serviceName}
          databaseMode={databaseMode}
          loadingStatus={loadingStatus}
          itemsLength={itemsLength}
        />
      )}

      {type === 'infra' && (
        <div>
          {!loadingStatus || loadingStatus === 'not loaded' ? (
            <LoaderPlaceholder />
          ) : (
            <p className="mb-1 font-medium text-neutral-50">No logs available (yet).</p>
          )}
        </div>
      )}
    </div>
  )
}

export default PlaceholderLogs
