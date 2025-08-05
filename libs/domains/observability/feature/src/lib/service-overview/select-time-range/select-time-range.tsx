import { subDays } from 'date-fns'
import { useState } from 'react'
import { Button, DatePicker, Icon, InputSelectSmall } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'
import { type TimeRangeOption, timeRangeOptions } from '../util-filter/time-range'

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
    setHasCalendarValue,
    hasCalendarValue,
    useLocalTime,
    resetChartZoom,
  } = useServiceOverviewContext()
  const [isOpenTimestamp, setIsOpenTimestamp] = useState(false)

  const startDateValid = startTimestamp && !isNaN(new Date(startTimestamp).getTime())
  const endDateValid = endTimestamp && !isNaN(new Date(endTimestamp).getTime())

  return (
    <div className="flex">
      <DatePicker
        key={startDate + endDate}
        onChange={(startDate, endDate) => {
          resetChartZoom()
          setStartDate(startDate.toISOString())
          setEndDate(endDate.toISOString())
          setIsOpenTimestamp(false)
          setHasCalendarValue(true)
        }}
        isOpen={isOpenTimestamp}
        maxDate={new Date()}
        minDate={subDays(new Date(), 30)}
        defaultDates={startDateValid && endDateValid ? [new Date(startTimestamp), new Date(endTimestamp)] : undefined}
        showTimeInput
        onClickOutside={() => setIsOpenTimestamp(!isOpenTimestamp)}
      >
        {!hasCalendarValue ? (
          <Button
            type="button"
            variant="surface"
            color="neutral"
            className="rounded-r-none border-r-0"
            size="md"
            onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}
          >
            <Icon iconName="calendar" iconStyle="regular" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="surface"
            color="neutral"
            size="md"
            onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}
          >
            from: {dateFullFormat(startDate, useLocalTime ? undefined : 'UTC', 'dd MMM, HH:mm:ss')} - to:{' '}
            {dateFullFormat(endDate, useLocalTime ? undefined : 'UTC', 'dd MMM, HH:mm:ss')}
            <span
              className="relative left-1 px-1 py-1"
              role="button"
              onClick={(event) => {
                event.stopPropagation()
                setHasCalendarValue(false)
                handleTimeRangeChange('30m')
              }}
            >
              <Icon iconName="xmark" />
            </span>
          </Button>
        )}
      </DatePicker>
      {!hasCalendarValue && (
        <InputSelectSmall
          name="time-range"
          className="w-[180px]"
          inputClassName="rounded-l-none"
          items={timeRangeOptions}
          defaultValue={timeRange}
          onChange={(e) => handleTimeRangeChange(e as TimeRangeOption)}
        />
      )}
    </div>
  )
}
