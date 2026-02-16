import { subDays } from 'date-fns'
import { type Dispatch, type MouseEvent, type SetStateAction, useEffect, useState } from 'react'
import { convertDatetoTimestamp } from '@qovery/shared/util-dates'
import { Button } from '../../button/button'
import { DatePicker } from '../../date-picker/date-picker'
import Icon from '../../icon/icon'
import { type TableFilterProps } from '../table'

const ALL = 'ALL'

export interface SelectedTimestamps {
  automaticallySelected: boolean
  fromTimestamp?: Date
  toTimestamp?: Date
}

export interface TableHeadDatePickerData {
  retentionDays: number
  maxRangeInDays?: number
  timestamps: SelectedTimestamps
}

export interface TableHeadDatePickerFilterProps {
  title: string
  classNameTitle?: string
  datePickerData: TableHeadDatePickerData
  filter: TableFilterProps[]
  setFilter: Dispatch<SetStateAction<TableFilterProps[]>>
}

function getDefaultDates(timestamps: SelectedTimestamps): [Date, Date] | undefined {
  if (timestamps.fromTimestamp && timestamps.toTimestamp) {
    return [timestamps.fromTimestamp, timestamps.toTimestamp]
  }
  return undefined
}

/**
 * @deprecated Prefer TablePrimitives + tanstack-table for type-safety and documentation
 */
export function TableHeadDatePickerFilter({
  title,
  classNameTitle,
  datePickerData,
  filter,
  setFilter,
}: TableHeadDatePickerFilterProps) {
  const isDark = document.documentElement.classList.contains('dark')

  const [isOpenTimestamp, setIsOpenTimestamp] = useState(false)
  const [hasFilter, setHasFilter] = useState(false)
  const fromTimestampProperty = 'from_timestamp'
  const toTimestampProperty = 'to_timestamp'

  useEffect(() => {
    const hasFromTimeStampValue = filter.some((props) => props.key === fromTimestampProperty && props.value !== ALL)
    const hasToTimestampValue = filter.some((props) => props.key === toTimestampProperty && props.value !== ALL)
    setHasFilter(hasFromTimeStampValue && hasToTimestampValue)
  }, [filter])

  // Called when timestamp has been defined
  const onChangeTimestamp = (startDate: Date, endDate: Date) => {
    setIsOpenTimestamp(!isOpenTimestamp)
    setHasFilter(true)
    setFilter((prev) => [
      ...prev.filter(
        (currentValue) => currentValue.key !== fromTimestampProperty && currentValue.key !== toTimestampProperty
      ),
      {
        key: fromTimestampProperty,
        value: convertDatetoTimestamp(startDate.toString()).toString(),
      },
      {
        key: toTimestampProperty,
        value: convertDatetoTimestamp(endDate.toString()).toString(),
      },
    ])
  }

  // Called to clear the timestamp filter
  const cleanFilter = (event: MouseEvent) => {
    event.preventDefault()
    setFilter((prev) => [
      ...prev.filter(
        (currentValue) => currentValue.key !== fromTimestampProperty && currentValue.key !== toTimestampProperty
      ),
      {
        key: fromTimestampProperty,
        value: 'ALL',
      },
      {
        key: toTimestampProperty,
        value: 'ALL',
      },
    ])
    setHasFilter(false)
  }
  return (
    <div className={`flex items-center ${classNameTitle ?? ''}`}>
      <DatePicker
        key={datePickerData.timestamps.fromTimestamp ? datePickerData.timestamps.fromTimestamp.toString() : 'timestamp'}
        onChange={onChangeTimestamp}
        isOpen={isOpenTimestamp}
        maxDate={new Date()}
        minDate={subDays(new Date(), datePickerData.retentionDays)}
        defaultDates={getDefaultDates(datePickerData.timestamps)}
        showDateTimeInputs
        useLocalTime
        onClickOutside={() => setIsOpenTimestamp(!isOpenTimestamp)}
        maxRangeInDays={datePickerData.maxRangeInDays}
      >
        <div className="flex">
          {hasFilter ? (
            <>
              <Button
                type="button"
                size="xs"
                className="whitespace-nowrap pr-6"
                onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}
              >
                {title}
              </Button>
              <span
                role="button"
                className="relative -left-6 flex h-6 cursor-pointer items-center px-2 text-xs text-neutral-50"
                onClick={(event) => cleanFilter(event)}
              >
                <Icon iconName="xmark" />
              </span>
            </>
          ) : (
            <Button
              type="button"
              variant={isDark ? 'solid' : 'surface'}
              color="neutral"
              size="xs"
              className="items-center gap-1.5 bg-brand-500 text-white active:bg-brand-600 hover:[&:not(:active):not(:disabled)]:bg-brand-400"
              onClick={() => {
                setIsOpenTimestamp(!isOpenTimestamp)
              }}
            >
              {title}
              <Icon iconName="angle-down" className="relative top-[1px]" />
            </Button>
          )}
        </div>
      </DatePicker>
    </div>
  )
}

export default TableHeadDatePickerFilter
