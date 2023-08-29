import { DatabaseModeEnum, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { type LoadingStatus } from '@qovery/shared/interfaces'
import { LoaderSpinner } from '@qovery/shared/ui'
import { type logsType } from '../layout-logs'

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
  const defaultLoader = (
    <div className="w-full flex justify-center text-center">
      <LoaderSpinner className="w-6 h-6" theme="dark" />
    </div>
  )

  const deploymentPlaceholder = () => {
    const outOfDateOrUpToDate =
      serviceDeploymentStatus === ServiceDeploymentStatusEnum.NEVER_DEPLOYED ||
      serviceDeploymentStatus === ServiceDeploymentStatusEnum.UP_TO_DATE

    const displaySpinner = loadingStatus !== 'loaded' && itemsLength === 0 && !hideLogs && !serviceDeploymentStatus

    const displayPlaceholders = loadingStatus === 'loaded' && hideLogs

    if (displaySpinner) {
      // Display loader spinner
      return defaultLoader
    } else {
      if (displayPlaceholders) {
        return (
          <div>
            {!customPlaceholder && outOfDateOrUpToDate ? (
              <>
                {/* Display message about no logs available */}
                <p className="text-neutral-50 font-medium mb-1">
                  No logs on this execution for <span className="text-brand-400">{serviceName}</span>.
                </p>
                {serviceDeploymentStatus !== ServiceDeploymentStatusEnum.NEVER_DEPLOYED && (
                  <p className="text-neutral-300 font-normal text-sm">
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
      return defaultLoader
    }
  }

  return (
    <div data-testid="placeholder-screen" className="w-full h-full pt-[88px] bg-neutral-650 text-center">
      {type === 'deployment' && deploymentPlaceholder()}

      {type === 'live' && (
        <div>
          {databaseMode !== DatabaseModeEnum.MANAGED && loadingStatus !== 'loaded' && itemsLength === 0 ? (
            defaultLoader
          ) : (
            <div className="text-center">
              <p className="text-neutral-50 font-medium mb-1">
                No logs on this execution for <span className="text-brand-400">{serviceName}</span>.
              </p>

              {databaseMode === DatabaseModeEnum.MANAGED && (
                <p className="text-neutral-300 font-normal text-sm">
                  Managed Databases are managed by your cloud providers. Logs can be found within your cloud provider
                  console.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {type === 'infra' && (
        <div>
          {!loadingStatus || loadingStatus === 'not loaded' ? (
            defaultLoader
          ) : (
            <p className="text-neutral-50 font-medium mb-1">No logs available.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default PlaceholderLogs
