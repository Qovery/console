/* eslint-disable-next-line */
import { GitAuthProvider } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  authProviderLoadingStatus,
  fetchAuthProvider,
  fetchBranches,
  fetchRepository,
  repositoryLoadingStatus,
  selectAllAuthProvider,
  selectAllRepository,
} from '@console/domains/organization'
import { LoadingStatus, RepositoryEntity } from '@console/shared/interfaces'
import { Icon } from '@console/shared/ui'
import { upperCaseFirstLetter } from '@console/shared/utils'
import { AppDispatch, RootState } from '@console/store/data'
import GitRepositorySettings from './git-repository-settings'

export interface GitRepositorySettingsFeatureProps {
  inBlock?: boolean
}

export const authProvidersValues = (authProviders: GitAuthProvider[]) => {
  return authProviders.map((provider: GitAuthProvider) => ({
    label: `${upperCaseFirstLetter(provider.name)} (${provider.owner})`,
    value: provider.name || '',
    icon: <Icon width="16px" height="16px" name={provider.name} />,
  }))
}

export function GitRepositorySettingsFeature(props?: GitRepositorySettingsFeatureProps) {
  const { organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const authProviders = useSelector<RootState, GitAuthProvider[]>(selectAllAuthProvider)
  const repositories = useSelector<RootState, RepositoryEntity[]>(selectAllRepository)
  const loadingStatusRepositories = useSelector<RootState, LoadingStatus>(repositoryLoadingStatus)
  const loadingStatusAuthProviders = useSelector<RootState, LoadingStatus>(authProviderLoadingStatus)

  const { setValue, watch } = useFormContext()
  const watchAuthProvider = watch('provider')
  const watchRepository = watch('repository')
  const currentRepository = repositories.find((repository) => repository.name === watchRepository)

  useEffect(() => {
    if (watchAuthProvider) {
      dispatch(fetchRepository({ organizationId, gitProvider: watchAuthProvider }))
    }
  }, [dispatch, organizationId, watchAuthProvider])

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

  useEffect(() => {
    dispatch(fetchAuthProvider({ organizationId }))
  }, [dispatch, organizationId])

  return (
    <GitRepositorySettings
      inBlock={props?.inBlock}
      gitDisabled={false}
      editGitSettings={() => {}}
      loadingStatusAuthProviders={loadingStatusAuthProviders}
      authProviders={authProvidersValues(authProviders)}
      loadingStatusRepositories={loadingStatusRepositories}
      repositories={repositories.map((repository: RepositoryEntity) => ({
        label: upperCaseFirstLetter(repository.name) || '',
        value: repository.name || '',
      }))}
      loadingStatusBranches={!currentRepository ? 'not loaded' : currentRepository?.branches?.loadingStatus}
      branches={
        currentRepository?.branches?.items
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
