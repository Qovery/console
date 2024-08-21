import { DatabaseModeEnum, type StateEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { P, match } from 'ts-pattern'
import { type LoadingStatus } from '@qovery/shared/interfaces'
import { LoaderPlaceholder } from '../loader-placeholder/loader-placeholder'

export interface LivePlaceholderProps {
  serviceName?: string
  loadingStatus?: LoadingStatus
  databaseMode?: DatabaseModeEnum
  itemsLength?: number
  deploymentState?: StateEnum
}

export function LivePlaceholder({
  serviceName,
  databaseMode,
  loadingStatus,
  itemsLength,
  deploymentState,
}: LivePlaceholderProps) {
  const [showPlaceholder, setShowPlaceholder] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPlaceholder(true)
    }, 10000)
    return () => clearTimeout(timer)
  }, [])

  return match({ databaseMode, loadingStatus, itemsLength, deploymentState })
    .with(
      {
        databaseMode: P.not(DatabaseModeEnum.MANAGED),
        loadingStatus: P.not('loaded'),
        itemsLength: 0,
        deploymentState: P.when((state) => state !== 'READY' && state !== 'STOPPED'),
      },
      () => <LoaderPlaceholder />
    )
    .with({ itemsLength: 0, deploymentState: P.when((state) => state === 'READY' || state === 'STOPPED') }, () =>
      showPlaceholder ? (
        <div className="text-center">
          <p className="mb-1 font-medium text-neutral-50">
            No logs available for <span className="text-brand-400">{serviceName}</span>.
          </p>
          <p className="text-sm font-normal text-neutral-300">Please check if the service is up and running.</p>
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

export default LivePlaceholder
