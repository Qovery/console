import { useAuth0 } from '@auth0/auth0-react'
import { jwtDecode } from 'jwt-decode'
import { type GitAuthProvider, type GitRepository } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { IconEnum } from '@qovery/shared/enums'
import {
  BlockContent,
  Button,
  Callout,
  ExternalLink,
  Heading,
  Icon,
  LoaderSpinner,
  Section,
  useModal,
} from '@qovery/shared/ui'

export interface SectionGithubAppProps {
  githubAuthProvider?: GitAuthProvider
  authProviderLoading?: boolean
  repositories?: GitRepository[]
  repositoriesLoading?: boolean
  onConfigure?: () => void
  onDisconnect?: (force: boolean) => void
  forceLoading?: boolean
}

export function SectionGithubApp(props: SectionGithubAppProps) {
  return (
    <>
      <Section>
        <Heading className="mb-2">Qovery GitHub App</Heading>
        <p className="mb-8 text-xs text-neutral-400">
          By default Qovery has access to all your repositories. If you are using Github, you can restrict the Qovery
          accesses by installing the Qovery Github App on your GitHub organization.
        </p>
        <Callout.Root className="mb-5" color="yellow">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
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
                  <span className="text-sm font-medium text-neutral-400">Github App Installed</span>
                ) : (
                  <span className="text-sm font-medium text-neutral-400">Not installed</span>
                )}
              </div>
              {!props.githubAuthProvider?.use_bot ? (
                <Button
                  data-testid="install-button"
                  type="button"
                  size="md"
                  onClick={props.onConfigure}
                  className="ml-2"
                >
                  Install
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    data-testid="disconnect-button"
                    className="gap-1"
                    type="button"
                    size="md"
                    onClick={() => props.onDisconnect && props.onDisconnect(false)}
                  >
                    Disconnect
                    <Icon iconName="circle-xmark" />
                  </Button>
                  <Button data-testid="permission-button" type="button" size="md" onClick={props.onConfigure}>
                    Manage Permissions
                  </Button>
                </div>
              )}
            </div>
          )}
        </BlockContent>
      </Section>
      {props.githubAuthProvider?.use_bot && (
        <div>
          {props.repositoriesLoading ? (
            <div className="flex justify-center">
              <LoaderSpinner className="w-5" />
            </div>
          ) : (
            props.repositories &&
            props.repositories?.length > 0 && (
              <BlockContent title="Authorized Repositories">
                <ul className="flex flex-col gap-2">
                  {props.repositories.map((repository) => (
                    <li key={repository.id} className="flex items-center justify-between">
                      <div className="flex gap-3">
                        <Icon name={IconEnum.GITHUB} className="w-4 text-neutral-400" />
                        <ExternalLink href={repository.url}>{repository.name}</ExternalLink>
                      </div>
                    </li>
                  ))}
                </ul>
              </BlockContent>
            )
          )}
        </div>
      )}
    </>
  )
}

export default SectionGithubApp
