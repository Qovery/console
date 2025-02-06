import { useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceDeploymentList } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export function PageDeploymentsFeature() {
  useDocumentTitle('Service deployments - Qovery')

  const { applicationId = '', environmentId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })

  return <ServiceDeploymentList environment={environment} serviceId={applicationId} />
}

export default PageDeploymentsFeature
