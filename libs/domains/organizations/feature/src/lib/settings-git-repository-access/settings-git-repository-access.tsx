import { useAuth0 } from '@auth0/auth0-react'
import { useParams } from '@tanstack/react-router'
import { jwtDecode } from 'jwt-decode'
import { type GitAuthProvider, GitProviderEnum, type GitRepository } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Icon, Section, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { GitTokenCreateEditModal } from '../git-token-create-edit-modal/git-token-create-edit-modal'
import { GitTokenList } from '../git-token-list/git-token-list'
import { useAuthProviders } from '../hooks/use-auth-providers/use-auth-providers'
import { useDisconnectGithubApp } from '../hooks/use-disconnect-github-app/use-disconnect-github-app'
import { useRepositories } from '../hooks/use-repositories/use-repositories'
import SectionGithubApp from './section-github-app/section-github-app'

interface PageOrganizationGithubRepositoryAccessProps {
  githubConnectURL?: string
  githubAuthProvider?: GitAuthProvider
  authProviderLoading?: boolean
  repositories?: GitRepository[]
  repositoriesLoading?: boolean
  onConfigure?: () => void
  onDisconnect?: (force: boolean) => void
  forceLoading?: boolean
}

function PageOrganizationGithubRepositoryAccess(props: PageOrganizationGithubRepositoryAccessProps) {
  const { openModal, closeModal } = useModal()
  const { organizationId = '' } = useParams({ strict: false })
  const { getAccessTokenSilently } = useAuth0()
  const [displayGitAppSection, setDisplayGitAppSection] = useState(false)

  // Display section only if the user has at least one github app installation
  // Soon deprecated: https://qovery.atlassian.net/jira/software/projects/FRT/boards/23?selectedIssue=FRT-1225
  useEffect(() => {
    const GITHUB_APP_INSTALLATIONS = 'https://qovery.com/githubapp_installations'
    async function fetchGithubAppInstallations() {
      try {
        const token = await getAccessTokenSilently()
        const tokenDecoded: { [GITHUB_APP_INSTALLATIONS]: string[] } = jwtDecode(token)
        setDisplayGitAppSection(tokenDecoded[GITHUB_APP_INSTALLATIONS].length > 0)
      } catch (error) {
        console.error(error)
      }
    }

    fetchGithubAppInstallations()
  }, [getAccessTokenSilently])

  return (
    <div className="w-full justify-between">
      <Section className="p-8">
        <div className="relative">
          <SettingsHeading
            title="Git Repository Access"
            description="By default Qovery has access to all the repositories linked to your git account. If you want to give
                Qovery access to additional repositories and manage the access from one place, you can configure a git
                token."
          />

          <Button
            size="md"
            className="absolute right-0 top-0 shrink-0 gap-2"
            onClick={() => {
              openModal({
                content: <GitTokenCreateEditModal organizationId={organizationId} onClose={closeModal} />,
              })
            }}
          >
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add new token
          </Button>
        </div>
        <div className="max-w-content-with-navigation-left">
          <GitTokenList />
          {displayGitAppSection && <SectionGithubApp {...props} />}
        </div>
      </Section>
    </div>
  )
}

export function SettingsGitRepositoryAccess() {
  useDocumentTitle('Git Repository Access - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })

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
