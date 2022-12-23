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
  selectRepositoriesByProvider,
} from '@qovery/domains/organization'
import { LoadingStatus, RepositoryEntity } from '@qovery/shared/interfaces'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import GitRepositorySettings from '../../ui/git-repository-settings/git-repository-settings'
import { authProvidersValues } from '../../utils/auth-providers-values'

export interface GitRepositorySettingsFeatureProps {
  withBlockWrapper?: boolean
}

export function GitRepositorySettingsFeature(props?: GitRepositorySettingsFeatureProps) {
  const { organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const { setValue, watch } = useFormContext()
  const watchAuthProvider = watch('provider')
  const watchRepository = watch('repository')

  const authProviders = useSelector<RootState, GitAuthProvider[]>(selectAllAuthProvider)
  const repositories = useSelector((state: RootState) => selectRepositoriesByProvider(state, watchAuthProvider))
  const loadingStatusRepositories = useSelector<RootState, LoadingStatus>(repositoryLoadingStatus)
  const loadingStatusAuthProviders = useSelector<RootState, LoadingStatus>(authProviderLoadingStatus)

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

      if (!currentRepository?.branches?.items?.length) {
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
    }
  }, [dispatch, organizationId, watchRepository, watchAuthProvider, loadingStatusRepositories, setValue])

  useEffect(() => {
    dispatch(fetchAuthProvider({ organizationId }))
  }, [dispatch, organizationId])

  return (
    <GitRepositorySettings
      withBlockWrapper={props?.withBlockWrapper}
      gitDisabled={false}
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
