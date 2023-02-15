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
              Qovery accesses by installing the Qovery Github App on your GitHub organization
            </p>
          </div>
        </div>
        <BlockContent title="Qovery Github App installation status">
          <div className="flex items-center justify-between">
            <div className="flex gap-5">
              <Icon name={IconEnum.GITHUB} className="text-text-600" />
              {props.githubAuthProvider?.use_bot ? (
                <span className="text-text-600 text-sm font-medium">Github App Installed</span>
              ) : (
                <span className="text-text-600 text-sm font-medium">Not installed</span>
              )}
            </div>
            {props.authProviderLoading ? (
              <LoaderSpinner className="w-6" />
            ) : !props.githubAuthProvider?.use_bot ? (
              <Button link={props.githubConnectURL} external size={ButtonSize.SMALL} className="ml-2">
                Install
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button style={ButtonStyle.STROKED} size={ButtonSize.SMALL} iconRight={IconAwesomeEnum.CROSS}>
                  Disconnect
                </Button>
                <Button size={ButtonSize.SMALL}>Manage Permissions</Button>
              </div>
            )}
          </div>
        </BlockContent>

        {props.repositories && props.repositories?.length > 0 && (
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
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#container-registry-management',
            linkLabel: 'How to configure my container registry',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationGithubRepositoryAccess
