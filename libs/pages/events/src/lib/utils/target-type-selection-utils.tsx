import { OrganizationEventApi, OrganizationEventTargetType } from 'qovery-typescript-axios'
import { DecodedValueMap } from 'use-query-params'
import { HierarchicalFilterResult, HierarchicalMenuItem, NavigationLevel, SelectedItem } from '@qovery/shared/ui'
import { queryParamsValues } from '../feature/page-general-feature/page-general-feature'

// Global cache to store selected options
const SELECTED_OPTIONS_BY_KEY = new Map<string, HierarchicalMenuItem>()

const SERVICE_TARGET_TYPES: ReadonlySet<string> = new Set([
  'APPLICATION',
  'DATABASE',
  'CONTAINER',
  'HELM',
  'JOB',
  'TERRAFORM',
])

function getServiceTypeSelected(selectedItems: SelectedItem[]): string | undefined {
  return selectedItems.find((selectedItem) => {
    return selectedItem.filterKey === 'target_type' && SERVICE_TARGET_TYPES.has(selectedItem.item.value)
  })?.item?.value
}

function getProjectIdSelected(selectedItems: SelectedItem[]): string | undefined {
  return selectedItems.find((selectedItem) => {
    return selectedItem.filterKey === 'project_id'
  })?.item?.value
}

function getEnvironmentIdSelected(selectedItems: SelectedItem[]): string | undefined {
  return selectedItems.find((selectedItem) => {
    return selectedItem.filterKey === 'environment_id'
  })?.item?.value
}

function getTargetIdSelected(selectedItems: SelectedItem[]): string | undefined {
  return selectedItems.find((selectedItem) => selectedItem.filterKey === 'target_id')?.item?.value
}

async function fetchTargetProjects(
  organizationId: string,
  targetTypeToSearch: OrganizationEventTargetType,
  queryParams: DecodedValueMap<typeof queryParamsValues>
): Promise<HierarchicalMenuItem[]> {
  return fetchTargetsAsync(organizationId, targetTypeToSearch, queryParams, 'projectId')
}

async function fetchTargetEnvironments(
  organizationId: string,
  projectId: string,
  targetTypeToSearch: OrganizationEventTargetType,
  queryParams: DecodedValueMap<typeof queryParamsValues>
): Promise<HierarchicalMenuItem[]> {
  return fetchTargetsAsync(organizationId, targetTypeToSearch, queryParams, 'environmentId', projectId)
}

async function fetchTargetsAsync(
  organizationId: string,
  targetTypeToSearch: OrganizationEventTargetType,
  queryParams: DecodedValueMap<typeof queryParamsValues>,
  optionIdKey: string,
  projectId?: string,
  environmentId?: string
): Promise<HierarchicalMenuItem[]> {
  const eventApi = new OrganizationEventApi()
  queryParams.eventType ??= undefined
  queryParams.origin ??= undefined
  queryParams.triggeredBy ??= undefined
  queryParams.fromTimestamp ??= undefined
  queryParams.toTimestamp ??= undefined
  const { eventType, origin, triggeredBy, toTimestamp, fromTimestamp } = queryParams

  // For project and environments, we need to add the targetFetchLevel
  let targetFetchLevel: OrganizationEventTargetType | undefined = undefined
  if (optionIdKey === 'projectId') {
    targetFetchLevel = OrganizationEventTargetType.PROJECT
  } else if (optionIdKey === 'environmentId') {
    targetFetchLevel = OrganizationEventTargetType.ENVIRONMENT
  }

  const response = await eventApi.getOrganizationEventTargets(
    organizationId,
    fromTimestamp,
    toTimestamp,
    eventType,
    targetTypeToSearch,
    triggeredBy,
    origin,
    projectId,
    environmentId,
    targetFetchLevel
  )

  const targets = response.data.targets

  // If for any reason, targets is null then return with empty array
  if (!targets) {
    return []
  }

  // Return the targets
  return targets.map((target) => {
    return {
      value: target.id ?? '',
      name: target.name ?? '',
    }
  })
}

