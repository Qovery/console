import { type GitAuthProvider } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  type UseRepositoriesProps,
  useAuthProviders,
  useGitTokens,
  useRepositories,
} from '@qovery/domains/organizations/feature'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { type AppDispatch } from '@qovery/state/store'
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

  const { data: authProviders = [] } = useAuthProviders({ organizationId })
  const { data: gitTokens = [] } = useGitTokens({ organizationId })

  const gitToken = gitTokens.find((gitToken) => gitToken.id === watchAuthProvider)
  const watchAuthProviderOrGitToken = gitToken ? gitToken.type : watchAuthProvider

  const [paramsRepositories, setParamsRepositories] = useState<UseRepositoriesProps>({
    organizationId,
    gitProvider: watchAuthProvider,
    gitToken: gitToken?.id,
  })

  const { data: repositories, isLoading: isLoadingRepositories } = useRepositories(paramsRepositories)

  console.log('repositories: ', repositories)
  console.log('paramsRepositories: ', paramsRepositories)

  const currentRepository = repositories?.find((repository) => repository.name === watchRepository)

  useEffect(() => {
    if (watchAuthProvider) {
      if (gitToken) {
        setParamsRepositories({ organizationId, gitProvider: gitToken.type, gitToken: gitToken.id })
      } else {
        setParamsRepositories({ organizationId, gitProvider: watchAuthProvider })
      }
    }
  }, [dispatch, organizationId, watchAuthProvider, gitToken])

  // fetch branches by repository and set default branch
  // useEffect(() => {
  //   if (watchRepository && !isLoadingRepositories) {
  //     const currentRepository = repositories?.find((repository) => repository.name === watchRepository)

  //     if (!currentRepository?.branches?.items?.length) {
  //       dispatch(
  //         fetchBranches({
  //           id: currentRepository?.id,
  //           organizationId,
  //           gitProvider: watchAuthProviderOrGitToken,
  //           gitToken: gitToken?.id,
  //           name: watchRepository,
  //         })
  //       )
  //       setValue('branch', currentRepository?.default_branch, { shouldValidate: true })
  //     }
  //   }
  // }, [dispatch, organizationId, watchRepository, watchAuthProvider, setValue, gitToken, watchAuthProviderOrGitToken])

  return (
    <GitRepositorySettings
      withBlockWrapper={props?.withBlockWrapper}
      gitDisabled={false}
      authProviders={authProvidersValues(authProviders as GitAuthProvider[], gitTokens)}
      loadingStatusRepositories={isLoadingRepositories}
      repositories={repositories?.map((repository) => ({
        label: upperCaseFirstLetter(repository.name),
        value: repository.name || '',
      }))}
      // loadingStatusBranches={!currentRepository ? 'not loaded' : currentRepository?.branches?.loadingStatus}
      // branches={
      //   currentRepository?.branches?.items
      //     ? currentRepository?.branches.items?.map((branch) => ({
      //         label: branch.name,
      //         value: branch.name,
      //       }))
      //     : []
      // }
    />
  )
}

export default GitRepositorySettingsFeature
