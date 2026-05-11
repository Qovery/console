import { getRouteApi, useParams } from '@tanstack/react-router'
import { OrganizationEventTargetType } from 'qovery-typescript-axios'
import { useEffect, useRef, useState } from 'react'
import { useFetchEvents, useFetchValidTargetIds } from '@qovery/domains/audit-logs/data-access'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { type AuditLogsParams, DEFAULT_PAGE_SIZE } from '@qovery/shared/router'
import { ALL, type NavigationLevel, type SelectedItem, type TableFilterProps } from '@qovery/shared/ui'
import { useDocumentTitle, useSupportChat } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { AuditLogs } from '../audit-logs/audit-logs'
import { initializeSelectedItemsFromQueryParams } from '../utils/target-type-selection-utils'

const route = getRouteApi('/_authenticated/organization/$organizationId/audit-logs')

const AUDIT_LOG_FILTER_PARAMS = new Set<keyof AuditLogsParams>([
  'eventType',
  'targetType',
  'triggeredBy',
  'origin',
  'fromTimestamp',
  'toTimestamp',
  'projectId',
  'environmentId',
  'targetId',
])

function toTableFilterKey(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function toSearchParamKey(key: string) {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()) as keyof AuditLogsParams
}

function createFiltersFromUrlParams(urlParams: AuditLogsParams): TableFilterProps[] {
  return Array.from(AUDIT_LOG_FILTER_PARAMS).reduce<TableFilterProps[]>((filters, searchKey) => {
    const value = urlParams[searchKey]
    if (value) {
      filters.push({ key: toTableFilterKey(searchKey), value: value.toString() })
    }
    return filters
  }, [])
}

function areFiltersEqual(a: TableFilterProps[], b: TableFilterProps[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  return a.every((filter, index) => filter.key === b[index].key && filter.value === b[index].value)
}

function areSearchParamsEqual(a: AuditLogsParams, b: AuditLogsParams): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)] as Array<keyof AuditLogsParams>)

  return Array.from(keys).every((key) => a[key] === b[key])
}

function createUrlParamsFromFilters(filter: TableFilterProps[], urlParams: AuditLogsParams): AuditLogsParams {
  return filter.reduce<AuditLogsParams>(
    (nextUrlParams, currentFilter) => {
      if (!currentFilter.key) {
        return nextUrlParams
      }

      const searchKey = toSearchParamKey(currentFilter.key)
      if (!AUDIT_LOG_FILTER_PARAMS.has(searchKey)) {
        return nextUrlParams
      }

      return {
        ...nextUrlParams,
        [searchKey]: currentFilter.value === ALL ? undefined : currentFilter.value,
      }
    },
    { ...urlParams }
  )
}

export function AuditLogsView() {
  useDocumentTitle('Audit Logs - Qovery')
  const { organizationId = '' } = useParams({ strict: false })

  const navigate = route.useNavigate()

  const urlParams = route.useSearch()

  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const isSyncingFiltersFromUrl = useRef(false)
  const [targetTypeSelectedItems, setTargetTypeSelectedItems] = useState<SelectedItem[]>([])
  const [targetTypeNavigationStack, setTargetTypeNavigationStack] = useState<NavigationLevel[] | undefined>(undefined)
  const [targetTypeLevel, setTargetTypeLevel] = useState<number | undefined>(undefined)
  const { data: eventsData, isLoading } = useFetchEvents(organizationId, { ...urlParams })
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
    const nextFilter = createFiltersFromUrlParams(urlParams)
    setFilter((prev) => {
      if (areFiltersEqual(prev, nextFilter)) {
        return prev
      }

      isSyncingFiltersFromUrl.current = true
      return nextFilter
    })
  }, [urlParams])

  // Sync table filters -> queryParams
  useEffect(() => {
    if (isSyncingFiltersFromUrl.current) {
      isSyncingFiltersFromUrl.current = false
      return
    }

    if (filter.length === 0) {
      return
    }

    const nextUrlParams = createUrlParamsFromFilters(filter, urlParams)
    if (areSearchParamsEqual(urlParams, nextUrlParams)) {
      return
    }

    navigate({
      search: nextUrlParams,
    })
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
    <AuditLogs
      events={eventsData?.events ?? []}
      organizationMaxLimitReached={eventsData?.organization_max_limit_reached ?? false}
      isLoading={isLoading}
      onNext={onNext}
      onPrevious={onPrevious}
      previousDisabled={!eventsData?.links?.previous}
      nextDisabled={!eventsData?.links?.next}
      onPageSizeChange={onPageSizeChange}
      pageSize={urlParams.pageSize?.toString()}
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

export default AuditLogsView
