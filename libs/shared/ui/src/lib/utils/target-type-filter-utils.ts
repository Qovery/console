import { type OrganizationEventApi, type OrganizationEventTargetType } from 'qovery-typescript-axios'
import { type DecodedValueMap } from 'use-query-params'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

// Represents the current state in the hierarchical navigation
export interface HierarchicalFilterState {
  targetType?: OrganizationEventTargetType
  projectId?: string
  projectName?: string
  environmentId?: string
  environmentName?: string
  targetId?: string
  targetName?: string
}

// Represents a single navigation level
export interface FilterLevel {
  key: 'targetType' | 'projectId' | 'environmentId' | 'targetId' // What this level selects
  title: string // Display title (e.g., "Select Project")
  items: FilterLevelItem[] // Available options
  hasSearch: boolean // Enable search
}

export interface FilterLevelItem {
  id: string // The actual value (e.g., project ID, target type enum)
  label: string // Display name
}

// Service target types that require project → environment → service hierarchy
const SERVICE_TARGET_TYPES: ReadonlySet<OrganizationEventTargetType> = new Set([
  'APPLICATION',
  'DATABASE',
  'CONTAINER',
  'HELM',
  'JOB',
  'TERRAFORM',
])

/**
 * Check if a target type is a service type (requires project/environment hierarchy)
 */
export function isServiceType(targetType?: OrganizationEventTargetType): boolean {
  return targetType ? SERVICE_TARGET_TYPES.has(targetType) : false
}

/**
 * Check if the target type is ENVIRONMENT (requires project → environment hierarchy)
 */
export function isEnvironmentType(targetType?: OrganizationEventTargetType): boolean {
  return targetType === 'ENVIRONMENT'
}

/**
 * Check if we're at a final selection (leaf node)
 */
export function isFinalSelection(state: HierarchicalFilterState): boolean {
  const { targetType, projectId, environmentId, targetId } = state

  if (!targetType) {
    return false
  }

  // Service types need project + environment + targetId
  if (isServiceType(targetType)) {
    return Boolean(projectId && environmentId && targetId)
  }

  // ENVIRONMENT type needs project + targetId
  if (isEnvironmentType(targetType)) {
    return Boolean(projectId && targetId)
  }

  // Other types just need targetId
  return Boolean(targetId)
}

/**
 * Convert hierarchical state to query params
 */
export function stateToQueryParams(state: HierarchicalFilterState): Record<string, any> {
  return {
    targetType: state.targetType,
    targetId: state.targetId,
    projectId: state.projectId,
    environmentId: state.environmentId,
  }
}

/**
 * Format target type name for display
 */
function formatTargetTypeName(targetType: string): string {
  return upperCaseFirstLetter(targetType)?.replace(/_/g, ' ') ?? targetType
}

/**
 * Fetch targets from API
 */
async function fetchTargets(
  organizationId: string,
  eventApi: OrganizationEventApi,
  queryParams: DecodedValueMap<any>,
  targetTypeToSearch: OrganizationEventTargetType,
  targetFetchLevel?: 'PROJECT' | 'ENVIRONMENT'
): Promise<FilterLevelItem[]> {
  const { eventType, origin, triggeredBy, toTimestamp, fromTimestamp, projectId, environmentId } = queryParams

  try {
    const response = await eventApi.getOrganizationEventTargets(
      organizationId,
      fromTimestamp,
      toTimestamp,
      eventType ?? undefined,
      targetTypeToSearch,
      triggeredBy ?? undefined,
      origin ?? undefined,
      projectId ?? undefined,
      environmentId ?? undefined,
      targetFetchLevel
    )

    const targets = response.data.targets
    if (!targets || targets.length === 0) {
      return []
    }

    return targets.map((target) => ({
      id: target.id ?? '',
      label: target.name ?? '',
    }))
  } catch (error) {
    console.error('Error fetching targets:', error)
    return []
  }
}

/**
 * Given current state, determine what the next level should be
 * Returns null if we're at a leaf (final selection)
 */
export async function getNextFilterLevel(
  currentState: HierarchicalFilterState,
  organizationId: string,
  eventApi: OrganizationEventApi,
  queryParams: DecodedValueMap<any>
): Promise<FilterLevel | null> {
  const { targetType, projectId, environmentId, targetId } = currentState

  // Level 1: No target type? Show all target types
  if (!targetType) {
    const targetTypes = Object.values(
      await import('qovery-typescript-axios').then((m) => m.OrganizationEventTargetType)
    ).map((type: string) => ({
      id: type,
      label: formatTargetTypeName(type),
    }))

    // Add "All" option at the beginning
    const items = [
      {
        id: 'ALL',
        label: 'All',
      },
      ...targetTypes,
    ]

    return {
      key: 'targetType',
      title: 'Select Target Type',
      items,
      hasSearch: true,
    }
  }

  // SERVICE TYPE HIERARCHY: Target Type → Project → Environment → Service
  if (isServiceType(targetType)) {
    // Level 2: Show projects
    if (!projectId) {
      const items = await fetchTargets(
        organizationId,
        eventApi,
        queryParams,
        targetType,
        'PROJECT' // targetFetchLevel for projects
      )

      return {
        key: 'projectId',
        title: 'Select Project',
        items,
        hasSearch: true,
      }
    }

    // Level 3: Show environments
    if (!environmentId) {
      const items = await fetchTargets(
        organizationId,
        eventApi,
        { ...queryParams, projectId }, // Include projectId in query params
        targetType,
        'ENVIRONMENT' // targetFetchLevel for environments
      )

      return {
        key: 'environmentId',
        title: 'Select Environment',
        items,
        hasSearch: true,
      }
    }

    // Level 4: Show services
    if (!targetId) {
      const items = await fetchTargets(
        organizationId,
        eventApi,
        { ...queryParams, projectId, environmentId }, // Include both
        targetType
        // No targetFetchLevel for final service level
      )

      return {
        key: 'targetId',
        title: `Select ${formatTargetTypeName(targetType)}`,
        items,
        hasSearch: true,
      }
    }

    // All levels selected, we're done
    return null
  }

  // ENVIRONMENT TYPE HIERARCHY: Target Type → Project → Environment
  if (isEnvironmentType(targetType)) {
    // Level 2: Show projects
    if (!projectId) {
      const items = await fetchTargets(
        organizationId,
        eventApi,
        queryParams,
        targetType,
        'PROJECT' // targetFetchLevel for projects
      )

      return {
        key: 'projectId',
        title: 'Select Project',
        items,
        hasSearch: true,
      }
    }

    // Level 3: Show environments (as targetId)
    if (!targetId) {
      const items = await fetchTargets(
        organizationId,
        eventApi,
        { ...queryParams, projectId },
        targetType
        // No targetFetchLevel for final level
      )

      return {
        key: 'targetId',
        title: 'Select Environment',
        items,
        hasSearch: true,
      }
    }

    // All levels selected, we're done
    return null
  }

  // OTHER TYPES HIERARCHY: Target Type → Entity
  if (!targetId) {
    const items = await fetchTargets(organizationId, eventApi, queryParams, targetType)

    return {
      key: 'targetId',
      title: `Select ${formatTargetTypeName(targetType)}`,
      items,
      hasSearch: true,
    }
  }

  // All levels selected, we're done
  return null
}
