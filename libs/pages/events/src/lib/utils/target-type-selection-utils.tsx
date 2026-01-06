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
