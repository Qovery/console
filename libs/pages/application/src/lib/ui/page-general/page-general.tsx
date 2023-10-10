import { type ContainerRegistryResponse } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { PodsMetrics, ServiceDetails } from '@qovery/domains/services/feature'
import { type ApplicationEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { type BaseLink, HelpSection } from '@qovery/shared/ui'

export interface PageGeneralProps {
  application?: ApplicationEntity
  listHelpfulLinks: BaseLink[]
  loadingStatus?: LoadingStatus
  serviceStability?: number
  currentRegistry?: ContainerRegistryResponse
}

export function PageGeneral(props: PageGeneralProps) {
  const { application, listHelpfulLinks } = props
  const { environmentId = '', applicationId = '' } = useParams()

  return (
    <div className="mt-2 bg-white rounded flex flex-grow min-h-0">
      <div className="flex flex-col grow">
        <div className="flex flex-row grow">
          <div className="py-7 px-10 flex-grow overflow-y-auto min-h-0">
            {application && application.environment && (
              <PodsMetrics environmentId={application.environment.id} serviceId={application.id} />
            )}
          </div>
          <ServiceDetails className="w-[360px] border-l" environmentId={environmentId} serviceId={applicationId} />
        </div>
        <div className="bg-white rounded-b flex flex-col justify-end">
          <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
        </div>
      </div>
    </div>
  )
}

export default PageGeneral
