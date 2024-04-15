import { useParams } from 'react-router-dom'
import { useDeploymentHistory } from '@qovery/domains/environments/feature'
import { deploymentMock } from '@qovery/shared/factories'
import { mergeDeploymentServices } from '@qovery/shared/util-js'
import PageDeployments from '../../ui/page-deployments/page-deployments'

export function PageDeploymentsFeature() {
  const { environmentId = '' } = useParams()

  const { isLoading: loadingStatusDeployments, data: environmentDeploymentHistory } = useDeploymentHistory({
    environmentId,
  })

  return (
    <PageDeployments
      deployments={
        !loadingStatusDeployments
          ? environmentDeploymentHistory && mergeDeploymentServices(environmentDeploymentHistory)
          : mergeDeploymentServices([deploymentMock])
      }
      isLoading={loadingStatusDeployments}
    />
  )
}

export default PageDeploymentsFeature
