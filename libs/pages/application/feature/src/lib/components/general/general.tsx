/* eslint-disable-next-line */
import { GeneralPage } from '@console/pages/application/ui'
import { BaseLink } from '@console/shared/ui'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import {
  applicationsLoadingStatus,
  getApplicationsState,
  getCountNewCommitsToDeploy,
} from '@console/domains/application'
import { ApplicationEntity, LoadingStatus } from '@console/shared/interfaces'
import { RootState } from '@console/store/data'

export function General() {
  const { applicationId = '' } = useParams()
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )
  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
      linkLabel: 'How to manage my application',
      external: true,
    },
  ]
  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => applicationsLoadingStatus(state))

  const commitDeltaCount = useSelector(getCountNewCommitsToDeploy(applicationId))

  return (
    <GeneralPage
      application={application}
      listHelpfulLinks={listHelpfulLinks}
      loadingStatus={loadingStatus}
      commitDeltaCount={commitDeltaCount}
    />
  )
}

export default General
