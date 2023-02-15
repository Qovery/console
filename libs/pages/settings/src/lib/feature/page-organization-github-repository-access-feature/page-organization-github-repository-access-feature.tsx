import { GitAuthProvider, GitProviderEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  fetchAuthProvider,
  fetchRepository,
  selectAllAuthProvider,
  selectAllRepository,
} from '@qovery/domains/organization'
import { useAuth } from '@qovery/shared/auth'
import { LoadingStatus, RepositoryEntity } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import PageOrganizationGithubRepositoryAccess from '../../ui/page-organization-github-repository-access/page-organization-github-repository-access'

export function PageOrganizationGithubRepositoryAccessFeature() {
  const { organizationId = '' } = useParams()

  const githubConnectUrl = `https://github.com/apps/qovery-github-app/installations/new?state=${organizationId}`

  const dispatch = useDispatch<AppDispatch>()
  const authProviderLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => state.organization.authProvider.loadingStatus
  )
  const authProviders = useSelector<RootState, GitAuthProvider[]>((state) => selectAllAuthProvider(state))
  const [githubAuthProvider, setGithubAuthProvider] = useState<GitAuthProvider>()

  const repositories = useSelector<RootState, RepositoryEntity[]>((state) => selectAllRepository(state))

  const { getAccessTokenSilently } = useAuth()

  useEffect(() => {
    getAccessTokenSilently({
      ignoreCache: true,
    }).then()
  }, [getAccessTokenSilently])

  useEffect(() => {
    dispatch(fetchAuthProvider({ organizationId }))
  }, [organizationId, dispatch])

  useEffect(() => {
    authProviders.forEach((authProvider) => {
      authProvider.name === 'GITHUB' && setGithubAuthProvider(authProvider)
    })
  }, [authProviders])

  useEffect(() => {
    if (githubAuthProvider?.use_bot) {
      dispatch(fetchRepository({ organizationId: organizationId, gitProvider: GitProviderEnum.GITHUB }))
    }
  }, [githubAuthProvider, dispatch, organizationId])

  return (
    <PageOrganizationGithubRepositoryAccess
      githubConnectURL={githubConnectUrl}
      githubAuthProvider={githubAuthProvider}
      authProviderLoading={authProviderLoadingStatus !== 'loaded'}
      repositories={repositories}
    />
  )
}

export default PageOrganizationGithubRepositoryAccessFeature
