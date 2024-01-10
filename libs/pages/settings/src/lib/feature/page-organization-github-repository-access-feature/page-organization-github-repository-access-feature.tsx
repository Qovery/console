import { type GitAuthProvider, GitProviderEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthProviders, useDisconnectGithubApp, useRepositories } from '@qovery/domains/organizations/feature'
import { useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import DisconnectionConfirmModal from '../../ui/page-organization-github-repository-access/disconnection-confirm-modal/disconnection-confirm-modal'
import PageOrganizationGithubRepositoryAccess from '../../ui/page-organization-github-repository-access/page-organization-github-repository-access'

export function PageOrganizationGithubRepositoryAccessFeature() {
  useDocumentTitle('Github Repository Access - Organization settings')
  const { organizationId = '' } = useParams()

  const githubConnectUrl = `https://github.com/apps/qovery-github-app/installations/new?state=${organizationId}`

  const { data: authProviders = [], isLoading: isLoadingAuthProviders } = useAuthProviders({ organizationId })
  const [githubAuthProvider, setGithubAuthProvider] = useState<GitAuthProvider>()

  const { data: repositories = [], isLoading: isLoadingRepositories } = useRepositories({
    organizationId,
    gitProvider: GitProviderEnum.GITHUB,
  })
  const { mutateAsync: mutateAsyncDisconnectGithubApp, isLoading: isLoadingDisconnectGithubApp } =
    useDisconnectGithubApp()
  const { openModal, closeModal } = useModal()

  useEffect(() => {
    authProviders.forEach((authProvider) => {
      authProvider.name === 'GITHUB' && setGithubAuthProvider(authProvider)
    })
  }, [authProviders])

  // useEffect(() => {
  //   if (githubAuthProvider?.use_bot) {
  //     dispatch(fetchRepository({ organizationId: organizationId, gitProvider: GitProviderEnum.GITHUB }))
  //   }
  // }, [githubAuthProvider, dispatch, organizationId])

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
      // if ((error.name === 'Bad Request' || error.code === '400') && error.message.includes('This git provider is')) {
      onDisconnectWithModal()
      // }
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
