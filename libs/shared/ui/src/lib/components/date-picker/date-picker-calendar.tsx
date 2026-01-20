import { useEffect, useRef, useState } from 'react'
import DatePickerLib, { type ReactDatePickerCustomHeaderProps } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Button from '../button/button'
import Icon from '../icon/icon'
import InputTextSmall from '../inputs/input-text-small/input-text-small'
import DatePickerHeader from './date-picker-header/date-picker-header'
import { type DatePickerCalendarProps } from './date-picker.types'
import {
  clampEndDateForMaxRange,
  formatDateInput,
  getCombinedDateTime,
  getDateTimeInputErrors,
  validateDate,
  validateTime,
} from './date-picker.utils'

export function DatePickerCalendar({
  onChange,
  minDate,
  maxDate,
  showTimeInput,
  defaultDates,
  onClickOutside,
  useLocalTime = false,
  maxRangeInDays,
  showTimezoneSelect,
  onTimezoneChange,
  onRangeSelection,
}: DatePickerCalendarProps) {
  const [startDate, setStartDate] = useState<Date | null>(defaultDates ? defaultDates[0] : null)
  const [endDate, setEndDate] = useState<Date | null>(defaultDates ? defaultDates[1] : null)
  const today = formatDateInput(new Date(), useLocalTime)
  const [startDateText, setStartDateText] = useState(today)
  const [startTimeText, setStartTimeText] = useState('00:00')
  const [endDateText, setEndDateText] = useState(today)
  const [endTimeText, setEndTimeText] = useState('23:59')
  const [startDateError, setStartDateError] = useState('')
  const [startTimeError, setStartTimeError] = useState('')
  const [endDateError, setEndDateError] = useState('')
  const [endTimeError, setEndTimeError] = useState('')
  const localTimeZone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
      return ''
    }
  })()
  const timezoneOptions = [
    { label: localTimeZone ? `Browser time (${localTimeZone})` : 'Browser time', value: 'local' },
    { label: 'UTC', value: 'utc' },
  ]
  const selectedTimezoneLabel =
    timezoneOptions.find((option) => option.value === (useLocalTime ? 'local' : 'utc'))?.label ?? ''

  const lastInteractionRef = useRef<'calendar' | 'input' | 'default'>('default')
  const previousUseLocalTimeRef = useRef(useLocalTime)

  useEffect(() => {
    if (!startDate || !endDate) return

    const useLocalTimeChanged = previousUseLocalTimeRef.current !== useLocalTime
    previousUseLocalTimeRef.current = useLocalTime

    if (lastInteractionRef.current === 'input' && !useLocalTimeChanged) {
      return
    }

    setStartDateText(formatDateInput(startDate, useLocalTime))
    setEndDateText(formatDateInput(endDate, useLocalTime))

    if (useLocalTime) {
      setStartTimeText(startDate.toTimeString().substring(0, 5))
      setEndTimeText(endDate.toTimeString().substring(0, 5))
    } else {
      setStartTimeText(startDate.toISOString().substring(11, 16))
      setEndTimeText(endDate.toISOString().substring(11, 16))
    }
  }, [endDate, startDate, useLocalTime])

  const handleChange = (dates: [Date | null, Date | null] | null) => {
    if (!dates) {
      setStartDate(null)
      setEndDate(null)
      return
    }

    const [start, end] = dates
    lastInteractionRef.current = 'calendar'
    onRangeSelection?.()

    if (maxRangeInDays && start && end) {
      const adjustedEndDateOnly = clampEndDateForMaxRange({ startDate: start, endDate: end, maxRangeInDays })
      if (adjustedEndDateOnly && adjustedEndDateOnly.getTime() !== end.getTime()) {
        const adjustedEndDate = new Date(
          adjustedEndDateOnly.getFullYear(),
          adjustedEndDateOnly.getMonth(),
          adjustedEndDateOnly.getDate(),
          end.getHours(),
          end.getMinutes(),
          end.getSeconds()
        )
        setStartDate(start)
        setEndDate(adjustedEndDate)
        setStartDateText(formatDateInput(start, useLocalTime))
        setEndDateText(formatDateInput(adjustedEndDate, useLocalTime))
        setStartDateError('')
        setEndDateError('')
        return
      }
    }

    setStartDate(start)
    setEndDate(end)

    if (start) {
      setStartDateText(formatDateInput(start, useLocalTime))
      setStartDateError('')
    }
    if (end) {
      setEndDateText(formatDateInput(end, useLocalTime))
      setEndDateError('')
    } else {
      setEndDateText('')
      setEndDateError('')
    }
  }

  useEffect(() => {
    if (defaultDates) {
      lastInteractionRef.current = 'default'
      setStartDate(defaultDates[0])
      setEndDate(defaultDates[1])
    }
  }, [defaultDates])

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    const datepickerContainer = target.closest('.date-picker')

    if (datepickerContainer) {
      return
    }

    onClickOutside?.()
  }

  const getDayClassName = (date: Date): string => {
    if (!startDate || !maxRangeInDays) return ''

    if (minDate && date < minDate) {
      return ''
    }

    if (maxDate && date > maxDate) {
      return ''
    }

    const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (normalizedDate >= normalizedStartDate) {
      const timeDiff = normalizedDate.getTime() - normalizedStartDate.getTime()
      const daysDifference = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

      if (daysDifference >= maxRangeInDays) {
        return 'react-datepicker__day--disabled react-datepicker__day--max-range-exceeded'
      }
    }

    return ''
  }

  const handleInputChange = (type: 'startDate' | 'startTime' | 'endDate' | 'endTime', value: string) => {
    lastInteractionRef.current = 'input'
    const nextStartDateText = type === 'startDate' ? value : startDateText
    const nextStartTimeText = type === 'startTime' ? value : startTimeText
    const nextEndDateText = type === 'endDate' ? value : endDateText
    const nextEndTimeText = type === 'endTime' ? value : endTimeText

    switch (type) {
      case 'startDate':
        setStartDateText(value)
        break
      case 'startTime':
        setStartTimeText(value)
        break
      case 'endDate':
        setEndDateText(value)
        break
      case 'endTime':
        setEndTimeText(value)
        break
    }

    const { startDateError, startTimeError, endDateError, endTimeError } = getDateTimeInputErrors({
      startDateText: nextStartDateText,
      startTimeText: nextStartTimeText,
      endDateText: nextEndDateText,
      endTimeText: nextEndTimeText,
      minDate,
      maxDate,
      useLocalTime,
      activeField: type === 'startDate' || type === 'startTime' ? 'start' : 'end',
    })

    setStartDateError(startDateError)
    setStartTimeError(startTimeError)
    setEndDateError(endDateError)
    setEndTimeError(endTimeError)

    let didUpdateRange = false

    if (!startDateError && !startTimeError) {
      setStartDate(getCombinedDateTime(nextStartDateText, nextStartTimeText, useLocalTime))
      didUpdateRange = true
    }

    if (!endDateError && !endTimeError) {
      setEndDate(getCombinedDateTime(nextEndDateText, nextEndTimeText, useLocalTime))
      didUpdateRange = true
    }

    if (didUpdateRange) {
      onRangeSelection?.()
    }
  }

  const handleApply = () => {
    try {
      if (showTimeInput) {
        const hasErrors =
          !validateDate(startDateText) ||
          !validateTime(startTimeText) ||
          !validateDate(endDateText) ||
          !validateTime(endTimeText)

        if (hasErrors) {
          setStartDateError(validateDate(startDateText) ? '' : 'Invalid date format (YYYY-MM-DD)')
          setStartTimeError(validateTime(startTimeText) ? '' : 'Invalid time format (HH:MM)')
          setEndDateError(validateDate(endDateText) ? '' : 'Invalid date format (YYYY-MM-DD)')
          setEndTimeError(validateTime(endTimeText) ? '' : 'Invalid time format (HH:MM)')
          return
        }

        if (startDateError || startTimeError || endDateError || endTimeError) {
          return
        }

        const startDateTime = getCombinedDateTime(startDateText, startTimeText, useLocalTime)
        const endDateTime = getCombinedDateTime(endDateText, endTimeText, useLocalTime)

        if (maxRangeInDays) {
          const adjustedEndDateOnly = clampEndDateForMaxRange({
            startDate: startDateTime,
            endDate: endDateTime,
            maxRangeInDays,
          })

          if (adjustedEndDateOnly && adjustedEndDateOnly.getTime() !== endDateTime.getTime()) {
            const adjustedEndDateTime = new Date(
              adjustedEndDateOnly.getFullYear(),
              adjustedEndDateOnly.getMonth(),
              adjustedEndDateOnly.getDate(),
              endDateTime.getHours(),
              endDateTime.getMinutes(),
              endDateTime.getSeconds()
            )

            onChange(startDateTime, adjustedEndDateTime)
            return
          }
        }

        onChange(startDateTime, endDateTime)
      } else if (startDate && endDate) {
        if (maxRangeInDays) {
          const adjustedEndDateOnly = clampEndDateForMaxRange({ startDate, endDate, maxRangeInDays })
          if (adjustedEndDateOnly && adjustedEndDateOnly.getTime() !== endDate.getTime()) {
            onChange(startDate, adjustedEndDateOnly)
            return
          }
        }

        onChange(startDate, endDate)
      }
    } catch (error) {
      console.error('Error combining date and time:', error)
    }
  }

  return (
    <div>
      <DatePickerLib
        selected={startDate}
        onChange={handleChange}
        startDate={startDate}
        endDate={endDate}
        renderCustomHeader={(params: ReactDatePickerCustomHeaderProps) => <DatePickerHeader {...params} />}
        maxDate={maxDate}
        minDate={minDate}
        dayClassName={getDayClassName}
        showDisabledMonthNavigation
        selectsRange
        useWeekdaysShort
        inline
        onClickOutside={handleClickOutside}
      />
      <div className="border-t border-neutral px-4 py-3">
        {showTimeInput && (
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm text-neutral">Start</p>
                {(startDateError || startTimeError) && (
                  <span className="text-xs text-negative">{startDateError || startTimeError}</span>
                )}
              </div>
              <div className="flex gap-2">
                <InputTextSmall
                  label="Date"
                  name="start-date"
                  type="text"
                  className="flex-1"
                  value={startDateText}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
                <InputTextSmall
                  label="Time"
                  name="start-time"
                  type="text"
                  className="w-20"
                  value={startTimeText}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm text-neutral">End</p>
                {(endDateError || endTimeError) && (
                  <span className="text-xs text-negative">{endDateError || endTimeError}</span>
                )}
              </div>
              <div className="flex gap-2">
                <InputTextSmall
                  label="Date"
                  name="end-date"
                  type="text"
                  className="flex-1"
                  value={endDateText}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
                <InputTextSmall
                  label="Time"
                  name="end-time"
                  type="text"
                  className="w-20"
                  value={endTimeText}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        <Button
          type="button"
          className={`${showTimeInput ? 'mt-4' : ''} ${showTimezoneSelect ? 'mb-2' : ''} w-full justify-center`}
          size="md"
          onClick={handleApply}
        >
          Apply
        </Button>
        {showTimezoneSelect && (
          <div className="relative my-1 flex w-full items-center justify-center gap-1 text-xs font-medium  text-neutral-subtle transition-colors hover:text-neutral">
            <span>{selectedTimezoneLabel}</span>
            <Icon iconName="chevron-down" iconStyle="regular" className="pointer-events-none text-xs" />
            <select
              name="timezone"
              value={useLocalTime ? 'local' : 'utc'}
              className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
              onChange={(event) => {
                onTimezoneChange?.(event.target.value === 'local')
              }}
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

export default DatePickerCalendar
