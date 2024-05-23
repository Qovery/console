import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AssistantContext } from '@qovery/shared/assistant/feature'
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
import { QOVERY_DOCS_URL, QOVERY_FORUM_URL, QOVERY_ROADMAP_URL } from '@qovery/shared/util-const'
import useQuickActions from '../hooks/use-quick-actions/use-quick-actions'

type Item = {
  label: string
  onSelect: (value: string) => void
} & (
  | {
      iconName: IconName
    }
  | {
      iconEnum: IconEnum
    }
)

export interface SpotlightProps extends Pick<CommandDialogProps, 'open' | 'onOpenChange'> {
  organizationId: string
}

export function Spotlight({ organizationId, open, onOpenChange }: SpotlightProps) {
  const navigate = useNavigate()
  const quickActions = useQuickActions()
  const { setAssistantOpen } = useContext(AssistantContext)

  const iconClassName = 'text-brand-500 text-base text-center w-6'
  const navigateTo = (link: string) => () => {
    navigate(link)
    onOpenChange?.(false)
  }
  const openExternalLink = (externalLink: string) => () => {
    window.open(externalLink, '_blank')
  }
  const settingsItems: Item[] = [
    {
      label: 'View my container registries',
      onSelect: navigateTo(SETTINGS_URL(organizationId) + SETTINGS_CONTAINER_REGISTRIES_URL),
      iconName: 'box',
    },
    {
      label: 'View my helm repositories',
      onSelect: navigateTo(SETTINGS_URL(organizationId) + SETTINGS_HELM_REPOSITORIES_URL),
      iconEnum: IconEnum.HELM_OFFICIAL,
    },
    {
      label: 'View my git tokens',
      onSelect: navigateTo(SETTINGS_URL(organizationId) + SETTINGS_GIT_REPOSITORY_ACCESS_URL),
      iconName: 'key',
    },
    {
      label: 'View my webhooks',
      onSelect: navigateTo(SETTINGS_URL(organizationId) + SETTINGS_WEBHOOKS),
      iconName: 'tower-broadcast',
    },
    {
      label: 'View my API tokens',
      onSelect: navigateTo(SETTINGS_URL(organizationId) + SETTINGS_API_URL),
      iconName: 'cloud-arrow-up',
    },
    {
      label: 'View my team members',
      onSelect: navigateTo(SETTINGS_URL(organizationId) + SETTINGS_MEMBERS_URL),
      iconName: 'user-group',
    },
    {
      label: 'Go to personal settings',
      onSelect: navigateTo(USER_URL),
      iconName: 'gear-complex',
    },
  ]
  const helpItems: Item[] = [
    {
      label: 'Go to documentation',
      onSelect: openExternalLink(QOVERY_DOCS_URL),
      iconName: 'book-open',
    },
    {
      label: 'Community Forum',
      onSelect: openExternalLink(QOVERY_FORUM_URL),
      iconName: 'people',
    },
    {
      label: 'Roadmap',
      onSelect: openExternalLink(QOVERY_ROADMAP_URL),
      iconName: 'road',
    },
    {
      label: 'Get help',
      onSelect: () => {
        setAssistantOpen(true)
        onOpenChange?.(false)
      },
      iconName: 'robot',
    },
  ]

  return (
    <Command.Dialog label="Console Spotlight" open={open} onOpenChange={onOpenChange}>
      <Command.Input autoFocus placeholder="What do you need?" />
      <Command.List>
        <Command.Empty>
          <div className="px-3 pb-4 pt-6 text-center">
            <Icon iconName="wave-pulse" className="text-neutral-350" />
            <p className="mt-1 text-xs font-medium text-neutral-350">No result for this search</p>
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
          {settingsItems.map(({ label, onSelect, ...props }) => (
            <Command.Item key={label} onSelect={onSelect}>
              {'iconName' in props ? (
                <Icon className={iconClassName} iconName={props.iconName} />
              ) : (
                <Icon className={iconClassName} name={props.iconEnum} />
              )}
              {label}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Help">
          {helpItems.map(({ label, onSelect, ...props }) => (
            <Command.Item key={label} onSelect={onSelect}>
              {'iconName' in props ? (
                <Icon className={iconClassName} iconName={props.iconName} />
              ) : (
                <Icon className={iconClassName} name={props.iconEnum} />
              )}
              {label}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}

export default Spotlight
