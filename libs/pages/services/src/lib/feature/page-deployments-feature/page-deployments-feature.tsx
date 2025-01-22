import { useParams } from 'react-router-dom'
import { ServiceDeploymentList } from '@qovery/domains/services/feature'

export function PageDeploymentsFeature() {
  const { environmentId = '' } = useParams()

  return <ServiceDeploymentList />
}

export default PageDeploymentsFeature
