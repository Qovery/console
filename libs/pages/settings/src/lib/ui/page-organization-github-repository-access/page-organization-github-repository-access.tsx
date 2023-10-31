import { type GitAuthProvider } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { GitTokenCreateEditModal, ListGitTokens } from '@qovery/domains/organizations/feature'
import { IconEnum } from '@qovery/shared/enums'
import { type RepositoryEntity } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  Callout,
  ExternalLink,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  Section,
  useModal,
} from '@qovery/shared/ui'

export interface PageOrganizationGithubRepositoryAccessProps {
  githubConnectURL?: string
  githubAuthProvider?: GitAuthProvider
  authProviderLoading?: boolean
  repositories?: RepositoryEntity[]
  repositoriesLoading?: boolean
  onConfigure?: () => void
  onDisconnect?: (force: boolean) => void
  forceLoading?: boolean
}

export function PageOrganizationGithubRepositoryAccess(props: PageOrganizationGithubRepositoryAccessProps) {
  const { openModal, closeModal } = useModal()
  const { organizationId = '' } = useParams()

  return (
    <Section className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div className="mr-5">
            {/* TODO: Fix need to use <Heading /> component */}
            <h1 className="h5 text-neutral-400 mb-2">Github Repository Access</h1>
            <p className="text-neutral-400 text-xs">
              By default Qovery has access to all the repositories linked to your git account. If you want to give
              Qovery access to additional repositories and manage the access from one place, you can configure a git
              token.
            </p>
          </div>
          <Button
            onClick={() => {
              openModal({
                content: <GitTokenCreateEditModal organizationId={organizationId} onClose={closeModal} />,
              })
            }}
          >
            Add new token
            <Icon name={IconAwesomeEnum.CIRCLE_PLUS} className="ml-2" />
          </Button>
        </div>
        <ListGitTokens />

        <Section>
          {/* TODO: Fix need to use <Heading /> component */}
          <h2 className="h5 text-neutral-400 mb-2">Qovery GitHub App</h2>
          <p className="text-neutral-400 text-xs mb-8">
            By default Qovery has access to all your repositories. If you are using Github, you can restrict the Qovery
            accesses by installing the Qovery Github App on your GitHub organization.
          </p>
          <Callout.Root className="text-xs mb-5" color="yellow">
            <Callout.Icon>
              <Icon name={IconAwesomeEnum.CIRCLE_INFO} />
            </Callout.Icon>
            <Callout.Text>The Qovery GitHub app is being deprecated, please use the Git tokens.</Callout.Text>
          </Callout.Root>

          <BlockContent title="Qovery Github application installation status">
            {props.authProviderLoading || props.forceLoading ? (
              <div className="flex justify-center">
                <LoaderSpinner className="w-5" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex gap-5">
                  <Icon name={IconEnum.GITHUB} className="text-neutral-400" />
                  {props.githubAuthProvider?.use_bot ? (
                    <span className="text-neutral-400 text-sm font-medium">Github App Installed</span>
                  ) : (
                    <span className="text-neutral-400 text-sm font-medium">Not installed</span>
                  )}
                </div>
                {!props.githubAuthProvider?.use_bot ? (
                  <ButtonLegacy
                    dataTestId="install-button"
                    onClick={props.onConfigure}
                    size={ButtonLegacySize.SMALL}
                    className="ml-2"
                  >
                    Install
                  </ButtonLegacy>
                ) : (
                  <div className="flex gap-2">
                    <ButtonLegacy
                      style={ButtonLegacyStyle.STROKED}
                      size={ButtonLegacySize.SMALL}
                      dataTestId="disconnect-button"
                      iconRight={IconAwesomeEnum.XMARK}
                      onClick={() => props.onDisconnect && props.onDisconnect(false)}
                    >
                      Disconnect
                    </ButtonLegacy>
                    <ButtonLegacy
                      dataTestId="permission-button"
                      size={ButtonLegacySize.SMALL}
                      onClick={props.onConfigure}
                    >
                      Manage Permissions
                    </ButtonLegacy>
                  </div>
                )}
              </div>
            )}
          </BlockContent>
        </Section>

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
                      <Icon name={IconEnum.GITHUB} className="text-neutral-400 w-4" />
                      <ExternalLink href={repository.url}>{repository.name}</ExternalLink>
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
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/git-repository-access',
            linkLabel: 'How to configure the git repository access',
          },
        ]}
      />
    </Section>
  )
}

export default PageOrganizationGithubRepositoryAccess
