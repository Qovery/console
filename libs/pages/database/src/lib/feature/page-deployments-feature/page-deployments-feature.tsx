import { type DeploymentHistoryDatabase } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { databasesLoadingStatus } from '@qovery/domains/database'
import { useDeploymentHistory, useServiceType } from '@qovery/domains/services/feature'
import { databaseDeploymentsFactoryMock } from '@qovery/shared/factories'
import { type BaseLink } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type RootState } from '@qovery/state/store'
import { PageDeployments } from '../../ui/page-deployments/page-deployments'

export function PageDeploymentsFeature() {
  useDocumentTitle('Database Deployments - Qovery')

  const { databaseId = '', environmentId = '' } = useParams()
  const { data: serviceType } = useServiceType({ serviceId: databaseId, environmentId })
  const { data: deploymentHistory, isLoading: isDeploymentHistoryLoading } = useDeploymentHistory({
    serviceId: databaseId,
    serviceType,
  })

  const loadingDatabasesDeployments = databaseDeploymentsFactoryMock(3)

  const loadingStatus = useSelector<RootState>((state) => databasesLoadingStatus(state))
  const isLoading = loadingStatus !== 'loaded' || isDeploymentHistoryLoading

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database',
      linkLabel: 'How to configure my database',
    },
  ]

  return (
    <PageDeployments
      deployments={
        !isLoading ? ((deploymentHistory?.results ?? []) as DeploymentHistoryDatabase[]) : loadingDatabasesDeployments
      }
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading}
    />
  )
}

export default PageDeploymentsFeature
