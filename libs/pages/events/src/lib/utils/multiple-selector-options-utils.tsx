import {
  OrganizationEventApi,
  OrganizationEventSubTargetType,
  OrganizationEventTargetType,
} from 'qovery-typescript-axios'
import { type DecodedValueMap } from 'use-query-params'
import type { Option } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { type queryParamsValues } from '../feature/page-general-feature/page-general-feature'

// Global cache to store selected options
const SELECTED_OPTIONS_BY_KEY = new Map<string, Option>()

const SUB_TARGET_TYPES_BY_TARGET_TYPE: Map<string, string[]> = new Map<string, string[]>([
  // Service types
  [
    OrganizationEventTargetType.APPLICATION,
    [
      OrganizationEventSubTargetType.ADVANCED_SETTINGS,
      OrganizationEventSubTargetType.CONFIG,
      OrganizationEventSubTargetType.CUSTOM_DOMAIN,
      OrganizationEventSubTargetType.GIT_REPOSITORY,
      OrganizationEventSubTargetType.REMOTE_ACCESS,
      OrganizationEventSubTargetType.SECRET,
      OrganizationEventSubTargetType.VARIABLE,
    ],
  ],
  [
    OrganizationEventTargetType.CONTAINER,
    [
      OrganizationEventSubTargetType.ADVANCED_SETTINGS,
      OrganizationEventSubTargetType.CONFIG,
      OrganizationEventSubTargetType.CUSTOM_DOMAIN,
      OrganizationEventSubTargetType.REMOTE_ACCESS,
      OrganizationEventSubTargetType.SECRET,
      OrganizationEventSubTargetType.VARIABLE,
    ],
  ],
  [
    OrganizationEventTargetType.DATABASE,
    [OrganizationEventSubTargetType.CONFIG, OrganizationEventSubTargetType.REMOTE_ACCESS],
  ],
  [
    OrganizationEventTargetType.HELM,
    [
      OrganizationEventSubTargetType.ADVANCED_SETTINGS,
      OrganizationEventSubTargetType.CONFIG,
      OrganizationEventSubTargetType.CUSTOM_DOMAIN,
      OrganizationEventSubTargetType.GIT_REPOSITORY,
      OrganizationEventSubTargetType.REMOTE_ACCESS,
      OrganizationEventSubTargetType.SECRET,
      OrganizationEventSubTargetType.VARIABLE,
    ],
  ],
  [
    OrganizationEventTargetType.JOB,
    [
      OrganizationEventSubTargetType.ADVANCED_SETTINGS,
      OrganizationEventSubTargetType.CONFIG,
      OrganizationEventSubTargetType.CUSTOM_DOMAIN,
      OrganizationEventSubTargetType.GIT_REPOSITORY,
      OrganizationEventSubTargetType.REMOTE_ACCESS,
      OrganizationEventSubTargetType.SECRET,
      OrganizationEventSubTargetType.VARIABLE,
    ],
  ],
  [
    OrganizationEventTargetType.TERRAFORM,
    [
      OrganizationEventSubTargetType.ADVANCED_SETTINGS,
      OrganizationEventSubTargetType.CONFIG,
      OrganizationEventSubTargetType.SECRET,
      OrganizationEventSubTargetType.VARIABLE,
    ],
  ],

  // Organization level
  [
    OrganizationEventTargetType.ORGANIZATION,
    [
      OrganizationEventSubTargetType.ALERT_RULE,
      OrganizationEventSubTargetType.ANNOTATIONS_GROUP,
      OrganizationEventSubTargetType.API_TOKEN,
      OrganizationEventSubTargetType.BILLING_INFO,
      OrganizationEventSubTargetType.BILLING_USAGE_REPORT,
      OrganizationEventSubTargetType.CLOUD_PROVIDER_CREDENTIALS,
      OrganizationEventSubTargetType.CONFIG,
      OrganizationEventSubTargetType.CREDIT_CARD,
      OrganizationEventSubTargetType.CUSTOM_ROLE,
      OrganizationEventSubTargetType.GIT_TOKEN,
      OrganizationEventSubTargetType.LABELS_GROUP,
      OrganizationEventSubTargetType.PLAN,
    ],
  ],

  // Organization Referential
  [
    OrganizationEventTargetType.CLUSTER,
    [
      OrganizationEventSubTargetType.ADVANCED_SETTINGS,
      OrganizationEventSubTargetType.CLUSTER_CREDENTIALS,
      OrganizationEventSubTargetType.CLUSTER_ROUTING_TABLE,
      OrganizationEventSubTargetType.CONFIG,
      OrganizationEventSubTargetType.KUBERNETES_CONFIGURATION,
      OrganizationEventSubTargetType.KUBERNETES_CREDENTIALS,
      OrganizationEventSubTargetType.REMOTE_ACCESS,
    ],
  ],
  [OrganizationEventTargetType.CONTAINER_REGISTRY, [OrganizationEventSubTargetType.CONFIG]],
  [OrganizationEventTargetType.ENTERPRISE_CONNECTION, [OrganizationEventSubTargetType.SSO]],
  [OrganizationEventTargetType.HELM_REPOSITORY, [OrganizationEventSubTargetType.CONFIG]],
  [
    OrganizationEventTargetType.ENVIRONMENT,
    [
      OrganizationEventSubTargetType.CONFIG,
      OrganizationEventSubTargetType.DEPLOYMENT_STAGE,
      OrganizationEventSubTargetType.SECRET,
      OrganizationEventSubTargetType.VARIABLE,
    ],
  ],
  [
    OrganizationEventTargetType.MEMBERS_AND_ROLES,
    [OrganizationEventSubTargetType.INVITATION, OrganizationEventSubTargetType.MEMBER_ROLE],
  ],
  [
    OrganizationEventTargetType.PROJECT,
    [
      OrganizationEventSubTargetType.CONFIG,
      OrganizationEventSubTargetType.DEPLOYMENT_RULE,
      OrganizationEventSubTargetType.SECRET,
      OrganizationEventSubTargetType.VARIABLE,
    ],
  ],
  [OrganizationEventTargetType.WEBHOOK, [OrganizationEventSubTargetType.CONFIG]],
])

