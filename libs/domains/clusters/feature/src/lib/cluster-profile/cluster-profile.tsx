import { type PlatformTemplateSummaryResponse } from 'qovery-typescript-axios'
import { type ReactNode, useState } from 'react'
import { IconEnum } from '@qovery/shared/enums'
import { Button, Heading, Icon, InputToggle } from '@qovery/shared/ui'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'

export const ENGINE_V2_PLATFORM_CONFIGURATION_FEATURE_FLAG = 'engine-v2-platform-configuration'

type ProfileTab = {
  id: string
  label: string
  iconName: 'scroll' | 'code'
}

type ConfigurationRowProps = {
  label: string
  description: string
  children: ReactNode
}

type ProfileTreeItem = {
  id: string
  label: string
  status: 'none' | 'disabled' | 'dot'
  state: 'disabled' | 'default'
  children?: readonly { id: string; key: string; label: string }[]
}

function formatProfileLabel(value: string) {
  const label = value.replace(/[-_]+/g, ' ').trim().toLowerCase()
  return label ? `${label[0].toUpperCase()}${label.slice(1)}` : value
}

function getProfileTree(template: PlatformTemplateSummaryResponse | undefined): ProfileTreeItem[] {
  return (
    template?.layers.map((layer) => {
      const label = formatProfileLabel(layer.key)
      const normalizedLabel = label.toLowerCase()
      const isDisabled = normalizedLabel === 'infrastructure' || normalizedLabel === 'qovery stack'

      return {
        id: layer.key,
        label,
        status: normalizedLabel === 'infrastructure' ? 'disabled' : normalizedLabel === 'gateway api' ? 'dot' : 'none',
        state: isDisabled ? 'disabled' : 'default',
        children: layer.components.map((component) => ({
          id: `${layer.key}/${component.key}`,
          key: component.key,
          label: formatProfileLabel(component.key),
        })),
      }
    }) ?? []
  )
}

function getComponentIconName(componentKey: string): ProfileTab['iconName'] {
  return componentKey.toLowerCase() === 'loki' ? 'scroll' : 'code'
}

function findProfileComponent(profileTree: ProfileTreeItem[], requestedKey?: string) {
  if (!requestedKey) return undefined

  return profileTree
    .flatMap((item) => item.children ?? [])
    .find((component) => component.key === requestedKey || component.id === requestedKey)
}

function findProfileLayer(profileTree: ProfileTreeItem[], requestedKey?: string) {
  if (!requestedKey) return undefined

  return profileTree.find((item) => item.id === requestedKey)
}

function getDefaultProfileComponent(profileTree: ProfileTreeItem[]) {
  return (
    profileTree.find((item) => item.label.toLowerCase() === 'log infra')?.children?.[0] ??
    profileTree.find((item) => item.children?.length)?.children?.[0]
  )
}

const RESOURCE_ROWS = [
  {
    label: 'Resource profile',
    description:
      'How are CPU/memory budget applied to the active Loki workloads. CHART_DEFAULT will keep the chart behavior, while the presets apply Qovery’s versioned budgets.',
    options: ['CHART_DEFAULT', 'SMALL', 'MEDIUM', 'LARGE'],
  },
  {
    label: 'Storage',
    description: 'Storage backend used by Loki.',
    options: ['PVC', 's3', 'gcs', 'azure'],
  },
]

function ConfigurationRow({ label, description, children }: ConfigurationRowProps) {
  return (
    <div className="flex flex-col items-start gap-4 border-b border-neutral p-4 last:border-b-0 md:flex-row md:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral">{label}</p>
        <p className="text-sm text-neutral-subtle">{description}</p>
      </div>
      <div className="w-full shrink-0 md:max-w-[400px] md:flex-1">{children}</div>
    </div>
  )
}

function ConfigurationSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-visible:ring-brand-strong/30 h-10 w-full appearance-none rounded border border-neutral bg-surface-neutral px-3 pr-9 text-sm text-neutral outline-none transition-colors focus-visible:border-brand-strong focus-visible:ring-2"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <Icon
        iconName="angle-down"
        iconStyle="solid"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-subtle"
      />
    </div>
  )
}

function ResourceRows({
  values,
  onChange,
}: {
  values: Record<string, string>
  onChange: (label: string, value: string) => void
}) {
  return (
    <div className="flex flex-col">
      {RESOURCE_ROWS.map((row) => (
        <ConfigurationRow key={row.label} label={row.label} description={row.description}>
          <ConfigurationSelect
            label={row.label}
            options={row.options}
            value={values[row.label] ?? row.options[0]}
            onChange={(value) => onChange(row.label, value)}
          />
        </ConfigurationRow>
      ))}
    </div>
  )
}

