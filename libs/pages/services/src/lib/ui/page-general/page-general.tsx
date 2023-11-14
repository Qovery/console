import { useParams } from 'react-router-dom'
import { ServiceList } from '@qovery/domains/services/feature'
import { type BaseLink, HelpSection } from '@qovery/shared/ui'

export interface PageGeneralProps {
  listHelpfulLinks: BaseLink[]
}

export function PageGeneral({ listHelpfulLinks }: PageGeneralProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  return (
    <>
      <div className="mt-2 bg-white rounded-t-sm rounded-b-none flex-grow overflow-y-auto min-h-0">
        <ServiceList
          className="border-b-neutral-200 border-b"
          organizationId={organizationId}
          projectId={projectId}
          environmentId={environmentId}
        />
      </div>

      <div className="bg-white rounded-b flex flex-col justify-end">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export default PageGeneral
