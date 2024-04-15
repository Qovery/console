import { type DeploymentHistoryDatabase } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useDeploymentHistory, useService, useServiceType } from '@qovery/domains/services/feature'
import { databaseDeploymentsFactoryMock } from '@qovery/shared/factories'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { PageDeployments } from '../../ui/page-deployments/page-deployments'

export function PageDeploymentsFeature() {
  useDocumentTitle('Database Deployments - Qovery')

  const { databaseId = '', environmentId = '' } = useParams()
  const { data: serviceType } = useServiceType({ serviceId: databaseId, environmentId })
  const { data: deploymentHistory, isLoading: isDeploymentHistoryLoading } = useDeploymentHistory({
    serviceId: databaseId,
    serviceType,
  })
  const { isLoading: isLoadingDatabase } = useService({ serviceId: databaseId, serviceType: 'DATABASE' })

  const loadingDatabasesDeployments = databaseDeploymentsFactoryMock(3)
  const isLoading = isLoadingDatabase || isDeploymentHistoryLoading

  return (
    <PageDeployments
      deployments={
        !isLoading ? ((deploymentHistory?.results ?? []) as DeploymentHistoryDatabase[]) : loadingDatabasesDeployments
      }
      isLoading={isLoading}
    />
  )
}

export default PageDeploymentsFeature
