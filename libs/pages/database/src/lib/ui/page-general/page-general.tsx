import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { PodsMetrics, ServiceDetails } from '@qovery/domains/services/feature'
import { type DatabaseEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { type BaseLink, HelpSection } from '@qovery/shared/ui'

export interface PageGeneralProps {
  database?: DatabaseEntity
  listHelpfulLinks: BaseLink[]
  loadingStatus?: LoadingStatus
}

export function PageGeneral(props: PageGeneralProps) {
  const { database, listHelpfulLinks } = props
  const { environmentId = '', databaseId = '' } = useParams()

  return (
    <div className="mt-2 bg-white rounded flex flex-grow min-h-0">
      <div className="flex h-full flex-col grow">
        <div className="flex flex-row grow">
          <div className="py-7 px-10 flex-grow overflow-auto">
            {database?.mode && database?.mode === DatabaseModeEnum.MANAGED ? (
              <div className="flex flex-col items-center gap-1 py-10 bg-neutral-100 text-sm text-neutral-350 border border-neutral-200">
                <span className="font-medium">Metrics for managed databases are not available</span>
                <span>Check your cloud provider console to get more information</span>
              </div>
            ) : (
              database &&
              database.environment && <PodsMetrics environmentId={database.environment.id} serviceId={database.id} />
            )}
          </div>
          <ServiceDetails className="w-[360px] border-l" environmentId={environmentId} serviceId={databaseId} />
        </div>
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks}></HelpSection>
      </div>
    </div>
  )
}

export default PageGeneral
