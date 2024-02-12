import { useAuth0 } from '@auth0/auth0-react'
import { type GitAuthProvider, GitProviderEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthProviders, useDisconnectGithubApp, useRepositories } from '@qovery/domains/organizations/feature'
import { useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import DisconnectionConfirmModal from '../../ui/page-organization-github-repository-access/disconnection-confirm-modal/disconnection-confirm-modal'
import PageOrganizationGithubRepositoryAccess from '../../ui/page-organization-github-repository-access/page-organization-github-repository-access'

export function PageOrganizationGithubRepositoryAccessFeature() {
  useDocumentTitle('Git Repository Access - Organization settings')
  const { organizationId = '' } = useParams()

  const githubConnectUrl = `https://github.com/apps/qovery-github-app/installations/new?state=${organizationId}`

  const { getAccessTokenSilently } = useAuth0()
  const {
    refetch: refetchAuthProviders,
    data: authProviders = [],
    isLoading: isLoadingAuthProviders,
  } = useAuthProviders({ organizationId })
  const [githubAuthProvider, setGithubAuthProvider] = useState<GitAuthProvider>()

  const { data: repositories = [], isLoading: isLoadingRepositories } = useRepositories({
    organizationId,
    gitProvider: GitProviderEnum.GITHUB,
  })
  const { mutateAsync: mutateAsyncDisconnectGithubApp, isLoading: isLoadingDisconnectGithubApp } =
    useDisconnectGithubApp()
  const { openModal, closeModal } = useModal()

  useEffect(() => {
    // Reset the cache to force the refresh of the auth providers
    // We already invalid token on the success for connexion and disconnect requests
    // Maybe its not necessary to do the same thing here (need to be clean)
    async function refetchAuthProvidersWithNewToken() {
      await getAccessTokenSilently({ cacheMode: 'off' })
      refetchAuthProviders()
    }
    refetchAuthProvidersWithNewToken()
  }, [refetchAuthProviders, getAccessTokenSilently])

  useEffect(() => {
    authProviders.forEach((authProvider) => {
      authProvider.name === 'GITHUB' && setGithubAuthProvider(authProvider)
    })
  }, [authProviders])

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
  const onDisconnect = async (force?: boolean) => {
    try {
      await mutateAsyncDisconnectGithubApp({
        organizationId,
        force: force,
      })
    } catch (error) {
      console.error(error)
      onDisconnectWithModal()
    }
  }

  return (
    <PageOrganizationGithubRepositoryAccess
      githubConnectURL={githubConnectUrl}
      githubAuthProvider={githubAuthProvider}
      authProviderLoading={isLoadingAuthProviders}
      repositories={repositories}
      repositoriesLoading={isLoadingRepositories}
      onConfigure={onConfigure}
      onDisconnect={onDisconnect}
      forceLoading={isLoadingDisconnectGithubApp}
    />
  )
}

export default PageOrganizationGithubRepositoryAccessFeature
