import { useDocumentTitle } from '@uidotdev/usehooks'
import { useParams } from 'react-router-dom'
import { EnvironmentDeploymentList } from '@qovery/domains/environments/feature'

export function PageDeploymentsFeature() {
  const { environmentId = '' } = useParams()
  useDocumentTitle('Services - Deployment history')

  return <EnvironmentDeploymentList environmentId={environmentId} />
}

export default PageDeploymentsFeature
