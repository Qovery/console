import { GitAuthProvider, GitProviderEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  disconnectGithubApp,
  fetchAuthProvider,
  fetchRepository,
  getAuthProviderState,
  getRepositoryState,
  repositorySlice,
  selectAllAuthProvider,
  selectAllRepository,
} from '@qovery/domains/organization'
import { useAuth } from '@qovery/shared/auth'
import { LoadingStatus, RepositoryEntity } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import DisconnectionConfirmModal from '../../ui/page-organization-github-repository-access/disconnection-confirm-modal/disconnection-confirm-modal'
import PageOrganizationGithubRepositoryAccess from '../../ui/page-organization-github-repository-access/page-organization-github-repository-access'

export function PageOrganizationGithubRepositoryAccessFeature() {
  useDocumentTitle('Github Repository Access - Organization settings')
  const { organizationId = '' } = useParams()

  const githubConnectUrl = `https://github.com/apps/qovery-github-app/installations/new?state=${organizationId}`

  const dispatch = useDispatch<AppDispatch>()
  const authProviderLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => getAuthProviderState(state).loadingStatus
  )
  const authProviders = useSelector<RootState, GitAuthProvider[]>((state) => selectAllAuthProvider(state))
  const [githubAuthProvider, setGithubAuthProvider] = useState<GitAuthProvider>()

  const repositories = useSelector<RootState, RepositoryEntity[]>((state) => selectAllRepository(state))
  const repositoriesLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => getRepositoryState(state).loadingStatus
  )

  const { getAccessTokenSilently } = useAuth()
  const { openModal, closeModal } = useModal()

  const [forceLoading, setForceLoading] = useState(false)

  useEffect(() => {
    getAccessTokenSilently({
      ignoreCache: true,
    }).then(() => {
      dispatch(fetchAuthProvider({ organizationId }))
    })
  }, [getAccessTokenSilently, dispatch, organizationId])

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

  const onConfigure = () => {
    window.open(githubConnectUrl, '_blank')
  }

  const onDisconnectWithModal = () => {
    openModal({
      content: <DisconnectionConfirmModal onClose={closeModal} onSubmit={() => onDisconnect(true)} />,
    })
  }

  // onDisconnect can be called with force parameter. If it's false, the api call will eventually fail with a 400 error
  // if the user has some apps that used some repositories of github app. If it fails, we open a modal to confirm the disconnection
  // and we force the disconnection with force parameter set to true. To put simply: if the user does not use any app
  // he can disconnect without modal, if he uses some apps, he has to confirm the disconnection
  const onDisconnect = (force?: boolean) => {
    setForceLoading(true)
    dispatch(
      disconnectGithubApp({
        organizationId,
        force: force,
      })
    )
      .unwrap()
      .then(() => {
        getAccessTokenSilently({
          ignoreCache: true,
        })
          .then(() => {
            dispatch(fetchAuthProvider({ organizationId }))
            setForceLoading(false)
          })
          .catch(() => {
            setForceLoading(false)
          })
        dispatch(repositorySlice.actions.removeAll())
      })
      .catch((error) => {
        setForceLoading(false)

        if (error.name === 'Bad Request' && error.code === '400' && error.message.includes('This git provider is')) {
          onDisconnectWithModal()
        }
      })
  }

  return (
    <PageOrganizationGithubRepositoryAccess
      githubConnectURL={githubConnectUrl}
      githubAuthProvider={githubAuthProvider}
      authProviderLoading={authProviderLoadingStatus !== 'loaded'}
      repositories={repositories}
      repositoriesLoading={repositoriesLoadingStatus === 'loading'}
      onConfigure={onConfigure}
      onDisconnect={onDisconnect}
      forceLoading={forceLoading}
    />
  )
}

export default PageOrganizationGithubRepositoryAccessFeature
