import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type ServiceLightResponse } from 'qovery-typescript-axios'
import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ServiceAvatar, useFavoriteServices, useRecentServices } from '@qovery/domains/services/feature'
import { AssistantContext } from '@qovery/shared/assistant/feature'
import { IconEnum } from '@qovery/shared/enums'
import {
  APPLICATION_URL,
  DATABASE_URL,
  SETTINGS_API_URL,
  SETTINGS_CONTAINER_REGISTRIES_URL,
  SETTINGS_GIT_REPOSITORY_ACCESS_URL,
  SETTINGS_HELM_REPOSITORIES_URL,
  SETTINGS_MEMBERS_URL,
  SETTINGS_URL,
  SETTINGS_WEBHOOKS,
  USER_URL,
} from '@qovery/shared/routes'
import { Command, type CommandDialogProps, Icon, Truncate } from '@qovery/shared/ui'
import { QOVERY_DOCS_URL, QOVERY_FORUM_URL, QOVERY_ROADMAP_URL } from '@qovery/shared/util-const'
import { useQuickActions } from '../hooks/use-quick-actions/use-quick-actions'
import { useServicesSearch } from '../hooks/use-services-search/use-services-search'
import { SubCommand } from '../sub-command/sub-command'

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

const ServiceItem = ({
  type = 'original',
  service,
  isFavorite,
  onSelect,
}: {
  service: ServiceLightResponse
  onSelect: () => void
  type?: 'favorite' | 'recent' | 'original'
  isFavorite?: boolean
}) => {
  const { name, service_type, job_type, icon_uri, project_name, environment_name } = service

  return (
    <Command.Item
      onSelect={onSelect}
      value={`service-${type}-${name}-#${service.id}`}
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
        <Truncate text={name} truncateLimit={30} />
      </span>

      <span className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-ssm text-neutral-350">
          <Truncate text={project_name} truncateLimit={30} /> <span className="text-neutral-300">/</span>{' '}
          <Truncate text={environment_name} truncateLimit={30} />
          {isFavorite && <Icon iconName="star" iconStyle="solid" className="ml-2 text-yellow-500" />}
        </span>
      </span>
    </Command.Item>
  )
}

export interface SpotlightProps extends Pick<CommandDialogProps, 'open' | 'onOpenChange'> {
  organizationId: string
}