export async function computeMenusToDisplay(
  organizationId: string,
  selectedItems: SelectedItem[],
  // TODO (qov-1236) If no need for auto-fetch request param when they are set (to have tsarget names), to be removed
  navigationStack: NavigationLevel[],
  queryParams?: DecodedValueMap<typeof queryParamsValues>
): Promise<HierarchicalFilterResult | null> {
  // Early return if queryParams not set
  if (queryParams === undefined) {
    return null
  }

  const serviceTypeSelected = getServiceTypeSelected(selectedItems)
  const projectIdSelected = getProjectIdSelected(selectedItems)
  const environmentIdSelected = getEnvironmentIdSelected(selectedItems)
  const targetIdSelected = getTargetIdSelected(selectedItems)

  if (serviceTypeSelected) {
    // Fetch projects if no project selected
    if (!projectIdSelected) {
      const targetTypeToSearch = serviceTypeSelected as OrganizationEventTargetType
      const projects = await fetchTargetProjects(organizationId, targetTypeToSearch, queryParams)
      return {
        items: projects.map((p) => {
          return {
            value: p.value,
            name: p.name,
          }
        }),
        shouldDrillDown: false,
        filterKey: 'project_id',
      }
    }
    // Fetch environments if no environment selected
    if (!environmentIdSelected) {
      const targetTypeToSearch = serviceTypeSelected as OrganizationEventTargetType
      const environments = await fetchTargetEnvironments(
        organizationId,
        projectIdSelected,
        targetTypeToSearch,
        queryParams
      )
      return {
        items: environments.map((p) => {
          return {
            value: p.value,
            name: p.name,
          }
        }),
        shouldDrillDown: false,
        filterKey: 'environment_id',
      }
    }

    if (!targetIdSelected) {
      const targetTypeToSearch = serviceTypeSelected as OrganizationEventTargetType
      const environments = await fetchTargetsAsync(
        organizationId,
        targetTypeToSearch,
        queryParams,
        '',
        projectIdSelected,
        environmentIdSelected
      )
      return {
        items: environments.map((p) => {
          return {
            value: p.value,
            name: p.name,
          }
        }),
        shouldDrillDown: false,
        filterKey: 'target_id',
      }
    }

    // All service hierarchical menu items have been selected
    return null
  }

  return null
}

export interface InitializationData {
  selectedItems: SelectedItem[]
  navigationStack: NavigationLevel[]
  level: number
}

