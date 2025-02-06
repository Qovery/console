import { useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceDeploymentList } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export function PageDeploymentsFeature() {
  useDocumentTitle('Database deployments - Qovery')

  const { databaseId = '', environmentId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })

  return <ServiceDeploymentList environment={environment} serviceId={databaseId} />
}

export default PageDeploymentsFeature
