import { useParams } from '@tanstack/react-router'
import {
  type PlatformComponentConfigurationResolutionResponse,
  type PlatformTemplateComponentResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { CatalogVariableInput } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import { Badge, Button, Heading, Icon, InputToggle, Skeleton } from '@qovery/shared/ui'
import { useDebounce } from '@qovery/shared/util-hooks'
import { type CatalogVariableValue, getCatalogVariableValue } from '@qovery/shared/util-js'
import { useCluster } from '../hooks/use-cluster/use-cluster'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'
import { usePlatformBinding } from '../platform-configuration/hooks/use-platform-binding'
import { usePlatformComponentConfigurations } from '../platform-configuration/hooks/use-platform-component-configurations'
import {
  type PlatformFieldDescriptor,
  applyPlatformConfigurationDefaults,
  getFieldViolation,
  isPlatformScalarField,
  omitEmptyValues,
  toCatalogVariableField,
  toPlatformCloudVendor,
  toPlatformClusterMode,
  toPlatformConfigurationValue,
  updateComponentValue,
} from '../platform-configuration/platform-configuration-utils'

export const ENGINE_V2_PLATFORM_CONFIGURATION_FEATURE_FLAG = 'engine-v2-platform-configuration'

type ProfileTab = {
  id: string
  label: string
  iconName: 'scroll' | 'code'
}

type ProfileComponent = PlatformTemplateComponentResponse & {
  id: string
  label: string
}

type ProfileSection = {
  id: string
  label: string
  component: ProfileComponent
  fieldKeys?: readonly string[]
}

type ProfileTreeItem = {
  id: string
  label: string
  description?: string | null
  status: 'none' | 'disabled' | 'dot'
  state: 'disabled' | 'default'
  children?: readonly ProfileComponent[]
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
        description: layer.description,
        status: normalizedLabel === 'infrastructure' ? 'disabled' : normalizedLabel === 'gateway api' ? 'dot' : 'none',
        state: isDisabled ? 'disabled' : 'default',
        children: layer.components.map((component) => ({
          ...component,
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

function TreeStatus({ status }: { status: ProfileTreeItem['status'] }) {
  if (status === 'disabled') {
    return <Icon iconName="circle-minus" className="text-neutral-disabled" />
  }

  if (status === 'dot') {
    return <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-surface-brand-solid" />
  }

  return null
}

function getProfileSections(
  component: ProfileComponent | undefined,
  layer: ProfileTreeItem | undefined
): ProfileSection[] {
  if (!component) return []

  const sections: ProfileSection[] = [
    {
      id: component.key,
      label: formatProfileLabel(component.key),
      component,
    },
  ]

  for (const configurationSection of component.configurationSections ?? []) {
    const sourceComponent = layer?.children?.find(({ key }) => key === configurationSection.sourceComponentKey)
    if (!sourceComponent) continue

    sections.push({
      id: `${component.key}/${sourceComponent.key}`,
      label: formatProfileLabel(sourceComponent.key),
      component: sourceComponent,
      fieldKeys: configurationSection.fieldKeys,
    })
  }

  return sections
}

function getSectionFields(section: ProfileSection, preview?: PlatformComponentConfigurationResolutionResponse) {
  const fields = (preview?.fields ?? section.component.fields).filter(isPlatformScalarField)
  if (!section.fieldKeys) return fields

  return fields.filter((field) => section.fieldKeys?.includes(field.key))
}

function RequirementStatus({ status }: { status: 'MISSING' | 'READY' }) {
  return status === 'MISSING' ? (
    <Badge size="sm" variant="surface" color="yellow">
      Action required
    </Badge>
  ) : null
}

function ProfileConfigurationSkeleton() {
  return (
    <div role="status" aria-label="Loading configuration" className="flex flex-col gap-4 p-4">
      <Skeleton width="28%" height={20} />
      <Skeleton width="100%" height={64} />
      <Skeleton width="100%" height={64} />
      <Skeleton width="100%" height={64} />
    </div>
  )
}

function ProfileConfigurationSection({
  section,
  preview,
  profileConfig,
  clusterInputs,
  onProfileConfigChange,
  onClusterInputChange,
}: {
  section: ProfileSection
  preview?: PlatformComponentConfigurationResolutionResponse
  profileConfig: Record<string, unknown>
  clusterInputs: Record<string, string>
  onProfileConfigChange: (componentKey: string, field: PlatformFieldDescriptor, value: CatalogVariableValue) => void
  onClusterInputChange: (componentKey: string, field: PlatformFieldDescriptor, value: CatalogVariableValue) => void
}) {
  const fields = getSectionFields(section, preview)
  const requirements = preview?.requirements ?? []
  const violations = preview?.violations ?? []

  return (
    <section className="flex flex-col gap-3 border-b border-neutral p-4 last:border-b-0">
      <div>
        <Heading level={3}>{section.label}</Heading>
        {section.component.description ? (
          <p className="mt-1 text-sm text-neutral-subtle">{section.component.description}</p>
        ) : null}
      </div>

      {fields.map((field) => (
        <CatalogVariableInput
          key={field.key}
          booleanControl="checkbox"
          field={toCatalogVariableField(field)}
          value={getCatalogVariableValue(field, profileConfig[field.key])}
          error={getFieldViolation(violations, field.key)}
          onChange={(value) => onProfileConfigChange(section.component.key, field, value)}
        />
      ))}

      {requirements.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-neutral pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Heading level={3}>Cluster inputs</Heading>
              <p className="mt-1 text-ssm text-neutral-subtle">
                Values required from this cluster for the selected configuration.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {requirements.map((requirement) => (
                <RequirementStatus key={requirement.key} status={requirement.status} />
              ))}
            </div>
          </div>
          {requirements.map((requirement) => (
            <CatalogVariableInput
              key={requirement.key}
              booleanControl="checkbox"
              field={toCatalogVariableField(requirement)}
              value={getCatalogVariableValue(requirement, clusterInputs[requirement.key])}
              error={getFieldViolation(violations, requirement.key, 'clusterInputs')}
              onChange={(value) => onClusterInputChange(section.component.key, requirement, value)}
            />
          ))}
        </div>
      ) : null}

      {!fields.length && !requirements.length ? (
        <p className="text-sm text-neutral-subtle">This component does not require any configuration.</p>
      ) : null}
    </section>
  )
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
  const { clusterId = '' } = useParams({ strict: false })
  const [search, setSearch] = useState('')
  const [profileValues, setProfileValues] = useState<Record<string, Record<string, unknown>>>({})
  const [clusterInputs, setClusterInputs] = useState<Record<string, Record<string, string>>>({})
  const {
    data: cluster,
    isError: isClusterError,
    isLoading: isClusterLoading,
  } = useCluster({
    organizationId,
    clusterId,
  })
  const clusterMode = toPlatformClusterMode(cluster?.kubernetes)
  const cloudProvider = toPlatformCloudVendor(cluster?.cloud_provider)
  const {
    data: templates,
    isError: isTemplateError,
    isLoading: isTemplateLoading,
  } = usePlatformTemplates({
    organizationId,
    clusterMode,
    cloudProvider,
    enabled: Boolean(clusterMode && cloudProvider),
  })
  const {
    data: binding,
    isError: isBindingError,
    isLoading: isBindingLoading,
  } = usePlatformBinding({ organizationId, clusterId })
  const selectedTemplate = useMemo(
    () =>
      templates?.find(
        (template) => template.key === binding?.templateKey && template.version === binding?.templateVersion
      ) ?? templates?.[0],
    [binding?.templateKey, binding?.templateVersion, templates]
  )
  const profileTree = useMemo(() => getProfileTree(selectedTemplate), [selectedTemplate])
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
  const profileSections = useMemo(
    () => getProfileSections(activeComponent, activeLayer),
    [activeComponent, activeLayer]
  )
  const profileConfigs = useMemo(
    () =>
      Object.fromEntries(
        profileSections.map((section) => {
          const persistedValues = binding?.managedConfig?.[section.component.key] ?? {}
          const localValues = profileValues[section.component.key] ?? {}
          return [
            section.component.key,
            applyPlatformConfigurationDefaults(section.component.fields, { ...persistedValues, ...localValues }),
          ]
        })
      ),
    [binding?.managedConfig, profileSections, profileValues]
  )
  const resolvedClusterInputs = useMemo(
    () =>
      Object.fromEntries(
        profileSections.map((section) => [
          section.component.key,
          { ...binding?.customerProvidedInputs?.[section.component.key], ...clusterInputs[section.component.key] },
        ])
      ),
    [binding?.customerProvidedInputs, clusterInputs, profileSections]
  )
  const previewRequests = useMemo(
    () =>
      Object.fromEntries(
        profileSections.map((section) => [
          section.component.key,
          {
            profileConfig: omitEmptyValues(profileConfigs[section.component.key] ?? {}),
            clusterInputs: resolvedClusterInputs[section.component.key] ?? {},
            componentOutputs: {},
          },
        ])
      ),
    [profileConfigs, profileSections, resolvedClusterInputs]
  )
  const debouncedPreviewRequests = useDebounce(previewRequests, 300)
  const componentQueries = usePlatformComponentConfigurations({
    organizationId,
    clusterId,
    requests: debouncedPreviewRequests,
    enabled: Boolean(profileSections.length),
  })
  const previewsByComponent = Object.fromEntries(
    componentQueries.flatMap((query) => (query.data ? [[query.data.componentKey, query.data]] : []))
  )

  const normalizedSearch = search.trim().toLowerCase()
  const visibleTree = normalizedSearch
    ? profileTree.filter(
        (item) =>
          item.label.toLowerCase().includes(normalizedSearch) ||
          item.children?.some((child) => child.label.toLowerCase().includes(normalizedSearch))
      )
    : profileTree

  const updateProfileConfig = (componentKey: string, field: PlatformFieldDescriptor, value: CatalogVariableValue) => {
    setProfileValues((currentValues) =>
      updateComponentValue(currentValues, componentKey, field.key, toPlatformConfigurationValue(field, value))
    )
  }

  const updateClusterInput = (componentKey: string, field: PlatformFieldDescriptor, value: CatalogVariableValue) => {
    setClusterInputs((currentValues) => updateComponentValue(currentValues, componentKey, field.key, String(value)))
  }

  const isLoading = isClusterLoading || isTemplateLoading || isBindingLoading
  const isError = isClusterError || isTemplateError || isBindingError
  const isResolving = componentQueries.some((query) => query.isFetching)
  const hasResolverError = componentQueries.some((query) => query.isError)
  const activePreview = activeComponent ? previewsByComponent[activeComponent.key] : undefined
  const isConfigurationLoading =
    Boolean(activeComponent) && (isResolving || activePreview?.componentKey !== activeComponent?.key)

  return (
    <div className="min-h-[calc(100dvh-8rem)] bg-background-secondary text-sm">
      <header className="flex min-h-11 items-center justify-between gap-4 bg-surface-neutral px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon name={IconEnum.AWS} width={20} height={20} />
          <p className="truncate font-medium text-neutral">{cluster?.name ?? 'Cluster'}</p>
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
              {activeLayer?.description ? (
                <p className="mt-0.5 text-xs text-neutral-subtle">{activeLayer.description}</p>
              ) : null}
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
            {hasResolverError ? (
              <div className="border-b border-neutral px-4 py-3 text-sm text-negative">
                Configuration could not be checked. Refresh the page and try again.
              </div>
            ) : isConfigurationLoading ? (
              <ProfileConfigurationSkeleton />
            ) : (
              profileSections.map((section) => (
                <ProfileConfigurationSection
                  key={section.id}
                  section={section}
                  preview={previewsByComponent[section.component.key]}
                  profileConfig={profileConfigs[section.component.key] ?? {}}
                  clusterInputs={resolvedClusterInputs[section.component.key] ?? {}}
                  onProfileConfigChange={updateProfileConfig}
                  onClusterInputChange={updateClusterInput}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
