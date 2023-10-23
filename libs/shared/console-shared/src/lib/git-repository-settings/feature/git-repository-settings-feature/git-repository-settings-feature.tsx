import { type GitAuthProvider } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  fetchAuthProvider,
  fetchBranches,
  fetchRepository,
  repositoryLoadingStatus,
  selectAllAuthProvider,
  selectRepositoriesByProvider,
} from '@qovery/domains/organization'
import { useGitTokens } from '@qovery/domains/organizations/feature'
import { type LoadingStatus, type RepositoryEntity } from '@qovery/shared/interfaces'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { type AppDispatch, type RootState } from '@qovery/state/store'
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
  const { data: gitTokens = [] } = useGitTokens({ organizationId })
  const gitToken = gitTokens.find((gitToken) => gitToken.id === watchAuthProvider)
  const watchAuthProviderOrGitToken = gitToken ? gitToken.type : watchAuthProvider

  const repositories = useSelector((state: RootState) =>
    selectRepositoriesByProvider(state, watchAuthProviderOrGitToken)
  )
  const loadingStatusRepositories = useSelector<RootState, LoadingStatus>(repositoryLoadingStatus)

  const currentRepository = repositories.find((repository) => repository.name === watchRepository)

  useEffect(() => {
    dispatch(fetchAuthProvider({ organizationId }))
  }, [dispatch, organizationId])

  useEffect(() => {
    if (watchAuthProvider) {
      if (gitToken) {
        dispatch(fetchRepository({ organizationId, gitProvider: gitToken.type, gitToken: gitToken.id }))
      } else {
        dispatch(fetchRepository({ organizationId, gitProvider: watchAuthProvider }))
      }
    }
  }, [dispatch, organizationId, watchAuthProvider, gitToken])

  // fetch branches by repository and set default branch
  useEffect(() => {
    if (watchRepository && loadingStatusRepositories === 'loaded') {
      const currentRepository = repositories?.find((repository) => repository.name === watchRepository)

      if (!currentRepository?.branches?.items?.length) {
        dispatch(
          fetchBranches({
            id: currentRepository?.id,
            organizationId,
            gitProvider: watchAuthProviderOrGitToken,
            gitToken: gitToken?.id,
            name: watchRepository,
          })
        )
        setValue('branch', currentRepository?.default_branch, { shouldValidate: true })
      }
    }
  }, [
    dispatch,
    organizationId,
    watchRepository,
    watchAuthProvider,
    loadingStatusRepositories,
    setValue,
    gitToken,
    watchAuthProviderOrGitToken,
  ])

  return (
    <GitRepositorySettings
      withBlockWrapper={props?.withBlockWrapper}
      gitDisabled={false}
      authProviders={authProvidersValues(authProviders, gitTokens)}
      loadingStatusRepositories={loadingStatusRepositories}
      repositories={repositories.map((repository: RepositoryEntity) => ({
        label: upperCaseFirstLetter(repository.name),
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
