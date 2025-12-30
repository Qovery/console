import { subDays } from 'date-fns'
import { type Organization, OrganizationEventApi, OrganizationEventTargetType } from 'qovery-typescript-axios'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { type DecodedValueMap, useQueryParams } from 'use-query-params'
import { useOrganization } from '@qovery/domains/organizations/feature'
import type { Option } from '@qovery/shared/ui'
import { convertDatetoTimestamp } from '@qovery/shared/util-dates'
import { SelectedTimestamps } from '../../../../../../shared/ui/src/lib/components/table/table-head-datepicker/table-head-datepicker'
import CustomFilter from '../../ui/custom-filter/custom-filter'
import { queryParamsValues } from '../page-general-feature/page-general-feature'

const VALID_FILTER_KEYS = ['targetType', 'targetId', 'projectId', 'environmentId', 'subTargetType']

function buildQueryParams(options: Option[]) {
  const queryParams: Omit<
    DecodedValueMap<typeof queryParamsValues>,
    'fromTimestamp' | 'toTimestamp' | 'continueToken' | 'stepBackToken' | 'pageSize' | 'eventType'
  > = {
    targetType: undefined,
    targetId: undefined,
    subTargetType: undefined,
    projectId: undefined,
    environmentId: undefined,
    triggeredBy: undefined,
    origin: undefined,
  }

  options.forEach((option) => {
    const splitOption = option.value.split(':')
    const filterKey = splitOption[0]
    const filterValue = splitOption[1]
    const isValidFilter = VALID_FILTER_KEYS.includes(filterKey)

    if (isValidFilter && filterValue) {
      const typedQueryParams = queryParams as Record<string, string>
      typedQueryParams[filterKey] = filterValue
    }
  })

  return queryParams
}

// Calculate default timestamps for display (not stored in URL)
function getDefaultTimestamps(
  queryParams: DecodedValueMap<typeof queryParamsValues>,
  organization?: Organization
): SelectedTimestamps {
  const fromTimestamp = queryParams.fromTimestamp && new Date(parseInt(queryParams.fromTimestamp, 10) * 1000)
  const toTimestamp = queryParams.toTimestamp && new Date(parseInt(queryParams.toTimestamp, 10) * 1000)

  // If timestamps are in URL, use them
  if (fromTimestamp && toTimestamp) {
    return {
      automaticallySelected: false,
      fromTimestamp,
      toTimestamp,
    }
  }

  // If organization has >30 days retention and no URL params, select 30-day old period by default
  if (organization) {
    const retentionDays = organization.organization_plan?.audit_logs_retention_in_days ?? 30
    if (retentionDays > 30) {
      const now = new Date()
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      // Subtract 29 days to get exactly 30 days inclusive (today + 29 previous days = 30 days)
      const startDate = subDays(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0), 29)
      return {
        automaticallySelected: true,
        fromTimestamp: startDate,
        toTimestamp: endDate,
      }
    }
  }

  return {
    automaticallySelected: false,
    fromTimestamp: undefined,
    toTimestamp: undefined,
  }
}

export interface CustomFilterFeatureProps {
  handleClearFilter: () => void
}

export function CustomFilterFeature({ handleClearFilter }: CustomFilterFeatureProps) {
  const { organizationId = '' } = useParams()
  const [isOpenTimestamp, setIsOpenTimestamp] = useState(false)

  const [queryParams, setQueryParams] = useQueryParams(queryParamsValues)

  const { data: organization } = useOrganization({ organizationId, enabled: !!organizationId })

  const selectedTimestamps = getDefaultTimestamps(queryParams, organization)

  // Sync the input value with query params when they change (async with global cache)
  // useEffect(() => {
  //   buildAuditLogsSelectedOptions(queryParams, organizationId).then(setSelectedOptions)
  // }, [queryParams, organizationId])

  const onChangeTimestamp = (startDate: Date, endDate: Date) => {
    setQueryParams({
      continueToken: undefined,
      stepBackToken: undefined,
      fromTimestamp: convertDatetoTimestamp(startDate.toString()).toString(),
      toTimestamp: endDate ? convertDatetoTimestamp(endDate.toString()).toString() : undefined,
    })
    setIsOpenTimestamp(!isOpenTimestamp)
  }

  const onChangeClearTimestamp = () => {
    setQueryParams({
      fromTimestamp: undefined,
      toTimestamp: undefined,
    })
    setIsOpenTimestamp(false)
  }

  return (
    <CustomFilter
      onChangeTimestamp={onChangeTimestamp}
      onChangeClearTimestamp={onChangeClearTimestamp}
      isOpenTimestamp={isOpenTimestamp}
      setIsOpenTimestamp={setIsOpenTimestamp}
      timestamps={selectedTimestamps}
      clearFilter={() => {
        handleClearFilter()
        onChangeClearTimestamp()
      }}
      organization={organization}
    />
  )
}

export default memo(CustomFilterFeature)
