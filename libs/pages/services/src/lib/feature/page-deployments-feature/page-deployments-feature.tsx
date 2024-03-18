import { useParams } from 'react-router-dom'
import { useDeploymentHistory } from '@qovery/domains/environments/feature'
import { deploymentMock } from '@qovery/shared/factories'
import { type BaseLink } from '@qovery/shared/ui'
import { mergeDeploymentServices } from '@qovery/shared/util-js'
import PageDeployments from '../../ui/page-deployments/page-deployments'

export function PageDeploymentsFeature() {
  const { environmentId = '' } = useParams()

  const { isLoading: loadingStatusDeployments, data: environmentDeploymentHistory } = useDeploymentHistory({
    environmentId,
  })

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment',
      linkLabel: 'How to manage my environment',
    },
  ]

  return (
    <PageDeployments
      deployments={
        !loadingStatusDeployments
          ? environmentDeploymentHistory && mergeDeploymentServices(environmentDeploymentHistory)
          : mergeDeploymentServices([deploymentMock])
      }
      listHelpfulLinks={listHelpfulLinks}
      isLoading={loadingStatusDeployments}
    />
  )
}

export default PageDeploymentsFeature
