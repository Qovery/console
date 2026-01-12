import clsx from 'clsx'
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { type DecodedValueMap } from 'use-query-params';
import { Button, Icon, type SelectedItem, type TableFilterProps, Tooltip, truncateText } from '@qovery/shared/ui';
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates';
import { upperCaseFirstLetter } from '@qovery/shared/util-js';
import { type queryParamsValues } from '../../feature/page-general-feature/page-general-feature';

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

function truncateIfNecessary(key: string, text: string): string {
  if (key === 'timestamp') {
    return text
  }
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
    const selectedItem = selectedItemsTargetType.find((selectedItem) => selectedItem.filterKey === 'project_id')
    if (selectedItem) {
      const projectName =
        selectedItemsTargetType.find((selectedItem) => selectedItem.filterKey === 'project_id')?.item?.name ?? '...'
      badges.push({
        key: 'project_id',
        displayedName: 'Project',
        value: projectName,
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
        value: environmentName,
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
        value: targetName,
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
    <div className="mt-1 flex w-full gap-4">
      {/* LEFT: Badges container with wrapping */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {badges
          .filter((badge) => !priorityKeys.has(badge.key))
          .map((badge) => (
            <Tooltip key={badge.key} content={badge.value}>
              <Button
                radius="full"
                variant="surface"
                color="neutral"
                size="xs"
                className="pl-9.5 justify-center gap-1.5"
                key={badge.key}
              >
                {badge.displayedName}: {truncateIfNecessary(badge.key, badge.value)}
                <Icon
                  iconName="xmark"
                  className="text-sm leading-4 text-neutral-300 hover:text-neutral-400"
                  onClick={() => deleteFilter(badge.key, setFilter)}
                />
              </Button>
            </Tooltip>
          ))}
        <div className="flex flex-row-reverse">
          {badges
            .filter((badge) => priorityKeys.has(badge.key))
            .slice()
            .reverse()
            .map((badge, index, array) => {
              const isFirst = index === array.length - 1
              const isLast = index === 0

              return (
                <div key={badge.key} className={clsx('group relative flex', { 'right-2.5': !isFirst })}>
                  <Button
                    variant="surface"
                    color="neutral"
                    size="xs"
                    className={clsx('justify-center gap-1.5', {
                      'rounded-l-full rounded-r-none border-r-0 pr-4': isFirst && !isLast,
                      'rounded-full': isFirst && isLast,
                      'rounded-l-none rounded-r-full border-l-0 pl-4': isLast && !isFirst,
                      'rounded-none border-x-0 pl-4 pr-4': !isFirst && !isLast,
                    })}
                    style={
                      !isLast
                        ? { clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)' }
                        : undefined
                    }
                  >
                    {badge.displayedName}: {badge.value} {isFirst ? 'IsFirst' : isLast ? 'IsLast' : 'None'}
                    <button onClick={() => deleteFilter(badge.key, setFilter)} aria-label="Delete filter">
                      <Icon iconName="xmark" className="text-sm leading-4 text-neutral-300 hover:text-neutral-400" />
                    </button>
                  </Button>
                  {!isLast && (
                    <svg
                      className="pointer-events-none absolute right-0 top-0 h-6 w-[11px]"
                      viewBox="0 0 11 25"
                      fill="none"
                    >
                      <path
                        className="stroke-neutral-250 group-hover:stroke-neutral-300"
                        d="M0.390869 0.311768L9.96074 12.3118L0.390869 24.3118"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
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
