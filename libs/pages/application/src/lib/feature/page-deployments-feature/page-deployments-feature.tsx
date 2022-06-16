import { ApplicationEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import {
  applicationDeploymentsFactoryMock,
  applicationsLoadingStatus,
  fetchApplicationDeployments,
  getApplicationsState,
} from '@console/domains/application'
import { BaseLink } from '@console/shared/ui'
import { useEffect } from 'react'
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
    const fetchApp = () => {
      dispatch(fetchApplicationDeployments({ applicationId }))
    }
    !application?.deployments && fetchApp()
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
