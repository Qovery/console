import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ServiceAvatar } from '@qovery/domains/services/feature'
import { AssistantContext } from '@qovery/shared/assistant/feature'
import { IconEnum } from '@qovery/shared/enums'
import {
  APPLICATION_URL,
  DATABASE_URL,
  ENVIRONMENTS_URL,
  ORGANIZATION_URL,
  SERVICES_URL,
  SETTINGS_API_URL,
  SETTINGS_CONTAINER_REGISTRIES_URL,
  SETTINGS_GIT_REPOSITORY_ACCESS_URL,
  SETTINGS_HELM_REPOSITORIES_URL,
  SETTINGS_MEMBERS_URL,
  SETTINGS_URL,
  SETTINGS_WEBHOOKS,
  USER_URL,
} from '@qovery/shared/routes'
import { Command, type CommandDialogProps, Icon, Link } from '@qovery/shared/ui'
import { QOVERY_DOCS_URL, QOVERY_FORUM_URL, QOVERY_ROADMAP_URL } from '@qovery/shared/util-const'
import { useQuickActions } from '../hooks/use-quick-actions/use-quick-actions'
import { useServicesSearch } from '../hooks/use-services-search/use-services-search'

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
  const { data: services = [] } = useServicesSearch({ organizationId })

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
      <div className="flex w-full items-center border-b border-neutral-200 pl-4 text-base text-neutral-350">
        <Icon iconName="magnifying-glass" iconStyle="regular" />
        <Command.Input autoFocus placeholder="Search for actions or services..." className="border-b-0" />
      </div>
      <Command.List>
        <Command.Empty>
          <div className="px-3 pb-4 pt-6 text-center">
            <Icon iconName="wave-pulse" className="text-neutral-350" />
            <p className="mt-1 text-xs font-medium text-neutral-350">No result for this search</p>
          </div>
        </Command.Empty>

        <Command.Group heading="Services">
          {services.map(({ id, name, service_type, job_type, icon_uri, project_id, environment_id, ...props }) => (
            <Command.Item
              key={id}
              onSelect={() => {
                navigate(
                  service_type === 'DATABASE'
                    ? DATABASE_URL(organizationId, project_id, environment_id, id)
                    : APPLICATION_URL(organizationId, project_id, environment_id, id)
                )
                onOpenChange?.(false)
              }}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-3">
                <ServiceAvatar
                  size="xs"
                  service={
                    service_type === 'JOB'
                      ? {
                          icon_uri,
                          serviceType: 'JOB' as const,
                          job_type: job_type ?? 'CRON',
                        }
                      : {
                          icon_uri,
                          serviceType: service_type,
                        }
                  }
                />
                {name}
              </span>
              <span className="text-ssm">
                <Link color="brand" to={ENVIRONMENTS_URL(organizationId, project_id)}>
                  {props.project_name}
                </Link>{' '}
                /
                <Link color="brand" to={SERVICES_URL(organizationId, project_id, environment_id)}>
                  {props.environment_name}
                </Link>
              </span>
            </Command.Item>
          ))}
        </Command.Group>

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
