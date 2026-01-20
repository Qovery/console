import { subDays } from 'date-fns'
import { useState } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'
import { DatePicker, DatePickerTrigger, InputSelectSmall } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { type TimeRangeOption, timeRangeOptions } from '../../../util-filter/time-range'

export function SelectTimeRange() {
  const {
    setStartDate,
    setEndDate,
    startDate,
    endDate,
    endTimestamp,
    startTimestamp,
    handleTimeRangeChange,
    timeRange,
    useLocalTime,
    resetChartZoom,
    setIsDatePickerOpen,
    lastDropdownTimeRange,
    isLiveUpdateEnabled,
    setIsLiveUpdateEnabled,
  } = useDashboardContext()
  const [queryTimeRange, setQueryTimeRange] = useQueryParam('timeRange', StringParam)
  const [isOpenTimestamp, setIsOpenTimestamp] = useState(false)

  const startDateValid = startTimestamp && !isNaN(new Date(startTimestamp).getTime())
  const endDateValid = endTimestamp && !isNaN(new Date(endTimestamp).getTime())

  return (
    <div className="flex">
      <DatePicker
        onChange={(startDate, endDate) => {
          resetChartZoom()
          setStartDate(startDate.toISOString())
          setEndDate(endDate.toISOString())
          setIsOpenTimestamp(false)
          setIsDatePickerOpen(false)
          setQueryTimeRange('custom')
        }}
        isOpen={isOpenTimestamp}
        maxDate={new Date()}
        minDate={subDays(new Date(), 30)}
        defaultDates={startDateValid && endDateValid ? [new Date(startTimestamp), new Date(endTimestamp)] : undefined}
        showTimeInput
        useLocalTime={useLocalTime}
        onClickOutside={() => {
          setIsOpenTimestamp(!isOpenTimestamp)
          setIsDatePickerOpen(!isOpenTimestamp)
        }}
      >
        {queryTimeRange !== 'custom' ? (
          <DatePickerTrigger
            mode="icon"
            className="rounded-r-none border-r-0 active:scale-100"
            onClick={() => {
              setIsOpenTimestamp(!isOpenTimestamp)
              setIsDatePickerOpen(!isOpenTimestamp)
            }}
          />
        ) : (
          <DatePickerTrigger
            mode="range"
            className="active:scale-100"
            onClick={() => {
              setIsOpenTimestamp(!isOpenTimestamp)
              setIsDatePickerOpen(!isOpenTimestamp)
            }}
            onClear={() => {
              handleTimeRangeChange(lastDropdownTimeRange)
              setQueryTimeRange(lastDropdownTimeRange)
            }}
          >
            from: {dateFullFormat(startDate, useLocalTime ? undefined : 'UTC', 'dd MMM, HH:mm:ss')} - to:{' '}
            {dateFullFormat(endDate, useLocalTime ? undefined : 'UTC', 'dd MMM, HH:mm:ss')}
          </DatePickerTrigger>
        )}
      </DatePicker>
      {queryTimeRange !== 'custom' && (
        <InputSelectSmall
          name="time-range"
          className="w-[180px]"
          inputClassName="rounded-l-none"
          items={timeRangeOptions}
          defaultValue={timeRange}
          onChange={(e) => {
            if (isLiveUpdateEnabled && e !== '15m' && e !== '5m' && e !== '30m' && e !== '1h') {
              setIsLiveUpdateEnabled(false)
            }
            handleTimeRangeChange(e as TimeRangeOption)
          }}
        />
      )}
    </div>
  )
}
