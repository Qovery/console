/* eslint-disable-next-line */
import LastCommit from '../../ui/last-commit/last-commit'
import { useSelector } from 'react-redux'
import { getApplicationsState, getCountNewCommitsToDeploy } from '@console/domains/application'
import { useParams } from 'react-router'
import { RootState } from '@console/store/data'
import { ApplicationEntity } from '@console/shared/interfaces'

export function LastCommitFeature() {
  const { applicationId = '' } = useParams()
  const commitDeltaCount = useSelector(getCountNewCommitsToDeploy(applicationId))
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )

  return (
    <LastCommit
      commit={application?.commits?.items && application?.commits?.items[0]}
      loadingStatus={application?.commits?.loadingStatus}
      commitDeltaCount={commitDeltaCount}
    />
  )
}

export default LastCommitFeature
