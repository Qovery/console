import { useAuth0 } from '@auth0/auth0-react'
import { useParams } from '@tanstack/react-router'
import { jwtDecode } from 'jwt-decode'
import { type GitAuthProvider, GitProviderEnum } from 'qovery-typescript-axios'
import { Suspense, useEffect, useState } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, Icon, Section, Skeleton, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { GitTokenCreateEditModal } from '../git-token-create-edit-modal/git-token-create-edit-modal'
import { GitTokenList } from '../git-token-list/git-token-list'
import { useAuthProviders } from '../hooks/use-auth-providers/use-auth-providers'
import { useDisconnectGithubApp } from '../hooks/use-disconnect-github-app/use-disconnect-github-app'
import { useRepositories } from '../hooks/use-repositories/use-repositories'
import SectionGithubApp from './section-github-app/section-github-app'

function SettingsGitRepositoryAccessContent() {
  useDocumentTitle('Git Repository Access - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const [displayGitAppSection, setDisplayGitAppSection] = useState(false)
  const githubConnectUrl = `https://github.com/apps/qovery-github-app/installations/new?state=${organizationId}`

  const { getAccessTokenSilently } = useAuth0()
  const { refetch: refetchAuthProviders, data: authProviders = [] } = useAuthProviders({
    organizationId,
    suspense: true,
  })
  const [githubAuthProvider, setGithubAuthProvider] = useState<GitAuthProvider>()

  const { data: repositories = [] } = useRepositories({
    organizationId,
    gitProvider: GitProviderEnum.GITHUB,
    suspense: true,
  })

  const { mutateAsync: disconnectGithubApp } = useDisconnectGithubApp()

  const { openModal, closeModal } = useModal()

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

  const onDisconnect = async (force: boolean) => {
    await disconnectGithubApp({ organizationId, force })
  }

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
          {displayGitAppSection && (
            <SectionGithubApp
              githubAuthProvider={githubAuthProvider}
              repositories={repositories}
              onConfigure={onConfigure}
              onDisconnect={onDisconnect}
            />
          )}
        </div>
      </Section>
    </div>
  )
}

export function SettingsGitRepositoryAccess() {
  return (
    <Suspense fallback={<GitRepositoryAccessSkeleton />}>
      <SettingsGitRepositoryAccessContent />
    </Suspense>
  )
}

const GitRepositoryAccessSkeleton = () => (
  <div className="space-y-8 p-8">
    <div className="relative border-b border-neutral pb-8">
      <Skeleton width={220} height={32} show={true} />
      <div className="mt-2 space-y-2">
        <Skeleton width={480} height={12} show={true} />
        <Skeleton width={400} height={12} show={true} />
        <Skeleton width={120} height={24} show={true} />
      </div>
      <div className="absolute right-0 top-0">
        <Skeleton width={150} height={36} show={true} />
      </div>
    </div>
    <div className="max-w-content-with-navigation-left space-y-8">
      <BlockContent title="Git tokens" classNameContent="p-0">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 border-b border-neutral px-5 py-4 last:border-0"
          >
            <Skeleton width={260} height={20} show={true} />
            <div className="flex gap-2">
              <Skeleton width={36} height={36} show={true} />
              <Skeleton width={36} height={36} show={true} />
              <Skeleton width={36} height={36} show={true} />
            </div>
          </div>
        ))}
      </BlockContent>
    </div>
  </div>
)
