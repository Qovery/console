import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { PodStatusesCallout, PodsMetrics, ServiceDetails } from '@qovery/domains/services/feature'

export interface PageGeneralProps {
  databaseMode?: DatabaseModeEnum
}

export function PageGeneral(props: PageGeneralProps) {
  const { databaseMode } = props
  const { environmentId = '', databaseId = '' } = useParams()

  return (
    <div className="flex h-full grow flex-col">
      <div className="flex grow flex-row">
        <div className="flex flex-1 grow flex-col gap-6 overflow-auto px-10 py-7">
          {databaseMode === DatabaseModeEnum.MANAGED ? (
            <div className="flex flex-col items-center gap-1 border border-neutral-200 bg-neutral-100 py-10 text-sm text-neutral-350">
              <span className="font-medium">Metrics for managed databases are not available</span>
              <span>Check your cloud provider console to get more information</span>
            </div>
          ) : (
            databaseId &&
            environmentId && (
              <>
                <PodStatusesCallout environmentId={environmentId} serviceId={databaseId} />
                <PodsMetrics environmentId={environmentId} serviceId={databaseId} />
              </>
            )
          )}
        </div>
        <ServiceDetails
          className="w-1/4 max-w-[360px] flex-1 border-l"
          environmentId={environmentId}
          serviceId={databaseId}
        />
      </div>
    </div>
  )
}

export default PageGeneral
