import { type Commit, type DeployAllRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActionDeployAllEnvironment, useFetchEnvironment } from '@qovery/domains/environment'
import { type OutdatedService, useOutdatedServices } from '@qovery/domains/services/feature'
import { ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import UpdateAllModal from '../ui/update-all-modal'

export interface UpdateAllModalFeatureProps {
  organizationId: string
  environmentId: string
  projectId: string
}

export function UpdateAllModalFeature(props: UpdateAllModalFeatureProps) {
  const { organizationId, environmentId, projectId } = props

  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  const { closeModal } = useModal()
  const navigate = useNavigate()
  const { data: outdatedServices = [], isLoading: isOutdatedServicesLoading } = useOutdatedServices({ environmentId })
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean>(false)

  const actionDeployAllEnvironments = useActionDeployAllEnvironment(
    environmentId,
    () => {
      closeModal()
    },
    () => navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId))
  )

  const checkService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId))
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId])
    }
  }

  const onSubmit = () => {
    if (selectedServiceIds.length > 0) {
      setSubmitButtonLoading(true)

      const appsToUpdate: DeployAllRequest['applications'] = []
      const jobsToUpdate: DeployAllRequest['jobs'] = []

      const servicesDictionary = outdatedServices.reduce((acc, service) => {
        acc[service.id] = service
        return acc
      }, {} as Record<string, OutdatedService>)

      selectedServiceIds.forEach((serviceId) => {
        const { serviceType, id, commits } = servicesDictionary[serviceId]
        if (serviceType === 'APPLICATION') {
          appsToUpdate.push({
            application_id: id,
            git_commit_id: commits[0]?.git_commit_id ?? '',
          })
        }

        if (serviceType === 'JOB') {
          jobsToUpdate.push({
            id,
            git_commit_id: commits[0]?.git_commit_id ?? '',
          })
        }
      })

      const deployRequest: DeployAllRequest = {
        applications: appsToUpdate,
        jobs: jobsToUpdate,
      }

      actionDeployAllEnvironments.mutate(deployRequest)
    }
  }

  const unselectAll = () => {
    setSelectedServiceIds([])
  }

  const selectAll = () => {
    setSelectedServiceIds(outdatedServices.map(({ id }) => id))
  }

  useEffect(() => {
    if (!isOutdatedServicesLoading) {
      selectAll()
    }
  }, [isOutdatedServicesLoading])

  const findCommitById = (application: OutdatedService, commitId?: string): Commit | undefined => {
    return application.commits.find((commit) => commit.git_commit_id === commitId) as Commit
  }

  const getAvatarForCommit = (application: OutdatedService, commitId?: string): string | undefined => {
    return findCommitById(application, commitId)?.author_avatar_url
  }

  const getNameForCommit = (application: OutdatedService, commitId?: string): string | undefined => {
    return findCommitById(application, commitId)?.author_name
  }

  return (
    <UpdateAllModal
      services={outdatedServices}
      environment={environment}
      closeModal={closeModal}
      onSubmit={onSubmit}
      submitDisabled={false}
      submitLoading={submitButtonLoading}
      selectedServiceIds={selectedServiceIds}
      checkService={checkService}
      unselectAll={unselectAll}
      listLoading={isOutdatedServicesLoading}
      getAvatarForCommit={getAvatarForCommit}
      getNameForCommit={getNameForCommit}
      selectAll={selectAll}
    />
  )
}

export default UpdateAllModalFeature
