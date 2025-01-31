import { useParams } from 'react-router-dom'
import { EnvironmentDeploymentList } from '@qovery/domains/environments/feature'

export function PageDeploymentsFeature() {
  const { environmentId = '' } = useParams()

  return <EnvironmentDeploymentList environmentId={environmentId} />
}

export default PageDeploymentsFeature
