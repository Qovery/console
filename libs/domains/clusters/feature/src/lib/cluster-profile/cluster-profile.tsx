import { type PlatformComponentConfigurationResolutionResponse } from 'qovery-typescript-axios'
import { useEffect, useMemo, useRef } from 'react'
import { CatalogVariableInput } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import { Badge, Button, EmptyState, Heading, Icon, InputToggle, Skeleton } from '@qovery/shared/ui'
import { useDebounce } from '@qovery/shared/util-hooks'
import { type CatalogVariableValue, getCatalogVariableValue } from '@qovery/shared/util-js'
import { NODE_ENV } from '@qovery/shared/util-node-env'
import { usePlatformComponentConfigurations } from '../platform-configuration/hooks/use-platform-component-configurations'
import {
  type PlatformFieldDescriptor,
  applyPlatformConfigurationDefaults,
  getFieldViolation,
  getUnmappedViolations,
  isSupportedPlatformField,
  omitEmptyValues,
  toCatalogVariableField,
} from '../platform-configuration/platform-configuration-utils'
import { ClusterProfileProvider, useClusterProfileContext } from './cluster-profile-context'
import {
  ClusterProfileItemIcon,
  ClusterProfileSidebar,
  type ClusterProfileSidebarLayer,
} from './cluster-profile-sidebar'
import { ProfileChangesBar } from './profile-changes-bar'
import { ProfileConfigurationField } from './profile-configuration-field'
import {
  fieldMatchesProfileSearch,
  filterFieldsByProfileSearch,
  matchesProfileSearch,
  normalizeProfileSearch,
} from './profile-search'
import { type ProfileComponent, type ProfileTreeItem, formatProfileLabel } from './profile-tree'

export const ENGINE_V2_PLATFORM_CONFIGURATION_FEATURE_FLAG = 'engine-v2-platform-configuration'

type ProfileTab = {
  id: string
  label: string
}

type ProfileSection = {
  id: string
  label: string
  component: ProfileComponent
  fieldKeys?: readonly string[]
  // Search restricting the displayed fields; unset when the whole component matched.
  fieldSearch?: string
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
    profileTree.find((item) => item.status !== 'disabled' && item.children?.length)?.children?.[0] ??
    profileTree.find((item) => item.children?.length)?.children?.[0]
  )
}

// Layers and components matching the search, directly or through one of their fields.
function filterProfileTree(profileTree: ProfileTreeItem[], query: string): ProfileTreeItem[] {
  if (!query) return profileTree

  return profileTree.flatMap((layer) => {
    if (matchesProfileSearch(layer, query)) return [layer]

    const children = layer.children.filter(
      (component) =>
        matchesProfileSearch(component, query) ||
        getProfileSections(component, layer).some((section) =>
          getSectionFields(section).some((field) => fieldMatchesProfileSearch(field, query))
        )
    )
    return children.length ? [{ ...layer, children }] : []
  })
}

function resolveActiveProfileSelection(profileTree: ProfileTreeItem[], requestedKey?: string) {
  const requestedComponent = findProfileComponent(profileTree, requestedKey)
  const requestedLayer = findProfileLayer(profileTree, requestedKey)
  const defaultComponent = getDefaultProfileComponent(profileTree)
  const layer =
    requestedLayer ??
    profileTree.find((item) => item.children?.some((child) => child.id === requestedComponent?.id)) ??
    profileTree.find((item) => item.children?.some((child) => child.id === defaultComponent?.id))

  return { layer, component: requestedComponent ?? layer?.children?.[0] ?? defaultComponent }
}

function getProfileSections(
  component: ProfileComponent | undefined,
  layer: ProfileTreeItem | undefined,
  fieldSearch?: string
): ProfileSection[] {
  if (!component) return []

  const sections: ProfileSection[] = [
    {
      id: component.key,
      label: formatProfileLabel(component.key),
      component,
      fieldSearch,
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
      fieldSearch,
    })
  }

  return sections
}

