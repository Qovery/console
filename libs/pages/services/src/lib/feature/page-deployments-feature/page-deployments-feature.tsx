import { useParams } from 'react-router-dom'
import { EnvironmentDeploymentList } from '@qovery/domains/environments/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export function PageDeploymentsFeature() {
  const { environmentId = '' } = useParams()
  useDocumentTitle('Services - Deployment history')

  return <EnvironmentDeploymentList environmentId={environmentId} />
}

export default PageDeploymentsFeature