function LokiConfiguration({
  values,
  onChange,
}: {
  values: Record<string, string>
  onChange: (label: string, value: string) => void
}) {
  const [retentionPeriod, setRetentionPeriod] = useState('12')
  const [highAvailability, setHighAvailability] = useState(true)

  return (
    <div className="flex flex-col">
      <ConfigurationRow label="Retention period" description="Whole number of weeks to retain Loki logs.">
        <input
          aria-label="Retention period"
          type="number"
          min="1"
          value={retentionPeriod}
          onChange={(event) => setRetentionPeriod(event.target.value)}
          className="focus-visible:ring-brand-strong/30 h-10 w-full rounded border border-neutral bg-surface-neutral px-3 text-sm text-neutral outline-none transition-colors focus-visible:border-brand-strong focus-visible:ring-2"
        />
      </ConfigurationRow>
      <ConfigurationRow
        label="High availability"
        description="Uses Loki simple-scalable mode and requires object storage."
      >
        <InputToggle
          small
          value={highAvailability}
          onChange={setHighAvailability}
          ariaLabel="High availability"
          className="md:justify-end"
        />
      </ConfigurationRow>
      <ResourceRows values={values} onChange={onChange} />
    </div>
  )
}

function TreeStatus({ status }: { status: ProfileTreeItem['status'] }) {
  if (status === 'disabled') {
    return <Icon iconName="circle-minus" className="text-neutral-disabled" />
  }

  if (status === 'dot') {
    return <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-surface-brand-solid" />
  }

  return null
}

type ClusterProfileFeatureProps = {
  organizationId: string
  activeComponentKey?: string
  onActiveComponentChange?: (componentKey: string) => void
}