function getSectionFields(section: ProfileSection, preview?: PlatformComponentConfigurationResolutionResponse) {
  const fields = (preview?.fields ?? section.component.fields).filter(
    (field) => isSupportedPlatformField(field) && (!section.fieldKeys || section.fieldKeys.includes(field.key))
  )

  return section.fieldSearch ? filterFieldsByProfileSearch(fields, section.fieldSearch) : fields
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
    <div role="status" aria-label="Loading configuration" className="flex flex-col">
      {[0, 1, 2, 3, 4].map((row) => (
        <div
          key={row}
          className="flex flex-col gap-4 border-b border-neutral p-4 md:flex-row md:items-start md:justify-between"
        >
          <div className="min-w-0 flex-1">
            <Skeleton width={row === 1 ? '32%' : '40%'} height={20} />
            <div className="mt-2">
              <Skeleton width={row === 2 ? '82%' : '68%'} height={12} />
            </div>
          </div>
          <div className="w-full shrink-0 md:w-[400px]">
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProfileConfigurationSection({
  section,
  highlight,
  preview,
  profileConfig,
  clusterInputs,
  onProfileConfigChange,
  onClusterInputChange,
}: {
  section: ProfileSection
  highlight?: string
  preview?: PlatformComponentConfigurationResolutionResponse
  profileConfig: Record<string, unknown>
  clusterInputs: Record<string, string>
  onProfileConfigChange: (componentKey: string, fieldKey: string, value: unknown) => void
  onClusterInputChange: (componentKey: string, field: PlatformFieldDescriptor, value: CatalogVariableValue) => void
}) {
  const fields = getSectionFields(section, preview)
  const allRequirements = preview?.requirements ?? []
  const requirements = section.fieldSearch
    ? allRequirements.filter((requirement) => matchesProfileSearch(requirement, section.fieldSearch ?? ''))
    : allRequirements
  const violations = preview?.violations ?? []
  // Sections showing a subset of a source component's fields would surface that component's other violations.
  const unmappedViolations = section.fieldKeys
    ? []
    : getUnmappedViolations(violations, fields, profileConfig, allRequirements)

  if (section.fieldSearch && !fields.length && !requirements.length) return null

  return (
    <section className="flex flex-col">
      {unmappedViolations.length > 0 ? (
        <ul role="alert" className="flex flex-col gap-1 border-b border-neutral px-4 py-3 text-sm text-negative">
          {unmappedViolations.map((violation) => (
            <li key={`${violation.fieldPath}-${violation.code}`}>{violation.message}</li>
          ))}
        </ul>
      ) : null}
      {fields.map((field) => (
        <ProfileConfigurationField
          key={field.key}
          field={field}
          path={field.key}
          value={profileConfig[field.key]}
          violations={violations}
          highlight={highlight}
          onChange={(value) => onProfileConfigChange(section.component.key, field.key, value)}
        />
      ))}

      {requirements.length > 0 ? (
        <div className="flex flex-col">
          {requirements.map((requirement) => (
            <CatalogVariableInput
              key={requirement.key}
              booleanControl="toggle"
              field={toCatalogVariableField(requirement)}
              layout="row"
              value={getCatalogVariableValue(requirement, clusterInputs[requirement.key])}
              error={getFieldViolation(violations, requirement.key, 'clusterInputs')}
              highlight={highlight}
              onChange={(value) => onClusterInputChange(section.component.key, requirement, value)}
            />
          ))}
        </div>
      ) : null}

      {!fields.length && !requirements.length ? (
        <div className="flex flex-col items-start p-4">
          <EmptyState
            icon="circle-check"
            title={<span className="font-normal leading-5">No configuration needed for this component</span>}
            variant="positive"
            className="h-auto w-full p-8 shadow-sm"
          />
        </div>
      ) : null}
    </section>
  )
}

type ClusterProfileFeatureProps = {
  activeComponentKey?: string
  search?: string
  onActiveComponentChange?: (componentKey: string) => void
  onSearchChange?: (search: string) => void
}

export function ClusterProfileFeature(props: ClusterProfileFeatureProps) {
  return (
    <ClusterProfileProvider>
      <ClusterProfileView {...props} />
    </ClusterProfileProvider>
  )
}

function ClusterProfileView({
  activeComponentKey: requestedComponentKey,
  search = '',
  onActiveComponentChange,
  onSearchChange,
}: ClusterProfileFeatureProps) {
  const {
    organizationId,
    clusterId,
    cluster,
    templates,
    binding,
    profileTree,
    isLoading,
    isError,
    profileValues,
    clusterInputs,
    formKey,
    changeCount,
    isSaving,
    isDeploying,
    updateProfileConfig,
    updateClusterInput,
    resetChanges,
    saveChanges,
    saveAndDeployChanges,
  } = useClusterProfileContext()
  const searchQuery = normalizeProfileSearch(search)
  const visibleProfileTree = useMemo(() => filterProfileTree(profileTree, searchQuery), [profileTree, searchQuery])
  // The header keeps showing a layer when nothing matches the search.
  const { layer: activeLayer, component: activeComponent } = resolveActiveProfileSelection(
    visibleProfileTree,
    requestedComponentKey
  )
  const headerLayer = activeLayer ?? resolveActiveProfileSelection(profileTree, requestedComponentKey).layer
  // Fields are only filtered when the match comes from them, not from the layer or component itself.
  const fieldSearch =
    activeLayer &&
    activeComponent &&
    !matchesProfileSearch(activeLayer, searchQuery) &&
    !matchesProfileSearch(activeComponent, searchQuery)
      ? searchQuery
      : undefined
  const profileTabs: ProfileTab[] =
    activeLayer?.children?.map((component) => ({
      id: component.key,
      label: component.label,
    })) ?? []
  const profileSections = useMemo(
    () =>
      getProfileSections(
        activeComponent,
        // Configuration sections can source components the search filtered out of the layer.
        profileTree.find((item) => item.id === activeLayer?.id),
        fieldSearch
      ),
    [activeComponent, activeLayer?.id, fieldSearch, profileTree]
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
  const requestedComponentKeys = Object.keys(debouncedPreviewRequests)
  const componentQueriesByKey = Object.fromEntries(
    requestedComponentKeys.flatMap((componentKey, index) => {
      const query = componentQueries[index]
      return query ? [[componentKey, query]] : []
    })
  )
  const loggedSchemaResponses = useRef(new WeakSet<object>())

  useEffect(() => {
    if (NODE_ENV !== 'development') return

    if (templates && !loggedSchemaResponses.current.has(templates)) {
      loggedSchemaResponses.current.add(templates)
      console.log('[Cluster profile] Platform template catalog API response', templates)
    }

    componentQueries.forEach(({ data }) => {
      if (!data || loggedSchemaResponses.current.has(data)) return

      loggedSchemaResponses.current.add(data)
      console.log(`[Cluster profile] Component configuration API response (${data.componentKey})`, data)
    })
  }, [componentQueries, templates])

  const previewsByComponent = Object.fromEntries(
    componentQueries.flatMap((query) => (query.data ? [[query.data.componentKey, query.data]] : []))
  )
  const sidebarLayers = useMemo<ClusterProfileSidebarLayer[]>(
    () =>
      visibleProfileTree.map((item) => ({
        id: item.id,
        label: item.label,
        status: item.status,
        items: item.children.map((child) => ({
          id: child.key,
          key: child.key,
          label: child.label,
        })),
      })),
    [visibleProfileTree]
  )

  const displayedComponentKeys = [...new Set(profileSections.map((section) => section.component.key))]
  const displayedComponentKeySet = new Set(displayedComponentKeys)
  const hasResolvedConfiguration = displayedComponentKeys.every(
    (componentKey) => previewsByComponent[componentKey]?.componentKey === componentKey
  )
  const hasResolverError =
    displayedComponentKeys.some((componentKey) => componentQueriesByKey[componentKey]?.isError) ||
    componentQueries.some(
      (query) => query.isError && query.data && displayedComponentKeySet.has(query.data.componentKey)
    )
  const isConfigurationLoading = Boolean(activeComponent) && !hasResolvedConfiguration
  const isInitialResolverError = hasResolverError && !hasResolvedConfiguration
  const isBackgroundResolverError = hasResolverError && hasResolvedConfiguration

  const handleSelectSection = (sectionId: string) => {
    const firstItem = visibleProfileTree.find((item) => item.id === sectionId)?.children[0]
    onActiveComponentChange?.(firstItem?.key ?? sectionId)
  }

  const handleSelectItem = (itemId: string) => {
    onActiveComponentChange?.(itemId)
  }

  return (
    <div className="flex h-page-container min-h-0 flex-col overflow-hidden bg-background-secondary text-sm">
      <header className="flex min-h-11 items-center justify-between gap-4 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon name={IconEnum.AWS} width={20} height={20} />
          <p className="truncate font-medium text-neutral">{cluster?.name ?? 'Cluster'}</p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 items-stretch pr-4">
        <ClusterProfileSidebar
          layers={sidebarLayers}
          search={search}
          selectedSectionId={activeLayer?.id}
          selectedItemId={activeComponent?.key}
          isLoading={isLoading}
          isError={isError}
          onSearchChange={(nextSearch) => onSearchChange?.(nextSearch)}
          onSelectSection={handleSelectSection}
          onSelectItem={handleSelectItem}
        />

        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-t-xl border-x border-t border-neutral bg-background">
          <div className="flex items-start justify-between gap-4 bg-surface-neutral px-4 pb-2 pt-4">
            <div className="min-w-0">
              <Heading level={2} className="!text-base font-medium leading-6">
                {headerLayer?.label ?? 'Log infra'}
              </Heading>
              {headerLayer?.description ? (
                <p className="mt-0.5 text-xs text-neutral-subtle">{headerLayer.description}</p>
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
            aria-label={`${headerLayer?.label ?? 'Profile'} configuration`}
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
                  <ClusterProfileItemIcon />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div
            id={`${activeComponent?.key ?? 'profile'}-configuration`}
            role="tabpanel"
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <div key={formKey} className="flex min-h-full flex-col">
              {searchQuery && !isLoading && !activeComponent ? (
                <div className="p-4">
                  <EmptyState
                    icon="wave-pulse"
                    title={
                      <span className="font-normal leading-5">No settings found matching your search and filters.</span>
                    }
                    className="h-auto w-full p-8 shadow-sm"
                  />
                </div>
              ) : isInitialResolverError ? (
                <div role="alert" className="border-b border-neutral px-4 py-3 text-sm text-negative">
                  Configuration could not be checked. Refresh the page and try again.
                </div>
              ) : isConfigurationLoading ? (
                <ProfileConfigurationSkeleton />
              ) : (
                <>
                  {isBackgroundResolverError ? (
                    <div role="alert" className="border-b border-neutral px-4 py-3 text-sm text-negative">
                      Configuration could not be refreshed. The last resolved fields are still shown.
                    </div>
                  ) : null}
                  {profileSections.map((section) => (
                    <ProfileConfigurationSection
                      key={section.id}
                      section={section}
                      highlight={searchQuery}
                      preview={previewsByComponent[section.component.key]}
                      profileConfig={profileConfigs[section.component.key] ?? {}}
                      clusterInputs={resolvedClusterInputs[section.component.key] ?? {}}
                      onProfileConfigChange={updateProfileConfig}
                      onClusterInputChange={updateClusterInput}
                    />
                  ))}
                </>
              )}
              {/* Keeps the last settings reachable above the floating changes bar. */}
              {changeCount > 0 ? <div aria-hidden="true" className="h-28 shrink-0" /> : null}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4">
            <ProfileChangesBar
              changeCount={changeCount}
              isSaving={isSaving}
              isDeploying={isDeploying}
              onReset={resetChanges}
              onSave={saveChanges}
              onSaveAndDeploy={saveAndDeployChanges}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
