import { Commit, DeployAllRequest } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  applicationsLoadingStatus,
  fetchApplicationCommits,
  fetchApplications,
  selectApplicationsEntitiesByEnvId,
} from '@qovery/domains/application'
import { getEnvironmentById, useActionDeployAllEnvironment, useFetchEnvironments } from '@qovery/domains/environment'
import { getServiceType, isApplication, isGitJob, isJob } from '@qovery/shared/enums'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import UpdateAllModal from '../ui/update-all-modal'

export interface UpdateAllModalFeatureProps {
  environmentId: string
  projectId: string
}

export function UpdateAllModalFeature(props: UpdateAllModalFeatureProps) {
  const { environmentId, projectId } = props

  const { data: environments } = useFetchEnvironments(projectId)
  const environment = getEnvironmentById(environmentId, environments)

  const { closeModal } = useModal()
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

  const actionDeployAllEnvironments = useActionDeployAllEnvironment(environmentId, () => {
    closeModal()
  })

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
          (!application.commits || application.commits.loadingStatus !== 'loaded')
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
        if (!app.git_repository) return false
        if (!app.commits?.items) return false

        return app.git_repository.deployed_commit_id !== app.commits.items[0].git_commit_id
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
