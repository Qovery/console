import { type LoadingStatus } from '@qovery/shared/interfaces'
import { type logsType } from '../layout-logs'
import { LoaderPlaceholder } from './loader-placeholder/loader-placeholder'

export interface PlaceholderLogsProps {
  type: logsType
  loadingStatus?: LoadingStatus
}

export function PlaceholderLogs({ type, loadingStatus }: PlaceholderLogsProps) {
  return (
    <div data-testid="placeholder-screen" className="h-full w-full bg-neutral-650 pt-[88px] text-center">
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