// Helper function to build an option for targetType & subTargetType (no need to fetch from API)
export function getNonDynamicOption(requestParam: string, value: string): Option {
  const cachedOption = SELECTED_OPTIONS_BY_KEY.get(requestParam)
  if (cachedOption) {
    return cachedOption
  }

  if (requestParam === 'targetType') {
    const label = upperCaseFirstLetter(value)?.replace(/_/g, ' ')
    return {
      label: `Type: ${label}`,
      value: `targetType:${value}`,
    }
  } else if (requestParam === 'subTargetType') {
    const label = upperCaseFirstLetter(value)?.replace(/_/g, ' ')
    return {
      label: `Sub Type: ${label}`,
      value: `subTargetType:${value}`,
    }
  }

  // should never reach here
  return {
    label: 'Unknown',
    value: 'unknown:',
    description: 'Unknown',
  }
}

// Get target object from ID
// - either present in the cache, i.e normal flow when selecting an option
// - or fetch from API, i.e paste URL containing project ID
export async function getCachedOptionOrFetchEntity(
  organizationId: string,
  targetTypeToSearch: OrganizationEventTargetType,
  entityId: string,
  requestParam: string,
  queryParams: DecodedValueMap<typeof queryParamsValues>
): Promise<Option | undefined> {
  // Return from cache if available
  const cachedOption = SELECTED_OPTIONS_BY_KEY.get(requestParam)
  if (cachedOption) {
    return cachedOption
  }

  const eventsApi = new OrganizationEventApi()
  // Fetch from API
  queryParams.eventType ??= undefined
  queryParams.triggeredBy ??= undefined
  queryParams.origin ??= undefined
  queryParams.projectId ??= undefined
  queryParams.environmentId ??= undefined
  const { eventType, origin, triggeredBy, toTimestamp, fromTimestamp, projectId, environmentId } = queryParams

  // For project and environments, we need to add the targetFetchLevel
  let targetFetchLevel: OrganizationEventTargetType | undefined = undefined
  let prefix = ''
  if (requestParam === 'projectId') {
    targetFetchLevel = OrganizationEventTargetType.PROJECT
    prefix = 'Project:'
  } else if (requestParam === 'environmentId') {
    targetFetchLevel = OrganizationEventTargetType.ENVIRONMENT
    prefix = 'Environment:'
  } else if (requestParam === 'targetId') {
    prefix = 'Target:'
  }

  const response = await eventsApi.getOrganizationEventTargets(
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

  if (!response.data.targets) {
    return undefined
  }

  const target = response.data.targets.find((t) => t.id === entityId)
  if (!target) {
    return undefined
  }

  return {
    label: `${prefix} ${target.name}`,
    value: `${requestParam}:${entityId}`,
  }
}

// Helper function to cache an option manually based on its type
export function cacheEntityOption(option: Option): void {
  const type = option.value.split(':')[0]
  SELECTED_OPTIONS_BY_KEY.set(type, option)
}

// to be used for tests only
export function clearSelectedOptionsCache(): void {
  SELECTED_OPTIONS_BY_KEY.clear()
}

const SERVICE_TARGET_TYPES: ReadonlySet<string> = new Set([
  'targetType:APPLICATION',
  'targetType:DATABASE',
  'targetType:CONTAINER',
  'targetType:HELM',
  'targetType:JOB',
  'targetType:TERRAFORM',
])

// Utils functions
function isServiceType(option: Option): boolean {
  return SERVICE_TARGET_TYPES.has(option.value)
}

function isProject(option: Option): boolean {
  return option.value.startsWith('projectId:')
}

function isEnvironment(option: Option): boolean {
  return option.value.startsWith('environmentId:')
}

function isTargetType(option: Option): boolean {
  return option.value.startsWith('targetType:')
}

function isTarget(option: Option): boolean {
  return option.value.startsWith('targetId:')
}

function isSubTargetType(option: Option): boolean {
  return option.value.startsWith('subTargetType:')
}

function getSelectedTargetType(selectedOptions: Option[]): string {
  const targetTypeOption = selectedOptions.find((option) => {
    return option.value.startsWith('targetType:')
  })

  if (targetTypeOption === undefined) {
    return ''
  }

  return targetTypeOption.value.split(':')[1] ?? ''
}

// Build the options for the multiple-selector component based on the selected options
export function buildSearchBarOptions(
  queryParams: DecodedValueMap<typeof queryParamsValues>,
  selectedOptions: Option[],
  organizationId: string
): Option[] {
  // Early return to display basic options when no filter is selected
  if (selectedOptions.length === 0) {
    return Object.values(OrganizationEventTargetType).map((targetType) => {
      const label = upperCaseFirstLetter(targetType)?.replace(/_/g, ' ')
      return {
        value: `targetType:${targetType}`,
        label: label,
      }
    })
  }

  const searchBarOptions: Option[] = []
  const eventsApi = new OrganizationEventApi()

  const serviceTypeOption = selectedOptions.find((option) => isServiceType(option))
  const environmentTypeOption = selectedOptions.find((option) => option.value.startsWith('targetType:ENVIRONMENT'))
  const targetTypeOption =
    selectedOptions.find((option) => option.value.startsWith('targetType:'))?.value.split(':')[1] ?? ''

  // Handle the case where a service type is selected
  if (serviceTypeOption) {
    const serviceTargetTypeSelected = getSelectedTargetType(selectedOptions)
    const hasProjectId = selectedOptions.some((option) => isProject(option))
    if (!hasProjectId) {
      searchBarOptions.push({
        value: 'projectId:',
        label: 'Project',
        onLoadSubOptions: fetchTargetsAsync(
          queryParams,
          organizationId,
          eventsApi,
          serviceTargetTypeSelected as OrganizationEventTargetType,
          'projectId'
        ),
      })
    }

    const hasEnvironmentId = selectedOptions.some((option) => isEnvironment(option))
    if (hasProjectId && !hasEnvironmentId) {
      searchBarOptions.push({
        value: 'environmentId:',
        label: 'Environment',
        onLoadSubOptions: fetchTargetsAsync(
          queryParams,
          organizationId,
          eventsApi,
          serviceTargetTypeSelected as OrganizationEventTargetType,
          'environmentId'
        ),
      })
    }

    const hasServiceId = selectedOptions.some((option) => isTarget(option))
    if (hasProjectId && hasEnvironmentId && !hasServiceId) {
      const optionLabel = serviceTypeOption.label.split(':')[1]?.replace(/_/g, '') ?? ''
      searchBarOptions.push({
        value: 'targetId:',
        label: optionLabel,
        onLoadSubOptions: fetchTargetsAsync(
          queryParams,
          organizationId,
          eventsApi,
          serviceTargetTypeSelected as OrganizationEventTargetType,
          'targetId'
        ),
      })
    }
  }
  // Handle the case where 'ENVIRONMENT' type is selected
  else if (environmentTypeOption) {
    const hasProjectId = selectedOptions.some((option) => isProject(option))
    if (!hasProjectId) {
      console.log('hasProjectId', hasProjectId)
      searchBarOptions.push({
        value: 'projectId:',
        label: 'Project',
        onLoadSubOptions: fetchTargetsAsync(
          queryParams,
          organizationId,
          eventsApi,
          OrganizationEventTargetType.ENVIRONMENT,
          'projectId'
        ),
      })
    } else {
      searchBarOptions.push({
        value: 'targetId:',
        label: 'Environment',
        onLoadSubOptions: fetchTargetsAsync(
          queryParams,
          organizationId,
          eventsApi,
          OrganizationEventTargetType.ENVIRONMENT,
          'targetId'
        ),
      })
    }
  }
  // Handle other cases
  else {
    // Handle standalone target types (non-hierarchical types like ENVIRONMENT, WEBHOOK, etc.)
    const optionLabel = upperCaseFirstLetter(targetTypeOption)?.replace(/_/g, ' ')
    searchBarOptions.push({
      value: 'targetId:',
      label: `Choose ${optionLabel}`,
      onLoadSubOptions: fetchTargetsAsync(
        queryParams,
        organizationId,
        eventsApi,
        targetTypeOption as OrganizationEventTargetType,
        'targetId'
      ),
    })
  }

  // Handle sub-target types
  const subTargetTypes: Option[] =
    SUB_TARGET_TYPES_BY_TARGET_TYPE.get(targetTypeOption)?.map((subTargetType) => {
      return {
        value: `subTargetType:${subTargetType}`,
        label: upperCaseFirstLetter(subTargetType)?.replace(/_/g, ' '),
      }
    }) ?? []
  searchBarOptions.push({
    value: 'subTargetType:',
    label: 'Sub Type',
    subOptions: subTargetTypes,
  })

  return searchBarOptions
}

export function fetchTargetsAsync(
  queryParams: DecodedValueMap<typeof queryParamsValues>,
  organizationId: string,
  eventApi: OrganizationEventApi,
  targetTypeToSearch: OrganizationEventTargetType,
  optionIdKey: string
): () => Promise<Option[]> {
  return async (): Promise<Option[]> => {
    queryParams.eventType ??= undefined
    queryParams.triggeredBy ??= undefined
    queryParams.origin ??= undefined
    queryParams.projectId ??= undefined
    queryParams.environmentId ??= undefined
    const { eventType, origin, triggeredBy, toTimestamp, fromTimestamp, projectId, environmentId } = queryParams

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
    if (!targets) {
      return []
    }

    return targets.map((target) => {
      return {
        value: `${optionIdKey}:${target.id}`,
        label: target.name ?? '',
      }
    })
  }
}

// The purpose is to react on selected option removal to keep consistency on selected options
export function makeConsistentSelectedOptions(selectedOptions: Option[]): Option[] {
  const hasServiceType = selectedOptions.some((option) => isServiceType(option))
  const hasProjectId = selectedOptions.some((option) => isProject(option))
  const hasEnvironmentId = selectedOptions.some((option) => isEnvironment(option))
  const hasServiceId = selectedOptions.some((option) => isTarget(option))
  const hasTargetType = selectedOptions.some((option) => isTargetType(option))

  let newSelectedOptions = [...selectedOptions]

  if (!hasTargetType) {
    newSelectedOptions = []
  }
  const targetType = upperCaseFirstLetter(getSelectedTargetType(selectedOptions))?.replace(/_/g, ' ')

  // 1 Remove hierarchic options for services if needed
  if (hasServiceType) {
    if (hasServiceId && !(hasProjectId && hasEnvironmentId && hasServiceType)) {
      newSelectedOptions = newSelectedOptions.filter((option) => !isTarget(option))
    }

    if (hasEnvironmentId && !(hasProjectId && hasServiceType)) {
      newSelectedOptions = newSelectedOptions.filter((option) => !isEnvironment(option))
    }

    if (hasProjectId && !hasServiceType) {
      newSelectedOptions = newSelectedOptions.filter((option) => !isProject(option))
    }
  }

  // 2. Rewrite the options label according to their values
  newSelectedOptions = newSelectedOptions.map((option) => {
    if (option.label.split(':').length === 2) {
      return option
    }

    let prefix = ''
    if (isTargetType(option)) {
      prefix = 'Type: '
    } else if (isProject(option)) {
      prefix = 'Project: '
    } else if (isEnvironment(option)) {
      prefix = 'Environment: '
    } else if (isTarget(option)) {
      prefix = `${targetType}: `
    } else if (isSubTargetType(option)) {
      prefix = 'Sub Type: '
    }
    return {
      ...option,
      label: prefix + option.label,
    }
  })

  // Put selected options in cache, to be able to retrieve them when rendering multiple-selector selected options
  newSelectedOptions.forEach((option) => cacheEntityOption(option))

  return newSelectedOptions
}
