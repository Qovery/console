import { Commit } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { getApplicationsState, getCountNewCommitsToDeploy } from '@console/domains/application'
import { RootState } from '@console/store/data'
import { ApplicationEntity } from '@console/shared/interfaces'
import LastCommit from '../../ui/last-commit/last-commit'

export function LastCommitFeature() {
  const { applicationId = '' } = useParams()
  const commitDeltaCount = useSelector(getCountNewCommitsToDeploy(applicationId))
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )

  const getCommitById = (commits: Commit[]) => {
    const deployedCommit = commits.find(
      (commit) => commit.git_commit_id === application?.git_repository?.deployed_commit_id
    )

    if (deployedCommit) {
      return deployedCommit
    } else {
      return application?.git_repository
    }
  }

  return (
    <LastCommit
      commit={application?.commits?.items && getCommitById(application?.commits?.items)}
      loadingStatus={application?.commits?.loadingStatus}
      commitDeltaCount={commitDeltaCount}
    />
  )
}

export default LastCommitFeature
