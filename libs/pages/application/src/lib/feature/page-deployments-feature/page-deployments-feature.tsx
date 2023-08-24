import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  applicationsLoadingStatus,
  fetchApplicationDeployments,
  getApplicationsState,
} from '@qovery/domains/application'
import { getServiceType } from '@qovery/shared/enums'
import { applicationDeploymentsFactoryMock } from '@qovery/shared/factories'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { type BaseLink } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import { PageDeployments } from '../../ui/page-deployments/page-deployments'

export function PageDeploymentsFeature() {
  const { applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )

  const loadingApplicationsDeployments = applicationDeploymentsFactoryMock(3)

  const loadingStatus = useSelector<RootState>((state) => applicationsLoadingStatus(state))
  const loadingStatusDeployments = application?.deployments?.loadingStatus
  const isLoading = loadingStatus !== 'loaded' || loadingStatusDeployments !== 'loaded'

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
      linkLabel: 'How to configure my application',
      external: true,
    },
  ]

  const serviceType = getServiceType(application as ApplicationEntity)

  useEffect(() => {
    if (loadingStatus === 'loaded') {
      dispatch(fetchApplicationDeployments({ applicationId, serviceType }))
    }
  }, [dispatch, applicationId, loadingStatus, serviceType])

  return (
    <PageDeployments
      deployments={!isLoading ? application?.deployments?.items : loadingApplicationsDeployments}
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading}
    />
  )
}

export default PageDeploymentsFeature
