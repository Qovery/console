import { GitAuthProvider, GitProviderEnum } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationById } from '@qovery/domains/application'
import {
  authProviderLoadingStatus,
  fetchAuthProvider,
  fetchBranches,
  fetchRepository,
  repositoryLoadingStatus,
  selectAllAuthProvider,
  selectRepositoriesByProvider,
} from '@qovery/domains/organization'
import { isJob } from '@qovery/shared/enums'
import { ApplicationEntity, LoadingStatus, RepositoryEntity } from '@qovery/shared/interfaces'
import { Icon } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import GitRepositorySettings from '../../ui/git-repository-settings/git-repository-settings'
import { authProvidersValues } from '../../utils/auth-providers-values'

export function EditGitRepositorySettingsFeature() {
  const { organizationId = '', applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) =>
      JSON.stringify(a?.git_repository) === JSON.stringify(b?.git_repository) ||
      JSON.stringify(a?.source?.docker?.git_repository) === JSON.stringify(b?.source?.docker?.git_repository)
  )

  const getGitRepositoryFromApplication = useCallback(() => {
    return isJob(application) ? application?.source?.docker?.git_repository : application?.git_repository
  }, [application])

  const { setValue, watch, getValues } = useFormContext<{
    provider: string
    repository: string | undefined
    branch: string | undefined
    root_path: string | undefined
  }>()
  const watchAuthProvider = watch('provider')
  const watchRepository = watch('repository')

  const authProviders = useSelector<RootState, GitAuthProvider[]>(selectAllAuthProvider)
  const repositories = useSelector((state: RootState) =>
    selectRepositoriesByProvider(state, watchAuthProvider as GitProviderEnum)
  )
  const loadingStatusRepositories = useSelector<RootState, LoadingStatus>(repositoryLoadingStatus)
  const loadingStatusAuthProviders = useSelector<RootState, LoadingStatus>(authProviderLoadingStatus)

  const [gitDisabled, setGitDisabled] = useState(true)

  const currentAuthProvider = `${upperCaseFirstLetter(getGitRepositoryFromApplication()?.provider)} (${
    getGitRepositoryFromApplication()?.owner
  })`
  const currentRepository = repositories.find((repository) => repository.name === watchRepository)

  useEffect(() => {
    if (watchAuthProvider) {
      dispatch(fetchRepository({ organizationId, gitProvider: watchAuthProvider as GitProviderEnum }))
    }
  }, [dispatch, organizationId, watchAuthProvider])

  useEffect(() => {
    if (gitDisabled && getGitRepositoryFromApplication()) {
      setValue(
        'provider',
        `${getGitRepositoryFromApplication()?.provider} (${getGitRepositoryFromApplication()?.owner})`
      )
      setValue('repository', getGitRepositoryFromApplication()?.url)
      setValue('branch', getGitRepositoryFromApplication()?.branch)
      setValue('root_path', getGitRepositoryFromApplication()?.root_path)
    }
  }, [getGitRepositoryFromApplication, setValue, gitDisabled, authProviders, repositories])

  // fetch branches by repository and set default branch
  useEffect(() => {
    if (!gitDisabled && getValues().repository && loadingStatusRepositories === 'loaded') {
      const currentRepository = repositories?.find((repository) => repository.name === watchRepository)
      dispatch(
        fetchBranches({
          id: currentRepository?.id,
          organizationId,
          gitProvider: getValues().provider as GitProviderEnum,
          name: getValues().repository || '',
        })
      )
      setValue('branch', currentRepository?.default_branch, { shouldValidate: true })
    }
  }, [dispatch, gitDisabled, organizationId, watchRepository, watchAuthProvider, loadingStatusRepositories, setValue])

  // submit for modal with the dispatchs authProvider
  const editGitSettings = () => {
    setGitDisabled(false)
    dispatch(fetchAuthProvider({ organizationId }))
    if (getGitRepositoryFromApplication()?.provider) {
      setValue('provider', getGitRepositoryFromApplication()?.provider || '')
      setValue('repository', undefined, { shouldValidate: false })
    }
  }

  if (!getGitRepositoryFromApplication()?.name) return null

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
                value: `${getGitRepositoryFromApplication()?.provider} (${getGitRepositoryFromApplication()?.owner})`,
                icon: <Icon width="16px" height="16px" name={getGitRepositoryFromApplication()?.provider || ''} />,
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
                label: upperCaseFirstLetter(getGitRepositoryFromApplication()?.name) || '',
                value: getGitRepositoryFromApplication()?.url || '',
              },
            ]
      }
      loadingStatusBranches={!currentRepository ? 'not loaded' : currentRepository?.branches?.loadingStatus}
      branches={
        gitDisabled && getGitRepositoryFromApplication()?.branch
          ? [
              {
                label: getGitRepositoryFromApplication()?.branch || '',
                value: getGitRepositoryFromApplication()?.branch || '',
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

export default EditGitRepositorySettingsFeature
