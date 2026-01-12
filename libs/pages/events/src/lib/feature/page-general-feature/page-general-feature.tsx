import {
  OrganizationEventOrigin,
  OrganizationEventSubTargetType,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createEnumParam } from 'serialize-query-params'
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params'
import { type EventQueryParams, useFetchEvents, useFetchValidTargetIds } from '@qovery/domains/event'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { ALL, type NavigationLevel, type SelectedItem, type TableFilterProps } from '@qovery/shared/ui'
import { useDocumentTitle, useSupportChat } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import PageGeneral from '../../ui/page-general/page-general'
import { initializeSelectedItemsFromQueryParams } from '../../utils/target-type-selection-utils'

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

export function PageGeneralFeature() {
  useDocumentTitle('Audit Logs - Qovery')
  const { organizationId = '' } = useParams()
  const [queryParams, setQueryParams] = useQueryParams(queryParamsValues)
  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const [targetTypeSelectedItems, setTargetTypeSelectedItems] = useState<SelectedItem[]>([])
  const [targetTypeNavigationStack, setTargetTypeNavigationStack] = useState<NavigationLevel[] | undefined>(undefined)
  const [targetTypeLevel, setTargetTypeLevel] = useState<number | undefined>(undefined)
  const { data: eventsData, isLoading } = useFetchEvents(organizationId, queryParams)
  const { data: organization } = useOrganization({ organizationId, enabled: !!organizationId })
  const { data: validTargetIds } = useFetchValidTargetIds(organizationId)
  const { showChat } = useSupportChat()

  // Ref to prevent double-initialization (React strict mode can cause double-mounting in dev)
  const hasInitializedRef = useRef(false)

  // Initialize targetTypeSelectedItems from query params on mount
  useEffect(() => {
    if (hasInitializedRef.current) {
      return
    }

    const hasHierarchicalFilters =
      queryParams.targetType || queryParams.projectId || queryParams.environmentId || queryParams.targetId

    if (!hasHierarchicalFilters || !organizationId) {
      return
    }

    hasInitializedRef.current = true
    const organizationEventTargetTypes = Object.keys(OrganizationEventTargetType).map((item) => ({
      value: item,
      name: upperCaseFirstLetter(item),
    }))

    initializeSelectedItemsFromQueryParams(organizationId, organizationEventTargetTypes, 'target_type', queryParams)
      .then((initData) => {
        setTargetTypeSelectedItems(initData.selectedItems)
        setTargetTypeNavigationStack(initData.navigationStack)
        setTargetTypeLevel(initData.level)
      })
      .catch((error) => {
        console.error('[PageGeneralFeature] Error initializing targetTypeSelectedItems:', error)
      })
  }, [])

  // Sync queryParams -> table filters
  useEffect(() => {
    if (queryParams.eventType) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'event_type' && item.value === queryParams.eventType)
        if (!isAlreadyPresent) {
          return [...prev, { key: 'event_type', value: queryParams.eventType || '' }]
        }
        return prev
      })
    }

    if (queryParams.targetType) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some(
          (item) => item.key === 'target_type' && item.value === queryParams.targetType
        )
        if (!isAlreadyPresent) {
          return [...prev, { key: 'target_type', value: queryParams.targetType || '' }]
        }
        return prev
      })
    }

    if (queryParams.triggeredBy) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some(
          (item) => item.key === 'triggered_by' && item.value === queryParams.triggeredBy
        )
        if (!isAlreadyPresent) {
          return [...prev, { key: 'triggered_by', value: queryParams.triggeredBy || '' }]
        }
        return prev
      })
    }

    if (queryParams.origin) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'origin' && item.value === queryParams.origin)
        if (!isAlreadyPresent) {
          return [...prev, { key: 'origin', value: queryParams.origin || '' }]
        }
        return prev
      })
    }

    // Special case to handle the Timestamp filter as it relies
    if (queryParams.fromTimestamp && queryParams.toTimestamp) {
      setFilter((prev) => {
        const fromTimestampAlreadyPresent = prev.some(
          (item) => item.key === 'from_timestamp' && item.value === queryParams.fromTimestamp
        )
        const toTimestampAlreadyPresent = prev.some(
          (item) => item.key === 'to_timestamp' && item.value === queryParams.toTimestamp
        )
        if (!fromTimestampAlreadyPresent && !toTimestampAlreadyPresent) {
          return [
            ...prev,
            { key: 'from_timestamp', value: queryParams.fromTimestamp || '' },
            { key: 'to_timestamp', value: queryParams.toTimestamp || '' },
          ]
        }
        return prev
      })
    }

    if (queryParams.projectId) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'project_id' && item.value === queryParams.projectId)
        if (!isAlreadyPresent) {
          return [...prev, { key: 'project_id', value: queryParams.projectId || '' }]
        }
        return prev
      })
    }
    if (queryParams.environmentId) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some(
          (item) => item.key === 'environment_id' && item.value === queryParams.environmentId
        )
        if (!isAlreadyPresent) {
          return [...prev, { key: 'environment_id', value: queryParams.environmentId || '' }]
        }
        return prev
      })
    }
    if (queryParams.targetId) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'target_id' && item.value === queryParams.targetId)
        if (!isAlreadyPresent) {
          return [...prev, { key: 'target_id', value: queryParams.targetId || '' }]
        }
        return prev
      })
    }
  }, [queryParams])

  // Sync table filters -> queryParams
  useEffect(() => {
    for (let i = 0; i < filter.length; i++) {
      const currentFilter: TableFilterProps = filter[i]
      const key = currentFilter.key as keyof EventQueryParams

      const currentKey = key
        .toLowerCase()
        .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))

      if (currentFilter.value === ALL) {
        setQueryParams({
          [currentKey]: undefined,
        })
      } else {
        setQueryParams({
          [currentKey]: currentFilter.value,
        })
      }
    }
  }, [filter])

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
    setFilter((prev) =>
      prev.map((p) => {
        return { key: p.key, value: 'ALL' }
      })
    )
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
      organizationId={organizationId}
      showIntercom={showChat}
      queryParams={queryParams}
      targetTypeSelectedItems={targetTypeSelectedItems}
      setTargetTypeSelectedItems={setTargetTypeSelectedItems}
      targetTypeNavigationStack={targetTypeNavigationStack}
      targetTypeLevel={targetTypeLevel}
      validTargetIds={validTargetIds}
    />
  )
}

export default PageGeneralFeature