export function Spotlight({ organizationId, open, onOpenChange }: SpotlightProps) {
  const navigate = useNavigate()
  const quickActions = useQuickActions()
  const { setAssistantOpen } = useContext(AssistantContext)
  const { data: services = [], isLoading: isLoadingServices } = useServicesSearch({ organizationId })
  const [searchInput, setSearchInput] = useState('')
  const { getRecentServices, addToRecentServices } = useRecentServices({ organizationId })
  const { getFavoriteServices } = useFavoriteServices({ organizationId })
  const [selectedService, setSelectedService] = useState<ServiceLightResponse | undefined>(undefined)
  const [selectedValue, setSelectedValue] = useState('')
  const [openSubCommand, setOpenSubCommand] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const recentServices = useMemo(() => getRecentServices(), [getRecentServices])
  const favoriteServices = useMemo(() => getFavoriteServices(), [getFavoriteServices])

  const iconClassName = 'text-brand-500 text-sm text-center w-6'

  const navigateTo = useCallback(
    (link: string) => () => {
      navigate(link)
      onOpenChange?.(false)
    },
    [navigate, onOpenChange]
  )

  const openExternalLink = useCallback(
    (externalLink: string) => () => {
      window.open(externalLink, '_blank')
    },
    []
  )

  const navigateToService = useCallback(
    (service: ServiceLightResponse) => {
      const serviceLink =
        service.service_type === 'DATABASE'
          ? DATABASE_URL(organizationId, service.project_id, service.environment_id, service.id)
          : APPLICATION_URL(organizationId, service.project_id, service.environment_id, service.id)

      addToRecentServices(service)
      setSelectedService(undefined)
      setSearchInput('')

      navigate(serviceLink)
      onOpenChange?.(false)
    },
    [addToRecentServices, navigate, onOpenChange, organizationId]
  )

  const settingsItems: Item[] = useMemo(
    () => [
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
    ],
    [navigateTo, organizationId]
  )

  const helpItems: Item[] = useMemo(
    () => [
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
    ],
    [openExternalLink, onOpenChange, setAssistantOpen]
  )

  const filteredServices = useMemo(() => {
    if (searchInput === '') return []

    return services
      .filter((service) => {
        if (!service.name) return false
        return service.name.toLowerCase().includes(searchInput.toLowerCase())
      })
      .slice(0, 20)
  }, [searchInput, services])

  const resetState = useCallback(() => {
    setSelectedService(undefined)
    setSearchInput('')
  }, [])

  const handleValueChange = useCallback(
    (value: string) => {
      if (value.startsWith('service')) {
        const serviceId = value.split('-#').pop()
        const foundService = services.find((service) => service.id === serviceId)

        if (foundService) {
          setSelectedService(foundService)
        }
      } else {
        setSelectedService(undefined)
      }
      setSelectedValue(value)
    },
    [services]
  )

  const handleSearchChange = useCallback((value: string) => {
    if (listRef.current) listRef.current.scrollTop = 0
    setSearchInput(value)
  }, [])

  return (
    <Command.Dialog
      label="Search"
      open={open}
      onOpenChange={openSubCommand ? undefined : onOpenChange}
      value={selectedValue}
      onValueChange={handleValueChange}
      loop
    >
      <div className="flex w-full items-center border-b border-neutral-200 pl-4 text-base text-neutral-350">
        <Icon iconName="magnifying-glass" iconStyle="regular" />
        <Command.Input
          autoFocus
          ref={inputRef}
          placeholder="Search for actions or services..."
          className="border-b-0"
          value={searchInput}
          onValueChange={handleSearchChange}
        />
      </div>
      <Command.List ref={listRef}>
        {isLoadingServices && <Command.Loading />}
        <Command.Empty>
          <div className="px-3 pb-8 pt-6 text-center">
            <Icon iconName="wave-pulse" className="text-neutral-350" />
            <p className="mt-1 text-xs font-medium text-neutral-350">No result for this search</p>
          </div>
        </Command.Empty>

        {searchInput.length === 0 && favoriteServices.length > 0 && (
          <>
            <Command.Group heading="Favorites services">
              {favoriteServices.map((service) => (
                <ServiceItem
                  key={'favorite-' + service.id}
                  type="favorite"
                  service={service}
                  onSelect={() => navigateToService(service)}
                />
              ))}
            </Command.Group>
            <Command.Separator />
          </>
        )}

        {searchInput.length === 0 && recentServices.length > 0 && (
          <>
            <Command.Group heading="Last services opened">
              {recentServices.map((service) => (
                <ServiceItem
                  key={'recent-' + service.id}
                  type="recent"
                  service={service}
                  onSelect={() => navigateToService(service)}
                />
              ))}
            </Command.Group>
            <Command.Separator />
          </>
        )}

        {filteredServices.length > 0 && (
          <>
            <Command.Group heading="Services">
              {filteredServices.map((service) => (
                <ServiceItem
                  key={'service-' + service.id}
                  service={service}
                  onSelect={() => navigateToService(service)}
                  isFavorite={!!favoriteServices?.find((s) => s.id === service.id)}
                />
              ))}
            </Command.Group>
            <Command.Separator />
          </>
        )}

        {quickActions.length > 0 && (
          <>
            <Command.Group heading="Quick actions">
              {quickActions.map(({ label, iconName, link }) => (
                <Command.Item key={link} onSelect={navigateTo(link)} value={label}>
                  <Icon className={iconClassName} iconName={iconName} />
                  {label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Separator />
          </>
        )}

        <Command.Group heading="Settings">
          {settingsItems.map(({ label, onSelect, ...props }) => (
            <Command.Item key={label} onSelect={onSelect} value={label}>
              {'iconName' in props ? (
                <Icon className={iconClassName} iconName={props.iconName} />
              ) : (
                <Icon className={iconClassName} name={props.iconEnum} />
              )}
              {label}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Separator />
        <Command.Group heading="Help">
          {helpItems.map(({ label, onSelect, ...props }) => (
            <Command.Item key={label} onSelect={onSelect} value={label}>
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
      <SubCommand
        organizationId={organizationId}
        inputRef={inputRef}
        listRef={listRef}
        service={selectedService}
        onSpotlightOpenChange={onOpenChange}
        resetSelection={resetState}
        open={openSubCommand}
        setOpen={setOpenSubCommand}
      />
    </Command.Dialog>
  )
}

export default Spotlight
