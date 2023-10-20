import { type Commit, type DeployAllRequest } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  applicationsLoadingStatus,
  fetchApplicationCommits,
  fetchApplications,
  selectApplicationsEntitiesByEnvId,
} from '@qovery/domains/application'
import { useActionDeployAllEnvironment, useFetchEnvironment } from '@qovery/domains/environment'
import { getServiceType, isApplication, isGitJob, isGitSource, isJob } from '@qovery/shared/enums'
import { type ApplicationEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'
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
  const dispatch: AppDispatch = useDispatch()
  const applications = useSelector<RootState, ApplicationEntity[] | undefined>(
    (state: RootState) => selectApplicationsEntitiesByEnvId(state, environmentId),
    (a, b) => {
      if (!a || !b) {
        return false
      }
      return a.length === b.length && a.every((v, i) => v.commits?.loadingStatus === b[i].commits?.loadingStatus)
    }
  )
  const appsLoadingStatus = useSelector<RootState, LoadingStatus | undefined>((state: RootState) =>
    applicationsLoadingStatus(state)
  )
  const [outdatedApps, setOutdatedApps] = useState<ApplicationEntity[]>([])

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [listLoading, setListLoading] = useState<boolean>(true)
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

  useEffect(() => {
    dispatch(fetchApplications({ environmentId }))
  }, [dispatch, environmentId])

  useEffect(() => {
    if (appsLoadingStatus === 'loaded') {
      applications?.forEach((application) => {
        if (
          (isApplication(application) || isGitJob(application)) &&
          (!application.commits || application.commits.loadingStatus === 'not loaded')
        ) {
          dispatch(fetchApplicationCommits({ applicationId: application.id, serviceType: getServiceType(application) }))
          setListLoading(true)
        }
      })
    }
  }, [applications, dispatch, appsLoadingStatus])

  const isLoading = useCallback(() => {
    let loading = true
    if (applications && appsLoadingStatus === 'loaded') {
      loading = false
      applications.forEach((application) => {
        if (
          (isApplication(application) || isGitJob(application)) &&
          (!application.commits || !['loaded', 'error'].includes(application.commits.loadingStatus ?? ''))
        ) {
          loading = true
        }
      })
    }

    return loading
  }, [applications, appsLoadingStatus])

  const onSubmit = () => {
    if (selectedServiceIds.length > 0) {
      setSubmitButtonLoading(true)

      const appsToUpdate: DeployAllRequest['applications'] = []
      const jobsToUpdate: DeployAllRequest['jobs'] = []

      const servicesDictionary: Record<string, ApplicationEntity> = outdatedApps.reduce((acc, app) => {
        acc[app.id] = app
        return acc
      }, {} as Record<string, ApplicationEntity>)

      selectedServiceIds.forEach((serviceId) => {
        const app = servicesDictionary[serviceId]
        if (isApplication(app)) {
          appsToUpdate.push({
            application_id: app.id,
            git_commit_id: app.commits?.items ? app.commits?.items[0].git_commit_id : '',
          })
        }

        if (isJob(app)) {
          jobsToUpdate.push({
            id: app.id,
            git_commit_id: app.commits?.items ? app.commits?.items[0].git_commit_id : '',
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
    setSelectedServiceIds(outdatedApps.map((app) => app.id))
  }

  useEffect(() => {
    // set outdated apps
    if (applications) {
      const outdatedApps = applications.filter((app) => {
        if (!app.commits?.items) return false

        const gitRepository =
          app.git_repository ?? (isGitSource(app.source) ? app.source.docker?.git_repository : undefined)
        if (!gitRepository) return false

        return gitRepository.deployed_commit_id !== app.commits.items[0].git_commit_id
      })
      setOutdatedApps(outdatedApps)
      setSelectedServiceIds(outdatedApps.map((app) => app.id))
      setListLoading(isLoading())
    }
  }, [applications, isLoading])

  const findCommitById = (application: ApplicationEntity, commitId?: string): Commit | undefined => {
    if (!commitId || !application.commits?.items) return

    return application.commits.items.find((commit) => commit.git_commit_id === commitId) as Commit
  }

  const getAvatarForCommit = (application: ApplicationEntity, commitId?: string): string | undefined => {
    return findCommitById(application, commitId)?.author_avatar_url
  }

  const getNameForCommit = (application: ApplicationEntity, commitId?: string): string | undefined => {
    return findCommitById(application, commitId)?.author_name
  }

  return (
    <UpdateAllModal
      applications={outdatedApps}
      environment={environment}
      closeModal={closeModal}
      onSubmit={onSubmit}
      submitDisabled={false}
      submitLoading={submitButtonLoading}
      selectedServiceIds={selectedServiceIds}
      checkService={checkService}
      unselectAll={unselectAll}
      listLoading={listLoading}
      getAvatarForCommit={getAvatarForCommit}
      getNameForCommit={getNameForCommit}
      selectAll={selectAll}
    />
  )
}

export default UpdateAllModalFeature
