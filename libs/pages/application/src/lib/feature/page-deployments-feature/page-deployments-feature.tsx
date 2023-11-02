import { type DeploymentHistoryApplication } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { applicationsLoadingStatus } from '@qovery/domains/application'
import { useDeploymentHistory, useServiceType } from '@qovery/domains/services/feature'
import { applicationDeploymentsFactoryMock } from '@qovery/shared/factories'
import { type BaseLink } from '@qovery/shared/ui'
import { type RootState } from '@qovery/state/store'
import { PageDeployments } from '../../ui/page-deployments/page-deployments'

export function PageDeploymentsFeature() {
  const { applicationId = '', environmentId = '' } = useParams()
  const { data: serviceType } = useServiceType({ serviceId: applicationId, environmentId })
  const { data: deployments, isLoading: isDeploymentHistoryLoading } = useDeploymentHistory({
    serviceId: applicationId,
    serviceType,
  })

  const loadingApplicationsDeployments = applicationDeploymentsFactoryMock(3)

  const loadingStatus = useSelector<RootState>((state) => applicationsLoadingStatus(state))
  const isLoading = loadingStatus !== 'loaded' || isDeploymentHistoryLoading

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
      linkLabel: 'How to configure my application',
    },
  ]

  return (
    <PageDeployments
      deployments={
        !isLoading ? ((deployments?.results ?? []) as DeploymentHistoryApplication[]) : loadingApplicationsDeployments
      }
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading}
    />
  )
}

export default PageDeploymentsFeature
