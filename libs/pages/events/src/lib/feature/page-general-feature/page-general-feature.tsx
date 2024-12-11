import {
  OrganizationEventOrigin,
  OrganizationEventSubTargetType,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'
import { createEnumParam } from 'serialize-query-params'
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params'
import { type EventQueryParams, useFetchEvents } from '@qovery/domains/event'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { ALL, type TableFilterProps } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
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

export const hasEnvironment = (targetType?: string) =>
  targetType === OrganizationEventTargetType.APPLICATION ||
  targetType === OrganizationEventTargetType.CONTAINER ||
  targetType === OrganizationEventTargetType.DATABASE ||
  targetType === OrganizationEventTargetType.HELM ||
  targetType === OrganizationEventTargetType.JOB

export const hasProject = (targetType?: string) =>
  targetType === OrganizationEventTargetType.ENVIRONMENT || hasEnvironment(targetType)

export function PageGeneralFeature() {
  useDocumentTitle('Audit Logs - Qovery')
  const { organizationId = '' } = useParams()
  const [queryParams, setQueryParams] = useQueryParams(queryParamsValues)
  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const { data: eventsData, isLoading } = useFetchEvents(organizationId, queryParams)
  const { data: organization } = useOrganization({ organizationId, enabled: !!organizationId })
  const { show: showIntercom } = useIntercom()

  // Sync queryParams -> table filters
  useEffect(() => {
    if (queryParams.origin)
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'origin' && item.value === queryParams.origin)
        if (!isAlreadyPresent) {
          const updatedFilters = [...prev, { key: 'origin', value: queryParams.origin || '' }]
          return updatedFilters
        }
        return prev
      })

    if (queryParams.eventType)
      setFilter((prev) => {
        const isAlreadyPresent = prev.some((item) => item.key === 'event_type' && item.value === queryParams.eventType)
        if (!isAlreadyPresent) {
          const updatedFilters = [...prev, { key: 'event_type', value: queryParams.eventType || '' }]
          return updatedFilters
        }
        return prev
      })
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
      showIntercom={showIntercom}
    />
  )
}

export default PageGeneralFeature
