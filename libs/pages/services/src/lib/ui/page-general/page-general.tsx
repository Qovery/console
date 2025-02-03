import { useDocumentTitle } from '@uidotdev/usehooks'
import { useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceList } from '@qovery/domains/services/feature'

export function PageGeneral() {
  const { environmentId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })
  useDocumentTitle('Services - General')

  return environment && <ServiceList className="border-b border-b-neutral-200" environment={environment} />
}

export default PageGeneral
