import { Commit } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchApplicationCommits, getCommitsGroupedByDate, selectApplicationById } from '@qovery/domains/application'
import { ApplicationEntity, GitApplicationEntity } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import DeployOtherCommitModal from '../ui/deploy-other-commit-modal'

export interface DeployOtherCommitModalFeatureProps {
  applicationId: string
}

export function DeployOtherCommitModalFeature(props: DeployOtherCommitModalFeatureProps) {
  const { applicationId } = props
  const dispatch = useDispatch<AppDispatch>()

  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null)

  const commitsByDay = useSelector<RootState, Record<string, Commit[]>>((state) =>
    getCommitsGroupedByDate(state, applicationId)
  )

  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )
  const isLoading = (application as GitApplicationEntity)?.commits?.loadingStatus

  useEffect(() => {
    if (
      !(application as GitApplicationEntity)?.commits ||
      (application as GitApplicationEntity)?.commits?.loadingStatus === 'not loaded'
    ) {
      dispatch(fetchApplicationCommits({ applicationId }))
    }
  }, [props.applicationId, fetchApplicationCommits, application, applicationId, dispatch])

  return (
    <DeployOtherCommitModal
      commitsByDay={commitsByDay}
      isLoading={isLoading === 'loading'}
      selectedCommitId={selectedCommitId}
      setSelectedCommitId={setSelectedCommitId}
      currentCommitId={(application as GitApplicationEntity).git_repository?.deployed_commit_id}
    />
  )
}

export default DeployOtherCommitModalFeature
