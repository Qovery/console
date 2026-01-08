import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { DecodedValueMap } from 'use-query-params'
import { Button, Icon, Link, SelectedItem, type TableFilterProps } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { queryParamsValues } from '../../feature/page-general-feature/page-general-feature'

export interface CustomFilterProps {
  clearFilter: () => void
  queryParams: DecodedValueMap<typeof queryParamsValues>
  targetTypeSelectedItems: SelectedItem[]
  setFilter?: Dispatch<SetStateAction<TableFilterProps[]>>
}

interface Badge {
  key: string
  displayedName: string
  value: string
}

function buildBadges(
  queryParams: DecodedValueMap<typeof queryParamsValues>,
  selectedItemsTargetType: SelectedItem[]
): Badge[] {
  const badges: Badge[] = []
  if (queryParams.fromTimestamp && queryParams.toTimestamp) {
    const fromDate = new Date(parseInt(queryParams.fromTimestamp, 10) * 1000)
    const toDate = new Date(parseInt(queryParams.toTimestamp, 10) * 1000)
    badges.push({
      key: 'timestamp',
      displayedName: 'Timestamp',
      value:
        'From "' +
        dateYearMonthDayHourMinuteSecond(fromDate, true, false) +
        '" To "' +
        dateYearMonthDayHourMinuteSecond(toDate, true, false) +
        '"',
    })
  }
  if (queryParams.eventType) {
    badges.push({
      key: 'event_type',
      displayedName: 'Event Type',
      value: upperCaseFirstLetter(queryParams.eventType).split('_').join(' '),
    })
  }
  if (queryParams.targetType) {
    badges.push({
      key: 'target_type',
      displayedName: 'Target Type',
      value: upperCaseFirstLetter(queryParams.targetType).split('_').join(' '),
    })
  }
  if (queryParams.triggeredBy) {
    badges.push({
      key: 'triggered_by',
      displayedName: 'User',
      value: upperCaseFirstLetter(queryParams.triggeredBy).split('_').join(' '),
    })
  }
  if (queryParams.origin) {
    badges.push({
      key: 'origin',
      displayedName: 'Source',
      value: upperCaseFirstLetter(queryParams.origin).split('_').join(' '),
    })
  }
  if (queryParams.projectId) {
    const projectName =
      selectedItemsTargetType.find((selectedItem) => selectedItem.filterKey === 'project_id')?.item?.name ?? '...'
    badges.push({
      key: 'project_id',
      displayedName: 'Project',
      value: projectName,
    })
  }
  if (queryParams.environmentId) {
    const environmentName =
      selectedItemsTargetType.find((selectedItem) => selectedItem.filterKey === 'environment_id')?.item?.name ?? '...'
    badges.push({
      key: 'environment_id',
      displayedName: 'Environment',
      value: environmentName,
    })
  }

  if (queryParams.targetId) {
    const targetName =
      selectedItemsTargetType.find((selectedItem) => selectedItem.filterKey === 'target_id')?.item?.name ?? '...'
    const targetType = upperCaseFirstLetter(queryParams.targetType ?? '...')
      .split('_')
      .join(' ')
    badges.push({
      key: 'target_id',
      displayedName: targetType,
      value: targetName,
    })
  }

  return badges
}

function deleteFilter(key: string, setFilter?: Dispatch<SetStateAction<TableFilterProps[]>>) {
  if (setFilter) {
    // Handle 'timestamp' key as it wraps 2 distinct filters
    if (key === 'timestamp') {
      setFilter((prev) => [
        ...prev.filter((currentValue) => currentValue.key !== 'from_timestamp' && currentValue.key !== 'to_timestamp'),
        {
          key: 'from_timestamp',
          value: 'ALL',
        },
        {
          key: 'to_timestamp',
          value: 'ALL',
        },
      ])
    } else {
      setFilter((prev) => [
        ...prev.filter((currentValue) => currentValue.key !== key),
        {
          key: key,
          value: 'ALL',
        },
      ])
    }
  }
}

export function FilterSection({ clearFilter, queryParams, targetTypeSelectedItems, setFilter }: CustomFilterProps) {
  const [badges, setBadges] = useState<Badge[]>(buildBadges(queryParams, targetTypeSelectedItems))
  useEffect(() => {
    setBadges(buildBadges(queryParams, targetTypeSelectedItems))
  }, [queryParams, targetTypeSelectedItems])

  const priorityKeys = new Set(['target_type', 'target_id', 'project_id', 'environment_id'])

  return (
    <>
      <div className="flex w-full items-center gap-2">
        {badges
          .filter((badge) => !priorityKeys.has(badge.key))
          .map((badge) => (
            <Button
              radius="full"
              variant="surface"
              color="neutral"
              size="xs"
              className="pl-9.5 justify-center gap-1.5"
              key={badge.key}
            >
              {badge.displayedName}: {badge.value}
              <Icon
                iconName="xmark"
                className="text-sm leading-4 text-neutral-300 hover:text-neutral-400"
                onClick={() => deleteFilter(badge.key, setFilter)}
              />
            </Button>
          ))}
        <div className="flex">
          {badges
            .filter((badge) => priorityKeys.has(badge.key))
            .map((badge, index, array) => {
              const isFirst = index === 0
              const isLast = index === array.length - 1
              const roundedClass =
                isFirst && isLast
                  ? 'rounded-l-full rounded-r-full'
                  : isFirst
                    ? 'rounded-l-full rounded-r-none'
                    : isLast
                      ? 'rounded-l-none rounded-r-full'
                      : 'rounded-none'

              return (
                <Button
                  variant="surface"
                  color="neutral"
                  size="xs"
                  className={`pl-9.5 justify-center gap-1.5 ${roundedClass}`}
                  key={badge.key}
                >
                  {badge.displayedName}: {badge.value}
                  <Icon
                    iconName="xmark"
                    className="text-sm leading-4 text-neutral-300 hover:text-neutral-400"
                    onClick={() => deleteFilter(badge.key, setFilter)}
                  />
                </Button>
              )
            })}
        </div>
      </div>
      {badges.length > 0 && (
        <div className="flex items-center justify-end text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Button className="ml-1 gap-2" size="xs" color="neutral" variant="surface" onClick={clearFilter}>
              Clear all filters
              <Icon iconName="xmark" iconStyle="regular" />
            </Button>
          </span>
        </div>
      )}
    </>
  )
}

export default FilterSection
