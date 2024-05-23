import { useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceList } from '@qovery/domains/services/feature'

export function PageGeneral() {
  const { environmentId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })

  return (
    <>
      <div className="mt-2 flex min-h-0 flex-grow flex-col rounded-b-none rounded-t-sm bg-white">
        {environment && <ServiceList className="border-b border-b-neutral-200" environment={environment} />}
      </div>
    </>
  )
}

export default PageGeneral
