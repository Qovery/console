import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'
import { IconEnum } from '@qovery/shared/enums'
import {
  SETTINGS_API_URL,
  SETTINGS_CONTAINER_REGISTRIES_URL,
  SETTINGS_GIT_REPOSITORY_ACCESS_URL,
  SETTINGS_HELM_REPOSITORIES_URL,
  SETTINGS_MEMBERS_URL,
  SETTINGS_URL,
  SETTINGS_WEBHOOKS,
  USER_URL,
} from '@qovery/shared/routes'
import { Command, type CommandDialogProps, Icon } from '@qovery/shared/ui'
import { SpotlightContext } from './spotlight-provider'

export interface SpotlightProps extends Pick<CommandDialogProps, 'open' | 'onOpenChange'> {
  organizationId: string
}

export function Spotlight({ organizationId, open, onOpenChange }: SpotlightProps) {
  const navigate = useNavigate()
  const { showMessages: showIntercomMessenger } = useIntercom()
  const { quickActions } = useContext(SpotlightContext)

  const iconClassName = 'text-brand-500 text-base text-center w-6'
  const navigateTo = (link: string) => () => navigate(link)
  const openExternalLink = (externalLink: string) => () => {
    window.open(externalLink, '_blank')
  }

  return (
    <Command.Dialog label="Console Spotlight" open={open} onOpenChange={onOpenChange}>
      <Command.Input autoFocus placeholder="What do you need?" />
      <Command.List>
        <Command.Empty>
          <div className="text-center px-3 py-6">
            <Icon iconName="wave-pulse" className="text-neutral-350" />
            <p className="text-neutral-350 font-medium text-xs mt-1">No result for this search</p>
          </div>
        </Command.Empty>
        {quickActions.length > 0 && (
          <Command.Group heading="Quick actions">
            {quickActions.map(({ label, iconName, link }) => (
              <Command.Item key={link} onSelect={navigateTo(link)}>
                <Icon className={iconClassName} iconName={iconName} />
                {label}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        <Command.Group heading="Settings">
          <Command.Item onSelect={navigateTo(SETTINGS_URL(organizationId) + SETTINGS_CONTAINER_REGISTRIES_URL)}>
            <Icon className={iconClassName} iconName="box" />
            View my container registries
          </Command.Item>
          <Command.Item onSelect={navigateTo(SETTINGS_URL(organizationId) + SETTINGS_HELM_REPOSITORIES_URL)}>
            <Icon className={iconClassName} name={IconEnum.HELM_OFFICIAL} />
            View my helm repositories
          </Command.Item>
          <Command.Item onSelect={navigateTo(SETTINGS_URL(organizationId) + SETTINGS_GIT_REPOSITORY_ACCESS_URL)}>
            <Icon className={iconClassName} iconName="key" />
            View my git tokens
          </Command.Item>
          <Command.Item onSelect={navigateTo(SETTINGS_URL(organizationId) + SETTINGS_WEBHOOKS)}>
            <Icon className={iconClassName} iconName="tower-broadcast" />
            View my webhooks
          </Command.Item>
          <Command.Item onSelect={navigateTo(SETTINGS_URL(organizationId) + SETTINGS_API_URL)}>
            <Icon className={iconClassName} iconName="cloud-arrow-up" />
            View my API tokens
          </Command.Item>
          <Command.Item onSelect={navigateTo(SETTINGS_URL(organizationId) + SETTINGS_MEMBERS_URL)}>
            <Icon className={iconClassName} iconName="box" />
            View my team members
          </Command.Item>
          <Command.Item onSelect={navigateTo(USER_URL)}>
            <Icon className={iconClassName} iconName="gear-complex" />
            Go to personal settings
          </Command.Item>
        </Command.Group>
        <Command.Group heading="Help">
          <Command.Item onSelect={openExternalLink('https://hub.qovery.com/')}>
            <Icon className={iconClassName} iconName="book-open" />
            Go to documentation
          </Command.Item>
          <Command.Item onSelect={openExternalLink('https://discuss.qovery.com/')}>
            <Icon className={iconClassName} iconName="people" />
            Community Forum
          </Command.Item>
          <Command.Item onSelect={openExternalLink('https://roadmap.qovery.com/b/5m13y5v6/feature-ideas')}>
            <Icon className={iconClassName} iconName="road" />
            Roadmap
          </Command.Item>
          <Command.Item onSelect={showIntercomMessenger}>
            <Icon className={iconClassName} iconName="robot" />
            Get help
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}

export default Spotlight
