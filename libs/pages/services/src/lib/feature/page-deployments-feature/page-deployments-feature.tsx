import { useParams } from 'react-router-dom'
import { useDeploymentHistoryLegacy } from '@qovery/domains/environments/feature'
import { deploymentMock } from '@qovery/shared/factories'
import { mergeDeploymentServicesLegacy } from '@qovery/shared/util-js'
import PageDeployments from '../../ui/page-deployments/page-deployments'

export function PageDeploymentsFeature() {
  const { environmentId = '' } = useParams()

  const { isLoading: loadingStatusDeployments, data: environmentDeploymentHistory } = useDeploymentHistoryLegacy({
    environmentId,
  })

  return (
    <PageDeployments
      deployments={
        !loadingStatusDeployments
          ? environmentDeploymentHistory && mergeDeploymentServicesLegacy(environmentDeploymentHistory)
          : mergeDeploymentServicesLegacy([deploymentMock])
      }
      isLoading={loadingStatusDeployments}
    />
  )
}

export default PageDeploymentsFeature
