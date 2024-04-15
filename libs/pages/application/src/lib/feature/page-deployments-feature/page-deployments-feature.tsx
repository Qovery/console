import { type DeploymentHistoryApplication } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useDeploymentHistory, useServiceType } from '@qovery/domains/services/feature'
import { applicationDeploymentsFactoryMock } from '@qovery/shared/factories'
import { PageDeployments } from '../../ui/page-deployments/page-deployments'

export function PageDeploymentsFeature() {
  const { applicationId = '', environmentId = '' } = useParams()
  const { data: serviceType } = useServiceType({ serviceId: applicationId, environmentId })
  const { data: deployments, isLoading: isDeploymentHistoryLoading } = useDeploymentHistory({
    serviceId: applicationId,
    serviceType,
  })

  const loadingApplicationsDeployments = applicationDeploymentsFactoryMock(3)

  return (
    <PageDeployments
      deployments={
        !isDeploymentHistoryLoading
          ? ((deployments?.results ?? []) as DeploymentHistoryApplication[])
          : loadingApplicationsDeployments
      }
      isLoading={isDeploymentHistoryLoading}
    />
  )
}

export default PageDeploymentsFeature
