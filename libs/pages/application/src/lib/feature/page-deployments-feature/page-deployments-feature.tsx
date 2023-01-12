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
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { BaseLink } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
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

  useEffect(() => {
    if (
      application &&
      (!application.deployments?.loadingStatus || application.deployments.loadingStatus === 'not loaded')
    ) {
      dispatch(fetchApplicationDeployments({ applicationId, serviceType: getServiceType(application) }))
    }

    const pullDeployments = setInterval(() => {
      if (application)
        dispatch(
          fetchApplicationDeployments({ applicationId, serviceType: getServiceType(application), silently: true })
        )
    }, 2500)

    return () => clearInterval(pullDeployments)
  }, [dispatch, applicationId, application])

  return (
    <PageDeployments
      deployments={!isLoading ? application?.deployments?.items : loadingApplicationsDeployments}
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading}
    />
  )
}

export default PageDeploymentsFeature
