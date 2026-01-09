import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { DecodedValueMap } from 'use-query-params'
import { Button, Icon, SelectedItem, type TableFilterProps, truncateText } from '@qovery/shared/ui'
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

function truncateIfNecessary(text: string): string {
  if (text.length > 23) {
    return `${truncateText(text, 20)}...`
  }
  return text
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
      value: truncateIfNecessary(upperCaseFirstLetter(queryParams.triggeredBy).split('_').join(' ')),
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
    const selectedItem = selectedItemsTargetType.find((selectedItem) => selectedItem.filterKey === 'project_id')
    if (selectedItem) {
      const projectName =
        selectedItemsTargetType.find((selectedItem) => selectedItem.filterKey === 'project_id')?.item?.name ?? '...'
      badges.push({
        key: 'project_id',
        displayedName: 'Project',
        value: truncateIfNecessary(projectName),
      })
    }
  }
  if (queryParams.environmentId) {
    const selectedItem = selectedItemsTargetType.find((selectedItem) => selectedItem.filterKey === 'environment_id')
    if (selectedItem) {
      const environmentName =
        selectedItemsTargetType.find((selectedItem) => selectedItem.filterKey === 'environment_id')?.item?.name ?? '...'
      badges.push({
        key: 'environment_id',
        displayedName: 'Environment',
        value: truncateIfNecessary(environmentName),
      })
    }
  }
  if (queryParams.targetId) {
    const selectedItem = selectedItemsTargetType.find((selectedItem) => selectedItem.filterKey === 'target_id')
    if (selectedItem) {
      const targetName = selectedItem?.item?.name ?? '...'
      const targetType = upperCaseFirstLetter(queryParams.targetType ?? '...')
        .split('_')
        .join(' ')
      badges.push({
        key: 'target_id',
        displayedName: targetType,
        value: truncateIfNecessary(targetName),
      })
    }
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
      // We need to manually handle the hierarchic filter keys removal
      let allKeysToRemove: string[] = []
      if (key === 'target_type') {
        allKeysToRemove = ['target_type', 'project_id', 'environment_id', 'target_id']
      } else if (key === 'project_id') {
        allKeysToRemove = ['project_id', 'environment_id', 'target_id']
      } else if (key === 'environment_id') {
        allKeysToRemove = ['environment_id', 'target_id']
      } else {
        allKeysToRemove = [key]
      }
      setFilter((prev) => {
        const enforceKeysToRemove = allKeysToRemove.map((keyToRemove) => {
          return {
            key: keyToRemove,
            value: 'ALL',
          }
        })
        return [
          ...prev.filter((currentValue) => !allKeysToRemove.includes(currentValue.key ?? '')),
          ...enforceKeysToRemove,
        ]
      })
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
    <div className="flex w-full gap-4">
      {/* LEFT: Badges container with wrapping */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
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

      {/* RIGHT: Button stays fixed at top-right */}
      {badges.length > 0 && (
        <div className="flex-shrink-0 self-start">
          <Button className="gap-2" size="xs" color="neutral" variant="surface" onClick={clearFilter}>
            Clear all filters
            <Icon iconName="xmark" iconStyle="regular" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default FilterSection
