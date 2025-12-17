import {
  OrganizationEventApi,
  OrganizationEventOrigin,
  OrganizationEventSubTargetType,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createEnumParam } from 'serialize-query-params'
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params'
import { type EventQueryParams, useFetchEvents } from '@qovery/domains/event'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { ALL, ENTITY_NAME_CACHE, type HierarchicalFilterState, type TableFilterProps } from '@qovery/shared/ui'
import { useDocumentTitle, useSupportChat } from '@qovery/shared/util-hooks'
import PageGeneral from '../../ui/page-general/page-general'

export const queryParamsValues = {
  pageSize: withDefault(NumberParam, 30),
  origin: createEnumParam(Object.values(OrganizationEventOrigin)),
  subTargetType: createEnumParam(Object.values(OrganizationEventSubTargetType)),
  triggeredBy: StringParam,
  targetId: StringParam,
  targetType: createEnumParam(Object.values(OrganizationEventTargetType)),
  eventType: createEnumParam(Object.values(OrganizationEventType)),
  toTimestamp: StringParam,
  fromTimestamp: StringParam,
  continueToken: StringParam,
  stepBackToken: StringParam,
  projectId: StringParam,
  environmentId: StringParam,
}

// Fetch entity name from ID using the API (with cache)
async function fetchEntityName(
  organizationId: string,
  targetType: OrganizationEventTargetType,
  entityId: string,
  entityLevel: 'project' | 'environment' | 'target',
  queryParams: any
): Promise<string | undefined> {
  // Check cache first
  const cachedName = ENTITY_NAME_CACHE.get(entityId)
  if (cachedName) {
    return cachedName
  }

  // Not in cache, fetch from API
  const eventsApi = new OrganizationEventApi()

  try {
    let targetFetchLevel: 'PROJECT' | 'ENVIRONMENT' | undefined = undefined
    if (entityLevel === 'project') {
      targetFetchLevel = 'PROJECT'
    } else if (entityLevel === 'environment') {
      targetFetchLevel = 'ENVIRONMENT'
    }

    const response = await eventsApi.getOrganizationEventTargets(
      organizationId,
      queryParams.fromTimestamp ?? undefined,
      queryParams.toTimestamp ?? undefined,
      queryParams.eventType ?? undefined,
      targetType,
      queryParams.triggeredBy ?? undefined,
      queryParams.origin ?? undefined,
      queryParams.projectId ?? undefined,
      queryParams.environmentId ?? undefined,
      targetFetchLevel
    )

    const target = response.data.targets?.find((t) => t.id === entityId)
    if (target?.name) {
      // Cache the result
      ENTITY_NAME_CACHE.set(entityId, target.name)
      return target.name
    }
    return undefined
  } catch (error) {
    console.error('Error fetching entity name:', error)
    return undefined
  }
}

