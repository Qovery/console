import { useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceList } from '@qovery/domains/services/feature'

export function PageGeneral() {
  const { environmentId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })

  return (
    <>
      <div className="flex flex-col mt-2 bg-white rounded-t-sm rounded-b-none flex-grow min-h-0">
        {environment && <ServiceList className="border-b-neutral-200 border-b" environment={environment} />}
      </div>
    </>
  )
}

export default PageGeneral
