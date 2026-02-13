import { getRouteApi, useParams } from '@tanstack/react-router'
import { OrganizationEventTargetType } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { type EventQueryParams, useFetchEvents, useFetchValidTargetIds } from '@qovery/domains/audit-logs/data-access'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { ALL, type NavigationLevel, type SelectedItem, type TableFilterProps } from '@qovery/shared/ui'
import { useDocumentTitle, useSupportChat } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import PageGeneral from '../page-general/page-general'
import { initializeSelectedItemsFromQueryParams } from '../utils/target-type-selection-utils'

const route = getRouteApi('/_authenticated/organization/$organizationId/audit-logs')

export const DEFAULT_PAGE_SIZE = 30

export function AuditLogsFeature() {
  useDocumentTitle('Audit Logs - Qovery')
  const { organizationId = '' } = useParams({ strict: false })

  const navigate = route.useNavigate()

  const urlParams = route.useSearch()

  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const [targetTypeSelectedItems, setTargetTypeSelectedItems] = useState<SelectedItem[]>([])
  const [targetTypeNavigationStack, setTargetTypeNavigationStack] = useState<NavigationLevel[] | undefined>(undefined)
  const [targetTypeLevel, setTargetTypeLevel] = useState<number | undefined>(undefined)
  const { data: eventsData, isLoading } = useFetchEvents(organizationId, urlParams)
  const { data: organization } = useOrganization({ organizationId, enabled: !!organizationId })
  const { data: validTargetIds } = useFetchValidTargetIds(organizationId)
  const { showChat } = useSupportChat()

  // Initialize targetTypeSelectedItems from query params on mount
  useEffect(() => {
    const hasHierarchicalFilters =
      urlParams.targetType || urlParams.projectId || urlParams.environmentId || urlParams.targetId

    if (!hasHierarchicalFilters || !organizationId) {
      return
    }

    const organizationEventTargetTypes = Object.keys(OrganizationEventTargetType).map((item) => ({
      value: item,
      name: upperCaseFirstLetter(item).replace(/_/g, ' '),
    }))

    initializeSelectedItemsFromQueryParams(organizationId, organizationEventTargetTypes, 'target_type', urlParams)
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
    if (urlParams.eventType) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'event_type' && item.value === urlParams.eventType)
        if (!isAlreadyPresent) {
          return [...prev, { key: 'event_type', value: urlParams.eventType || '' }]
        }
        return prev
      })
    }

    if (urlParams.targetType) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'target_type' && item.value === urlParams.targetType)
        if (!isAlreadyPresent) {
          return [...prev, { key: 'target_type', value: urlParams.targetType || '' }]
        }
        return prev
      })
    }

    if (urlParams.triggeredBy) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some(
          (item) => item.key === 'triggered_by' && item.value === urlParams.triggeredBy
        )
        if (!isAlreadyPresent) {
          return [...prev, { key: 'triggered_by', value: urlParams.triggeredBy || '' }]
        }
        return prev
      })
    }

    if (urlParams.origin) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'origin' && item.value === urlParams.origin)
        if (!isAlreadyPresent) {
          return [...prev, { key: 'origin', value: urlParams.origin || '' }]
        }
        return prev
      })
    }

    // Special case to handle the Timestamp filter as it relies
    if (urlParams.fromTimestamp && urlParams.toTimestamp) {
      setFilter((prev) => {
        const fromTimestampAlreadyPresent = prev.some(
          (item) => item.key === 'from_timestamp' && item.value === urlParams.fromTimestamp
        )
        const toTimestampAlreadyPresent = prev.some(
          (item) => item.key === 'to_timestamp' && item.value === urlParams.toTimestamp
        )
        if (!fromTimestampAlreadyPresent && !toTimestampAlreadyPresent) {
          return [
            ...prev,
            { key: 'from_timestamp', value: urlParams.fromTimestamp || '' },
            { key: 'to_timestamp', value: urlParams.toTimestamp || '' },
          ]
        }
        return prev
      })
    }

    if (urlParams.projectId) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'project_id' && item.value === urlParams.projectId)
        if (!isAlreadyPresent) {
          return [...prev, { key: 'project_id', value: urlParams.projectId || '' }]
        }
        return prev
      })
    }
    if (urlParams.environmentId) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some(
          (item) => item.key === 'environment_id' && item.value === urlParams.environmentId
        )
        if (!isAlreadyPresent) {
          return [...prev, { key: 'environment_id', value: urlParams.environmentId || '' }]
        }
        return prev
      })
    }
    if (urlParams.targetId) {
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'target_id' && item.value === urlParams.targetId)
        if (!isAlreadyPresent) {
          return [...prev, { key: 'target_id', value: urlParams.targetId || '' }]
        }
        return prev
      })
    }
  }, [urlParams])

  // Sync table filters -> queryParams
  useEffect(() => {
    let nextUrlParams = { ...urlParams }
    for (let i = 0; i < filter.length; i++) {
      const currentFilter: TableFilterProps = filter[i]
      const key = currentFilter.key as keyof EventQueryParams
      const currentKey = key
        .toLowerCase()
        .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))

      if (currentFilter.value === ALL) {
        nextUrlParams = {
          ...nextUrlParams,
          [currentKey]: undefined,
        }
      } else {
        nextUrlParams = {
          ...nextUrlParams,
          [currentKey]: currentFilter.value,
        }
      }
      navigate({
        search: nextUrlParams,
      })
    }
  }, [filter, urlParams, navigate])

  const onPrevious = () => {
    const stepBackToken = new URLSearchParams(eventsData?.links?.previous?.split('?')[1]).get('stepBackToken')

    if (stepBackToken) {
      navigate({
        search: {
          ...urlParams,
          stepBackToken,
          continueToken: undefined,
        },
      })
    }
  }

  const onNext = () => {
    const continueToken = new URLSearchParams(eventsData?.links?.next?.split('?')[1]).get('continueToken')

    if (continueToken) {
      navigate({
        search: {
          ...urlParams,
          continueToken,
          stepBackToken: undefined,
        },
      })
    }
  }

  const onPageSizeChange = (pageSize: string) => {
    navigate({ search: { pageSize: parseInt(pageSize, 10) } })
  }

  const handleClearFilter = () => {
    navigate({ search: { pageSize: DEFAULT_PAGE_SIZE } })
    setFilter((prev) =>
      prev.map((p) => {
        return { key: p.key, value: 'ALL' }
      })
    )
  }

  return (
    <PageGeneral
      events={eventsData?.events ?? []}
      organizationMaxLimitReached={eventsData?.organization_max_limit_reached ?? false}
      isLoading={isLoading}
      onNext={onNext}
      onPrevious={onPrevious}
      previousDisabled={!eventsData?.links?.previous}
      nextDisabled={!eventsData?.links?.next}
      onPageSizeChange={onPageSizeChange}
      pageSize={urlParams.pageSize.toString()}
      placeholderEvents={eventsFactoryMock(30)}
      handleClearFilter={handleClearFilter}
      filter={filter}
      setFilter={setFilter}
      organization={organization}
      organizationId={organizationId}
      showIntercom={showChat}
      queryParams={urlParams}
      targetTypeSelectedItems={targetTypeSelectedItems}
      setTargetTypeSelectedItems={setTargetTypeSelectedItems}
      targetTypeNavigationStack={targetTypeNavigationStack}
      targetTypeLevel={targetTypeLevel}
      validTargetIds={validTargetIds}
    />
  )
}

export default AuditLogsFeature
