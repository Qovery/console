import { useCallback, useState } from 'react'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ServiceAvatar } from '@qovery/domains/services/feature'
import { Button, Checkbox, DropdownMenu, Icon, Tooltip, Truncate } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { type DeployByVersionService, type ServiceVersionSelections, type VersionOption } from './deploy-by-version'

function Version({ service, value, latest }: { service: DeployByVersionService; value?: string; latest?: boolean }) {
  if (!value) return <span className="text-neutral-subtle">Not deployed</span>

  return (
    <span className="flex min-w-0 items-center gap-1">
      {service.sourceType === 'git' && (
        <Icon iconName="code-commit" iconStyle="regular" className="shrink-0 text-ssm" />
      )}
      <span className="truncate text-ssm">
        {latest ? 'Latest' : service.sourceType === 'git' ? value.slice(0, 7) : value}
      </span>
    </span>
  )
}

function VersionServiceAvatar({ service }: { service: DeployByVersionService }) {
  const props = {
    size: 'custom' as const,
    radius: 'none' as const,
    serviceAvatarRadius: 'sm' as const,
    className: 'h-5 w-5',
  }

  if (service.serviceType === 'JOB') {
    if (!service.jobType) return null
    return (
      <ServiceAvatar
        {...props}
        service={{ icon_uri: service.iconUri, serviceType: 'JOB', job_type: service.jobType }}
      />
    )
  }

  return <ServiceAvatar {...props} service={{ icon_uri: service.iconUri, serviceType: service.serviceType }} />
}

function VersionOptionButton({
  option,
  selected,
  onChange,
}: {
  option: VersionOption
  selected: boolean
  onChange: (version: string) => void
}) {
  return (
    <DropdownMenu.Item
      color="neutral"
      className={twMerge(
        'h-[62px] w-full shrink-0 cursor-pointer flex-col items-start justify-center gap-0.5 rounded-none border-b border-neutral px-3 py-3 text-left font-normal last:border-b-0 hover:bg-surface-neutral-subtle data-[highlighted]:bg-surface-neutral-subtle',
        selected && 'bg-surface-neutral-subtle'
      )}
      onSelect={() => onChange(option.value)}
    >
      <span className="flex min-w-0 items-center gap-1 text-sm font-normal leading-5 text-neutral">
        <span className="shrink-0">{option.value.slice(0, 7)}</span>
        {selected && <Icon iconName="check" className="shrink-0 text-sm text-positive" />}
      </span>
      {option.message && (
        <span className="w-full truncate text-ssm font-normal leading-4 text-neutral-subtle">{option.message}</span>
      )}
    </DropdownMenu.Item>
  )
}

function VersionOptions({
  service,
  value,
  onChange,
}: {
  service: DeployByVersionService
  value: string
  onChange: (version: string) => void
}) {
  return service.versions.map((option) => (
    <VersionOptionButton key={option.value} option={option} selected={option.value === value} onChange={onChange} />
  ))
}

function VersionSelector({
  service,
  value,
  selected,
  disabled,
  onChange,
}: {
  service: DeployByVersionService
  value: string
  selected: boolean
  disabled: boolean
  onChange: (version: string) => void
}) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement>()
  const setTriggerRef = useCallback((trigger: HTMLButtonElement | null) => {
    if (trigger) setPortalContainer(trigger.closest<HTMLElement>('[role="dialog"]') ?? undefined)
  }, [])

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          ref={setTriggerRef}
          type="button"
          size="xs"
          color="neutral"
          variant="outline"
          disabled={disabled}
          aria-label={`Select a version for ${service.name}`}
          className={twMerge('group justify-between', selected && 'border-brand-subtle')}
        >
          <Version service={service} value={value} latest={value === service.versions[0]?.value} />
          <Icon
            iconName="chevron-down"
            className="shrink-0 text-ssm transition-transform duration-200 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
          />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        container={portalContainer}
        data-testid="version-options"
        className="z-dropdown max-h-[248px] w-80 gap-0 overflow-y-auto overflow-x-hidden overscroll-contain rounded-md p-0"
      >
        <VersionOptions service={service} value={value} onChange={onChange} />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export function ServiceVersionRow({
  service,
  selection,
  onToggle,
  onVersionChange,
}: {
  service: DeployByVersionService
  selection: ServiceVersionSelections[string]
  onToggle: () => void
  onVersionChange: (version: string) => void
}) {
  const hasVersions = service.versions.length > 0
  const disabled = service.isSkipped || !hasVersions
  const tooltip = service.isSkipped
    ? 'This service is skipped and cannot be deployed at environment level.'
    : service.hasVersionError
      ? 'Versions could not be loaded for this service.'
      : 'No versions are available for this service.'

  return (
    <Tooltip content={tooltip} disabled={!disabled}>
      <li
        data-testid="service-version-row"
        className={twMerge(
          'flex min-h-[53px] items-center gap-3 border border-b-0 border-neutral p-4 last:border-b',
          'first:rounded-t-md last:rounded-b-md',
          selection.selected && !disabled && 'bg-surface-brand-subtle',
          disabled && 'opacity-50'
        )}
      >
        <label
          htmlFor={`deploy-service-${service.id}`}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-4"
        >
          <Checkbox
            id={`deploy-service-${service.id}`}
            checked={selection.selected}
            disabled={disabled}
            onCheckedChange={(checked) => checked !== 'indeterminate' && onToggle()}
          />
          <span className="flex min-w-0 items-center gap-2">
            <VersionServiceAvatar service={service} />
            <span className="min-w-0 text-sm font-medium text-neutral">
              <Truncate truncateLimit={28} text={service.name} />
            </span>
          </span>
        </label>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={twMerge(
              'flex h-6 items-center rounded border border-neutral bg-surface-neutral px-1.5 text-neutral',
              selection.selected && !disabled && 'border-brand-subtle'
            )}
          >
            <Version
              service={service}
              value={service.currentVersion}
              latest={service.currentVersion === service.versions[0]?.value}
            />
          </span>
          <Icon iconName="arrow-right" className="text-ssm text-neutral-subtle" />
          <VersionSelector
            service={service}
            value={selection.version}
            selected={selection.selected}
            disabled={disabled}
            onChange={onVersionChange}
          />
        </div>
      </li>
    </Tooltip>
  )
}
