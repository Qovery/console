import { GitAuthProvider } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { RepositoryEntity } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  Link,
  LoaderSpinner,
} from '@qovery/shared/ui'

export interface PageOrganizationGithubRepositoryAccessProps {
  githubConnectURL?: string
  githubAuthProvider?: GitAuthProvider
  authProviderLoading?: boolean
  repositories?: RepositoryEntity[]
  repositoriesLoading?: boolean
  onConfigure?: () => void
  onDisconnect?: (force: boolean) => void
}

export function PageOrganizationGithubRepositoryAccess(props: PageOrganizationGithubRepositoryAccessProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Github Repository Access</h1>
            <p className="text-text-500 text-xs">
              By default Qovery has access to all your repositories. If you are using Github, you can restrict the
              Qovery accesses by installing the Qovery Github application on your GitHub organization
            </p>
          </div>
        </div>
        <BlockContent title="Qovery Github application installation status">
          {props.authProviderLoading ? (
            <div className="flex justify-center">
              <LoaderSpinner className="w-5" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex gap-5">
                <Icon name={IconEnum.GITHUB} className="text-text-600" />
                {props.githubAuthProvider?.use_bot ? (
                  <span className="text-text-600 text-sm font-medium">Github App Installed</span>
                ) : (
                  <span className="text-text-600 text-sm font-medium">Not installed</span>
                )}
              </div>
              {!props.githubAuthProvider?.use_bot ? (
                <Button
                  dataTestId="install-button"
                  onClick={props.onConfigure}
                  size={ButtonSize.SMALL}
                  className="ml-2"
                >
                  Install
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    style={ButtonStyle.STROKED}
                    size={ButtonSize.SMALL}
                    dataTestId="disconnect-button"
                    iconRight={IconAwesomeEnum.CROSS}
                    onClick={() => props.onDisconnect && props.onDisconnect(false)}
                  >
                    Disconnect
                  </Button>
                  <Button dataTestId="permission-button" size={ButtonSize.SMALL} onClick={props.onConfigure}>
                    Manage Permissions
                  </Button>
                </div>
              )}
            </div>
          )}
        </BlockContent>

        {props.repositoriesLoading ? (
          <div className="flex justify-center">
            <LoaderSpinner className="w-5" />
          </div>
        ) : (
          props.repositories &&
          props.repositories?.length > 0 && (
            <BlockContent title="Authorized Repositories">
              <ul className="flex flex-col gap-2">
                {props.repositories.map((repository: RepositoryEntity) => (
                  <li key={repository.id} className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <Icon name={IconEnum.GITHUB} className="text-text-600 w-4" />
                      <Link link={repository.url} linkLabel={repository.name} external></Link>
                    </div>
                  </li>
                ))}
              </ul>
            </BlockContent>
          )
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#managing-git-permissions-using-the-qovery-github-app',
            linkLabel: 'Managing Git Permissions Using the Qovery Github application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationGithubRepositoryAccess
