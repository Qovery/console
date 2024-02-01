import { useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceList } from '@qovery/domains/services/feature'
import { type BaseLink, HelpSection } from '@qovery/shared/ui'

export interface PageGeneralProps {
  listHelpfulLinks: BaseLink[]
}

export function PageGeneral({ listHelpfulLinks }: PageGeneralProps) {
  const { environmentId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })

  return (
    <>
      <div className="mt-2 bg-white rounded-t-sm rounded-b-none flex-grow overflow-y-auto min-h-0">
        {environment && <ServiceList className="border-b-neutral-200 border-b" environment={environment} />}
      </div>

      <div className="bg-white rounded-b flex flex-col justify-end">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export default PageGeneral
