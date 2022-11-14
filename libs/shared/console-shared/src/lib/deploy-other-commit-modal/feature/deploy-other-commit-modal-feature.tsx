import { Commit } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchApplicationCommits,
  getCommitsGroupedByDate,
  postApplicationActionsDeployByCommitId,
  selectApplicationById,
} from '@qovery/domains/application'
import { ApplicationEntity, GitApplicationEntity } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import DeployOtherCommitModal from '../ui/deploy-other-commit-modal'

export interface DeployOtherCommitModalFeatureProps {
  applicationId: string
  environmentId: string
}

export function DeployOtherCommitModalFeature(props: DeployOtherCommitModalFeatureProps) {
  const { applicationId } = props
  const dispatch = useDispatch<AppDispatch>()
  const { closeModal } = useModal()

  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null)
  const [deployLoading, setDeployLoading] = useState(false)

  const commitsByDay = useSelector<RootState, Record<string, Commit[]>>((state) =>
    getCommitsGroupedByDate(state, applicationId)
  )

  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )
  const isLoading = (application as GitApplicationEntity)?.commits?.loadingStatus

  const buttonDisabled = () => {
    return (
      selectedCommitId === null ||
      selectedCommitId === (application as GitApplicationEntity)?.git_repository?.deployed_commit_id
    )
  }

  useEffect(() => {
    if (
      !(application as GitApplicationEntity)?.commits ||
      (application as GitApplicationEntity)?.commits?.loadingStatus === 'not loaded'
    ) {
      dispatch(fetchApplicationCommits({ applicationId }))
    }
  }, [props.applicationId, application, applicationId, dispatch])

  const handleDeploy = () => {
    if (selectedCommitId) {
      setDeployLoading(true)
      dispatch(
        postApplicationActionsDeployByCommitId({
          applicationId,
          git_commit_id: selectedCommitId,
          environmentId: props.environmentId,
        })
      ).then(() => {
        closeModal()
      })
    }
  }

  return (
    <DeployOtherCommitModal
      commitsByDay={commitsByDay}
      isLoading={isLoading === 'loading'}
      selectedCommitId={selectedCommitId}
      setSelectedCommitId={setSelectedCommitId}
      currentCommitId={(application as GitApplicationEntity)?.git_repository?.deployed_commit_id}
      buttonDisabled={buttonDisabled()}
      handleDeploy={handleDeploy}
      deployLoading={deployLoading}
    />
  )
}

export default DeployOtherCommitModalFeature