export function PageGeneralFeature() {
  useDocumentTitle('Audit Logs - Qovery')
  const { organizationId = '' } = useParams()
  const [queryParams, setQueryParams] = useQueryParams(queryParamsValues)
  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const { data: eventsData, isLoading } = useFetchEvents(organizationId, queryParams)
  const { data: organization } = useOrganization({ organizationId, enabled: !!organizationId })
  const { showChat } = useSupportChat()

  // Track whether we're syncing FROM queryParams TO filter (to avoid circular updates)
  const isSyncingFromUrl = useRef(false)

  // Sync queryParams -> table filters
  useEffect(() => {
    const initializeFilters = async () => {
      // Set flag to indicate we're syncing FROM URL
      isSyncingFromUrl.current = true

      const newFilters: TableFilterProps[] = []

      // Hierarchical target type filter
      if (queryParams.targetType) {
        const hierarchicalState: HierarchicalFilterState = {
          targetType: queryParams.targetType,
          targetId: queryParams.targetId ?? undefined,
          projectId: queryParams.projectId ?? undefined,
          environmentId: queryParams.environmentId ?? undefined,
        }

        // Fetch entity names if IDs are present
        if (queryParams.projectId) {
          const projectName = await fetchEntityName(
            organizationId,
            queryParams.targetType,
            queryParams.projectId,
            'project',
            queryParams
          )
          hierarchicalState.projectName = projectName
        }

        if (queryParams.environmentId && queryParams.projectId) {
          const environmentName = await fetchEntityName(
            organizationId,
            OrganizationEventTargetType.ENVIRONMENT,
            queryParams.environmentId,
            'environment',
            { ...queryParams, projectId: queryParams.projectId }
          )
          hierarchicalState.environmentName = environmentName
        }

        if (queryParams.targetId && queryParams.targetType) {
          const targetName = await fetchEntityName(
            organizationId,
            queryParams.targetType,
            queryParams.targetId,
            'target',
            queryParams
          )
          hierarchicalState.targetName = targetName
        }

        newFilters.push({
          key: 'target_type',
          value: queryParams.targetType,
          hierarchical: hierarchicalState,
        })
      }

      // Origin filter
      if (queryParams.origin) {
        newFilters.push({ key: 'origin', value: queryParams.origin || '' })
      }

      // Event type filter
      if (queryParams.eventType) {
        newFilters.push({ key: 'event_type', value: queryParams.eventType || '' })
      }

      // Only update if filters changed (include hierarchical state in comparison)
      const filtersChanged =
        JSON.stringify(
          newFilters.map((f) => ({
            key: f.key,
            value: f.value,
            hierarchical: f.hierarchical,
          }))
        ) !==
        JSON.stringify(
          filter.map((f) => ({
            key: f.key,
            value: f.value,
            hierarchical: f.hierarchical,
          }))
        )

      if (filtersChanged && newFilters.length > 0) {
        setFilter(newFilters)
      } else if (newFilters.length === 0 && filter.length > 0) {
        setFilter([])
      }

      // Clear flag after a short delay to allow setFilter to complete
      setTimeout(() => {
        isSyncingFromUrl.current = false
      }, 0)
    }

    initializeFilters()
  }, [
    queryParams.targetType,
    queryParams.targetId,
    queryParams.projectId,
    queryParams.environmentId,
    queryParams.origin,
    queryParams.eventType,
    organizationId,
  ])

  // Sync table filters -> queryParams (user interactions only)
  useEffect(() => {
    // Skip if we're currently syncing FROM URL TO filter (to avoid circular updates)
    if (isSyncingFromUrl.current) {
      return
    }

    // Check if hierarchical target_type filter exists
    const hierarchicalFilter = filter.find((f) => f.key === 'target_type' && f.hierarchical)

    if (hierarchicalFilter?.hierarchical) {
      // Only update if query params are different from hierarchical state
      const h = hierarchicalFilter.hierarchical
      const needsUpdate =
        queryParams.targetType !== h.targetType ||
        queryParams.targetId !== h.targetId ||
        queryParams.projectId !== h.projectId ||
        queryParams.environmentId !== h.environmentId

      if (needsUpdate) {
        setQueryParams({
          targetType: h.targetType,
          targetId: h.targetId,
          projectId: h.projectId,
          environmentId: h.environmentId,
        })
      }
    } else if (queryParams.targetType || queryParams.targetId || queryParams.projectId || queryParams.environmentId) {
      // Clear hierarchical query params if filter was removed
      setQueryParams({
        targetType: undefined,
        targetId: undefined,
        projectId: undefined,
        environmentId: undefined,
      })
    }

    // Handle simple filters - batch all updates into a single setQueryParams call
    const simpleFilterUpdates: Record<string, any> = {}
    let hasSimpleFilterUpdates = false

    // Track which filter keys exist in the filter array
    const existingFilterKeys = new Set<string>()

    for (let i = 0; i < filter.length; i++) {
      const currentFilter: TableFilterProps = filter[i]
      const key = currentFilter.key

      // Skip hierarchical filter (already handled above)
      if (key === 'target_type') continue

      // Handle simple filters
      if (!key) continue

      existingFilterKeys.add(key)

      const currentKey = key
        .toLowerCase()
        .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))

      // Only update if value is different
      const currentQueryValue = queryParams[currentKey as keyof typeof queryParams]

      if (currentFilter.value === ALL) {
        if (currentQueryValue !== undefined) {
          simpleFilterUpdates[currentKey] = undefined
          hasSimpleFilterUpdates = true
        }
      } else {
        if (currentQueryValue !== currentFilter.value) {
          simpleFilterUpdates[currentKey] = currentFilter.value
          hasSimpleFilterUpdates = true
        }
      }
    }

    // Clear queryParams for filters that were removed from the filter array
    const possibleFilterKeys = ['origin', 'event_type', 'triggered_by']
    for (const filterKey of possibleFilterKeys) {
      if (!existingFilterKeys.has(filterKey)) {
        // This filter doesn't exist in the array, check if its queryParam needs clearing
        const queryKey = filterKey
          .toLowerCase()
          .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))
        const currentQueryValue = queryParams[queryKey as keyof typeof queryParams]

        if (currentQueryValue !== undefined) {
          simpleFilterUpdates[queryKey] = undefined
          hasSimpleFilterUpdates = true
        }
      }
    }

    // Apply all simple filter updates at once
    if (hasSimpleFilterUpdates) {
      setQueryParams(simpleFilterUpdates)
    }
  }, [
    filter,
    queryParams.targetType,
    queryParams.targetId,
    queryParams.projectId,
    queryParams.environmentId,
    queryParams.origin,
    queryParams.eventType,
    queryParams.triggeredBy,
  ])

  const onPrevious = () => {
    if (eventsData?.links?.previous) {
      setQueryParams({
        stepBackToken: new URLSearchParams(eventsData.links.previous.split('?')[1]).get('stepBackToken'),
        continueToken: undefined,
      })
    }
  }

  const onNext = () => {
    if (eventsData?.links?.next) {
      setQueryParams({
        continueToken: new URLSearchParams(eventsData.links.next.split('?')[1]).get('continueToken'),
        stepBackToken: undefined,
      })
    }
  }

  const onPageSizeChange = (pageSize: string) => {
    setQueryParams({ pageSize: parseInt(pageSize, 10) })
  }

  const handleClearFilter = () => {
    setQueryParams({}, 'push')
    setFilter([])
  }

  return (
    <PageGeneral
      events={eventsData?.events || eventsFactoryMock(30)}
      organizationMaxLimitReached={eventsData?.organization_max_limit_reached ?? false}
      isLoading={isLoading}
      onNext={onNext}
      onPrevious={onPrevious}
      previousDisabled={!eventsData?.links?.previous}
      nextDisabled={!eventsData?.links?.next}
      onPageSizeChange={onPageSizeChange}
      pageSize={queryParams.pageSize.toString()}
      placeholderEvents={eventsFactoryMock(30)}
      handleClearFilter={handleClearFilter}
      filter={filter}
      setFilter={setFilter}
      organization={organization}
      showIntercom={showChat}
      organizationId={organizationId}
      queryParams={queryParams}
    />
  )
}

export default PageGeneralFeature
