import { useAuth0 } from '@auth0/auth0-react'
import { jwtDecode } from 'jwt-decode'
import { type GitAuthProvider, type GitRepository } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { GitTokenCreateEditModal, GitTokenList } from '@qovery/domains/organizations/feature'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { Button, Heading, Icon, Section, useModal } from '@qovery/shared/ui'
import SectionGithubApp from './section-github-app/section-github-app'

export interface PageOrganizationGithubRepositoryAccessProps {
  githubConnectURL?: string
  githubAuthProvider?: GitAuthProvider
  authProviderLoading?: boolean
  repositories?: GitRepository[]
  repositoriesLoading?: boolean
  onConfigure?: () => void
  onDisconnect?: (force: boolean) => void
  forceLoading?: boolean
}

export function PageOrganizationGithubRepositoryAccess(props: PageOrganizationGithubRepositoryAccessProps) {
  const { openModal, closeModal } = useModal()
  const { organizationId = '' } = useParams()
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
      <div className="max-w-content-with-navigation-left p-8">
        <Section>
          <div className="mb-8 flex justify-between gap-2">
            <div className="mr-5 space-y-3">
              <Heading>Git Repository Access</Heading>
              <p className="text-xs text-neutral-400">
                By default Qovery has access to all the repositories linked to your git account. If you want to give
                Qovery access to additional repositories and manage the access from one place, you can configure a git
                token.
              </p>
              <NeedHelp />
            </div>
            <Button
              size="md"
              onClick={() => {
                openModal({
                  content: <GitTokenCreateEditModal organizationId={organizationId} onClose={closeModal} />,
                })
              }}
            >
              Add new token
              <Icon iconName="circle-plus" iconStyle="regular" className="ml-2" />
            </Button>
          </div>
          <GitTokenList />
        </Section>

        {displayGitAppSection && <SectionGithubApp {...props} />}
      </div>
    </div>
  )
}

export default PageOrganizationGithubRepositoryAccess
