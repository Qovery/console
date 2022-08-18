import { GitAuthProvider } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { getApplicationsState } from '@console/domains/application'
import {
  authProviderLoadingStatus,
  fetchAuthProvider,
  fetchBranches,
  fetchRepository,
  repositoryLoadingStatus,
  selectAllAuthProvider,
  selectAllRepository,
} from '@console/domains/organization'
import { ApplicationEntity, LoadingStatus, RepositoryEntity } from '@console/shared/interfaces'
import { Icon } from '@console/shared/ui'
import { upperCaseFirstLetter } from '@console/shared/utils'
import { AppDispatch, RootState } from '@console/store/data'
import GitRepositorySettings from '../../ui/git-repository-settings/git-repository-settings'

export const authProvidersValues = (authProviders: GitAuthProvider[]) => {
  return authProviders.map((provider: GitAuthProvider) => ({
    label: `${upperCaseFirstLetter(provider.name)} (${provider.owner})`,
    value: provider.name || '',
    icon: <Icon width="16px" height="16px" name={provider.name} />,
  }))
}

export function GitRepositorySettingsFeature() {
  const { organizationId = '', applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )
  const authProviders = useSelector<RootState, GitAuthProvider[]>(selectAllAuthProvider)
  const repositories = useSelector<RootState, RepositoryEntity[]>(selectAllRepository)
  const loadingStatusRepositories = useSelector<RootState, LoadingStatus>(repositoryLoadingStatus)
  const loadingStatusAuthProviders = useSelector<RootState, LoadingStatus>(authProviderLoadingStatus)

  const { setValue, watch } = useFormContext()
  const watchAuthProvider = watch('provider')
  const watchRepository = watch('repository')

  const [gitDisabled, setGitDisabled] = useState(true)

  const currentAuthProvider = `${upperCaseFirstLetter(application?.git_repository?.provider)} (${
    application?.git_repository?.owner
  })`
  const currentRepository = repositories.find((repository) => repository.name === watchRepository)

  useEffect(() => {
    if (gitDisabled && application?.git_repository) {
      setValue('provider', `${application?.git_repository?.provider} (${application?.git_repository?.owner})`)
      setValue('repository', application?.git_repository?.name)
      setValue('branch', application?.git_repository?.branch)
      setValue('root_path', application?.git_repository?.root_path)
    }
  }, [application?.git_repository, setValue, gitDisabled, authProviders, repositories])

  // fetch branches by repository and set default branch
  useEffect(() => {
    if (watchRepository && loadingStatusRepositories === 'loaded') {
      const currentRepository = repositories?.find((repository) => repository.name === watchRepository)
      dispatch(
        fetchBranches({
          id: currentRepository?.id,
          organizationId,
          gitProvider: watchAuthProvider,
          name: watchRepository,
        })
      )
      setValue('branch', currentRepository?.default_branch, { shouldValidate: true })
    }
  }, [dispatch, organizationId, watchRepository, watchAuthProvider, loadingStatusRepositories, setValue])

  // submit for modal with the dispatchs authProvider and repositories
  const editGitSettings = async () => {
    setGitDisabled(false)
    await dispatch(fetchAuthProvider({ organizationId }))
    if (application?.git_repository?.provider) {
      setValue('provider', application?.git_repository?.provider)
      setValue('repository', null, { shouldValidate: false })
      await dispatch(fetchRepository({ organizationId, gitProvider: application?.git_repository?.provider }))
    }
  }

  if (!application?.git_repository?.name) return null

  return (
    <GitRepositorySettings
      gitDisabled={gitDisabled}
      editGitSettings={editGitSettings}
      currentAuthProvider={currentAuthProvider}
      loadingStatusAuthProviders={loadingStatusAuthProviders}
      authProviders={
        !gitDisabled
          ? authProvidersValues(authProviders)
          : application && [
              {
                label: currentAuthProvider,
                value: `${application?.git_repository?.provider} (${application.git_repository?.owner})`,
                icon: <Icon width="16px" height="16px" name={application?.git_repository?.provider || ''} />,
              },
            ]
      }
      loadingStatusRepositories={loadingStatusRepositories}
      repositories={
        !gitDisabled
          ? repositories.map((repository: RepositoryEntity) => ({
              label: upperCaseFirstLetter(repository.name) || '',
              value: repository.name || '',
            }))
          : [
              {
                label: upperCaseFirstLetter(application?.git_repository?.name) || '',
                value: application?.git_repository?.name || '',
              },
            ]
      }
      loadingStatusBranches={!currentRepository ? 'not loaded' : currentRepository?.branches?.loadingStatus}
      branches={
        gitDisabled && application?.git_repository?.branch
          ? [
              {
                label: application?.git_repository?.branch,
                value: application?.git_repository?.branch,
              },
            ]
          : currentRepository?.branches?.items
          ? currentRepository?.branches.items?.map((branch) => ({
              label: branch.name,
              value: branch.name,
            }))
          : []
      }
    />
  )
}

export default GitRepositorySettingsFeature