export function ClusterProfileFeature({
  organizationId,
  activeComponentKey: requestedComponentKey,
  onActiveComponentChange,
}: ClusterProfileFeatureProps) {
  const [search, setSearch] = useState('')
  const [values, setValues] = useState<Record<string, string>>({
    'Resource profile': 'CHART_DEFAULT',
    Storage: 'PVC',
  })
  const { data: templates, isError, isLoading } = usePlatformTemplates({ organizationId })
  const profileTree = getProfileTree(templates?.[0])
  const requestedComponent = findProfileComponent(profileTree, requestedComponentKey)
  const requestedLayer = findProfileLayer(profileTree, requestedComponentKey)
  const defaultComponent = getDefaultProfileComponent(profileTree)
  const activeLayer =
    requestedLayer ??
    profileTree.find((item) => item.children?.some((child) => child.id === requestedComponent?.id)) ??
    profileTree.find((item) => item.children?.some((child) => child.id === defaultComponent?.id))
  const activeComponent = requestedComponent ?? activeLayer?.children?.[0] ?? defaultComponent
  const profileTabs: ProfileTab[] =
    activeLayer?.children?.map((component) => ({
      id: component.key,
      label: component.label,
      iconName: getComponentIconName(component.key),
    })) ?? []

  const normalizedSearch = search.trim().toLowerCase()
  const visibleTree = normalizedSearch
    ? profileTree.filter(
        (item) =>
          item.label.toLowerCase().includes(normalizedSearch) ||
          item.children?.some((child) => child.label.toLowerCase().includes(normalizedSearch))
      )
    : profileTree

  const updateValue = (label: string, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [label]: value }))
  }

  return (
    <div className="min-h-[calc(100dvh-8rem)] bg-background-secondary text-sm">
      <header className="flex min-h-11 items-center justify-between gap-4 bg-surface-neutral px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon name={IconEnum.AWS} width={20} height={20} />
          <p className="truncate font-medium text-neutral">Qovery infra engines prod static ip</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" color="neutral" size="sm" disabled>
            Deploy
          </Button>
        </div>
      </header>

      <div className="flex min-h-[calc(100dvh-10.75rem)] items-stretch pr-4">
        <aside className="hidden w-[272px] shrink-0 flex-col bg-background-secondary lg:flex">
          <div className="p-3">
            <div className="relative flex items-center">
              <Icon iconName="magnifying-glass" className="absolute left-2 text-xs text-neutral-subtle" />
              <input
                aria-label="Search layers"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search..."
                className="focus-visible:ring-brand-strong/30 h-7 w-full rounded-md border border-neutral bg-surface-neutral pl-7 pr-2 text-xs text-neutral outline-none placeholder:text-neutral-subtle focus-visible:border-brand-strong focus-visible:ring-2"
              />
            </div>
          </div>

          <div className="flex h-8 items-center px-3">
            <p className="font-medium text-neutral">Layers</p>
          </div>

          <nav aria-label="Infrastructure layers" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4">
            {isLoading ? <p className="px-2 py-1 text-xs text-neutral-subtle">Loading layers...</p> : null}
            {isError ? <p className="px-2 py-1 text-xs text-negative">Unable to load layers.</p> : null}
            {!isLoading && !isError && visibleTree.length === 0 ? (
              <p className="px-2 py-1 text-xs text-neutral-subtle">No layers available.</p>
            ) : null}
            {visibleTree.map((item) => {
              const isActiveLayer = item.id === activeLayer?.id
              const selectComponent = item.children?.[0]?.key ?? item.id

              return (
                <div key={item.id} className={isActiveLayer ? 'rounded bg-surface-neutral-component' : undefined}>
                  <div className="flex items-center justify-between gap-2 rounded px-3 py-1 text-neutral">
                    <button
                      type="button"
                      aria-current={isActiveLayer ? 'page' : undefined}
                      onClick={() => onActiveComponentChange?.(selectComponent)}
                      className="focus-visible:ring-brand-strong flex min-w-0 flex-1 items-center gap-1.5 text-left outline-none focus-visible:ring-2"
                    >
                      <Icon
                        iconName="layer-group"
                        className={item.state === 'disabled' ? 'text-neutral-disabled' : 'text-neutral-subtle'}
                      />
                      <span className={item.state === 'disabled' ? 'truncate text-neutral-disabled' : 'truncate'}>
                        {item.label}
                      </span>
                    </button>
                    <TreeStatus status={item.status} />
                  </div>
                  {item.children && (
                    <div className="flex flex-col">
                      {item.children.map((child, childIndex) => {
                        const childTextClass =
                          item.state === 'disabled'
                            ? 'text-neutral-disabled'
                            : child.key === activeComponent?.key
                              ? 'text-neutral'
                              : 'text-neutral-subtle'

                        return (
                          <div
                            key={child.id}
                            className="flex h-7 min-w-0 items-center gap-1.5 overflow-hidden rounded px-3"
                          >
                            <span className="relative h-7 w-3.5 shrink-0">
                              <span
                                className={`absolute left-1/2 top-0 h-7 -translate-x-1/2 border-l ${
                                  isActiveLayer
                                    ? 'border-neutral-invert'
                                    : item.state === 'disabled'
                                      ? 'border-neutral'
                                      : 'border-neutral-component'
                                }`}
                              />
                            </span>
                            <button
                              type="button"
                              aria-current={child.key === activeComponent?.key ? 'page' : undefined}
                              onClick={() => onActiveComponentChange?.(child.key)}
                              className={`focus-visible:ring-brand-strong flex min-w-0 flex-1 items-center gap-1.5 py-1 text-left outline-none focus-visible:ring-2 ${childTextClass}`}
                            >
                              <Icon iconName="wrench" className="shrink-0 text-xs" />
                              <span className="truncate">{child.label}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2 text-neutral">
              <span>Qovery operator</span>
              <Icon iconName="circle-check" className="text-positive" />
            </div>
            <Button variant="outline" color="neutral" size="xs" iconOnly aria-label="Qovery operator settings">
              <Icon iconName="gear" />
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden rounded-t-xl border-x border-t border-neutral bg-background">
          <div className="flex items-start justify-between gap-4 bg-surface-neutral px-4 pb-2 pt-4">
            <div className="min-w-0">
              <Heading level={2} className="!text-base font-medium leading-6">
                {activeLayer?.label ?? 'Log infra'}
              </Heading>
              <p className="mt-0.5 text-xs text-neutral-subtle">
                {activeLayer?.label.toLowerCase() === 'log infra'
                  ? 'Collects logs from everything running on this cluster and makes them searchable in Qovery'
                  : 'Configure the components running on this cluster'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <InputToggle small value disabled ariaLabel="Enable log infrastructure" className="mt-0.5" />
              <Button variant="outline" color="neutral" size="sm" disabled>
                <Icon iconName="arrow-rotate-left" />
                Restore all
              </Button>
            </div>
          </div>

          <div
            role="tablist"
            aria-label={`${activeLayer?.label ?? 'Profile'} configuration`}
            className="flex items-center gap-4 border-b border-neutral bg-surface-neutral px-4"
          >
            {profileTabs.map((tab) => {
              const isActive = tab.id === activeComponent?.key
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab.id}-configuration`}
                  onClick={() => onActiveComponentChange?.(tab.id)}
                  className={`focus-visible:ring-brand-strong relative flex items-center gap-1.5 py-3 font-medium outline-none focus-visible:ring-2 focus-visible:ring-inset ${
                    isActive
                      ? 'text-brand after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-surface-brand-solid'
                      : 'text-neutral-subtle hover:text-neutral'
                  }`}
                >
                  <Icon iconName={tab.iconName} className="text-xs" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div id={`${activeComponent?.key ?? 'profile'}-configuration`} role="tabpanel" className="min-h-[480px]">
            {activeComponent?.key.toLowerCase() === 'loki' ? (
              <LokiConfiguration values={values} onChange={updateValue} />
            ) : (
              <ResourceRows values={values} onChange={updateValue} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