export async function initializeSelectedItemsFromQueryParams(
  organizationId: string,
  initialData: HierarchicalMenuItem[],
  rootFilterKey: string,
  queryParams: DecodedValueMap<typeof queryParamsValues>
): Promise<InitializationData> {
  const selectedItems: SelectedItem[] = []
  const navigationStack: NavigationLevel[] = [
    { items: [{ value: 'ALL', name: 'All' }, ...initialData], filterKey: rootFilterKey },
  ]
  let level = 0

  const targetTypeValue = queryParams.targetType
  const projectIdValue = queryParams.projectId
  const environmentIdValue = queryParams.environmentId
  const targetIdValue = queryParams.targetId

  // If no target type, nothing to initialize
  if (!targetTypeValue) {
    return { selectedItems, navigationStack, level }
  }

  // Check if it's a service type
  const isServiceType = SERVICE_TARGET_TYPES.has(targetTypeValue)
  if (!isServiceType) {
    // For non-service types, just add the target type
    const targetTypeItem = initialData.find((item) => item.value === targetTypeValue)
    if (targetTypeItem) {
      selectedItems.push({ filterKey: 'target_type', item: targetTypeItem })
    }
    return { selectedItems, navigationStack, level }
  }

  // Add target type
  const targetTypeItem = initialData.find((item) => item.value === targetTypeValue)
  if (!targetTypeItem) {
    return { selectedItems, navigationStack, level }
  }
  selectedItems.push({ filterKey: 'target_type', item: targetTypeItem })

  // Always fetch projects for service types (to show available options at level 1)
  const projects = await fetchTargetProjects(
    organizationId,
    targetTypeValue as OrganizationEventTargetType,
    queryParams
  )

  // Add projects to navigation stack
  navigationStack.push({ items: projects, filterKey: 'project_id' })
  level = 1

  // If projectId is provided, find it and add to selectedItems
  if (projectIdValue) {
    const projectItem = projects.find((p) => p.value === projectIdValue)

    if (projectItem) {
      selectedItems.push({ filterKey: 'project_id', item: projectItem })

      // Fetch environments (to show available options at level 2)
      const environments = await fetchTargetEnvironments(
        organizationId,
        projectIdValue,
        targetTypeValue as OrganizationEventTargetType,
        queryParams
      )

      // Add environments to navigation stack
      navigationStack.push({ items: environments, filterKey: 'environment_id' })
      level = 2

      // If environmentId is provided, find it and add to selectedItems
      if (environmentIdValue) {
        const environmentItem = environments.find((e) => e.value === environmentIdValue)

        if (environmentItem) {
          selectedItems.push({ filterKey: 'environment_id', item: environmentItem })

          // Fetch targets (to show available options at level 3)
          const targets = await fetchTargetsAsync(
            organizationId,
            targetTypeValue as OrganizationEventTargetType,
            queryParams,
            '',
            projectIdValue,
            environmentIdValue
          )

          // Add targets to navigation stack
          navigationStack.push({ items: targets, filterKey: 'target_id' })
          level = 3

          // If targetId is provided, find it and add to selectedItems
          if (targetIdValue) {
            const targetItem = targets.find((t) => t.value === targetIdValue)

            if (targetItem) {
              selectedItems.push({ filterKey: 'target_id', item: targetItem })
            }
          }
        }
      }
    }
  }

  return { selectedItems, navigationStack, level }
}

export function computeSelectedItemsFromFilter(
  filter: { key?: string; value?: string }[],
  currentSelectedItems: SelectedItem[]
): SelectedItem[] {
  console.log('[computeSelectedItemsFromFilter] Computing from filter', { filter, currentSelectedItems })

  // Extract hierarchical filter values
  const targetTypeFilter = filter.find((f) => f.key === 'target_type')
  const projectIdFilter = filter.find((f) => f.key === 'project_id')
  const environmentIdFilter = filter.find((f) => f.key === 'environment_id')
  const targetIdFilter = filter.find((f) => f.key === 'target_id')

  // Build new selected items based on what's still in the filter
  const newSelectedItems: SelectedItem[] = []

  for (const selected of currentSelectedItems) {
    let filterValue: string | undefined

    switch (selected.filterKey) {
      case 'target_type':
        filterValue = targetTypeFilter?.value
        break
      case 'project_id':
        filterValue = projectIdFilter?.value
        break
      case 'environment_id':
        filterValue = environmentIdFilter?.value
        break
      case 'target_id':
        filterValue = targetIdFilter?.value
        break
    }

    if (filterValue && filterValue !== 'ALL') {
      newSelectedItems.push(selected)
    } else {
      // Stop at first removed filter (hierarchical)
      break
    }
  }

  console.log('[computeSelectedItemsFromFilter] Result:', newSelectedItems)
  return newSelectedItems
}

export function computeDisplayByLabel(filterKey: string, selectedItem?: SelectedItem): string {
  switch (filterKey) {
    case 'target_type':
      return 'Target type'
    case 'project_id':
      return 'Project'
    case 'environment_id':
      return 'Environment'
    case 'target_id': {
      if (selectedItem) {
        return selectedItem.item.name
      }
    }
  }
  // Should never happen
  return 'Unknown'
}
