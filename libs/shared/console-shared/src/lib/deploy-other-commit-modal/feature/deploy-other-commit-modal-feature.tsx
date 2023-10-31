import { type Commit } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postApplicationActionsDeployByCommitId, selectApplicationById } from '@qovery/domains/application'
import { useCommits, useServiceType } from '@qovery/domains/services/feature'
import { getServiceType, isGitSource } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import DeployOtherCommitModal from '../ui/deploy-other-commit-modal'

export interface DeployOtherCommitModalFeatureProps {
  organizationId: string
  projectId: string
  environmentId: string
  applicationId: string
}

export function DeployOtherCommitModalFeature({
  organizationId,
  projectId,
  environmentId,
  applicationId,
}: DeployOtherCommitModalFeatureProps) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { closeModal } = useModal()

  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null)
  const [deployLoading, setDeployLoading] = useState(false)
  const [search, setSearch] = useState('')
  const { data: serviceType } = useServiceType({ serviceId: applicationId })
  const { data: commits = [], isLoading } = useCommits({ serviceId: applicationId, serviceType })

  const commitsByDay = commits.reduce((acc: Record<string, Commit[]>, obj) => {
    const key = new Date(obj['created_at']).toDateString()
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(obj)
    return acc
  }, {})

  const [commitsByDayFiltered, setCommitsByDayFiltered] = useState<Record<string, Commit[]>>({})

  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )

  const buttonDisabled = () => {
    return selectedCommitId === null || selectedCommitId === application?.git_repository?.deployed_commit_id
  }

  const handleDeploy = () => {
    if (selectedCommitId && application) {
      setDeployLoading(true)
      dispatch(
        postApplicationActionsDeployByCommitId({
          applicationId,
          git_commit_id: selectedCommitId,
          environmentId: environmentId,
          serviceType: getServiceType(application),
          callback: () =>
            navigate(
              ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId)
            ),
        })
      ).then(() => {
        closeModal()
      })
    }
  }

  const onSearch = (search: string) => {
    setSearch(search)
    setCommitsByDayFiltered(filterCommits(search))
  }

  const filterCommits = (search: string): Record<string, Commit[]> => {
    // for all commits in commitsByDay if commit message or commit id contains search string then add to filtered commits by day
    const filteredCommitsByDay: Record<string, Commit[]> = {}
    Object.keys(commitsByDay).forEach((date) => {
      const filteredCommits = commitsByDay[date].filter((commit) => {
        return (
          commit.message.toLowerCase().includes(search.toLowerCase()) ||
          commit.git_commit_id.toLowerCase().includes(search.toLowerCase())
        )
      })
      if (filteredCommits.length > 0) {
        filteredCommitsByDay[date] = filteredCommits
      }
    })
    return filteredCommitsByDay
  }

  return (
    <DeployOtherCommitModal
      commitsByDay={search.length ? commitsByDayFiltered : commitsByDay}
      isLoading={isLoading}
      selectedCommitId={selectedCommitId}
      setSelectedCommitId={setSelectedCommitId}
      currentCommitId={
        application?.git_repository?.deployed_commit_id ||
        (isGitSource(application?.source) ? application?.source?.docker?.git_repository?.deployed_commit_id : undefined)
      }
      buttonDisabled={buttonDisabled()}
      handleDeploy={handleDeploy}
      deployLoading={deployLoading}
      onSearch={onSearch}
      serviceName={application?.name}
    />
  )
}

export default DeployOtherCommitModalFeature
