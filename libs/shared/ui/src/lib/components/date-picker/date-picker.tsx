import { type PropsWithChildren, useEffect, useState } from 'react'
import DatePickerLib, { type ReactDatePickerCustomHeaderProps } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Button from '../button/button'
import InputText from '../inputs/input-text/input-text'
import DatePickerHeader from './date-picker-header/date-picker-header'

export interface DatePickerProps {
  onChange: (startDate: Date, endDate: Date) => void
  isOpen: boolean
  minDate?: Date
  maxDate?: Date
  showTimeInput?: boolean
  defaultDates?: [Date, Date]
  onClickOutside?: () => void
}

export function DatePicker({
  onChange,
  isOpen,
  minDate,
  maxDate,
  showTimeInput,
  defaultDates,
  onClickOutside,
  children,
}: PropsWithChildren<DatePickerProps>) {
  const [startDate, setStartDate] = useState<Date | null>(defaultDates ? defaultDates[0] : null)
  const [endDate, setEndDate] = useState<Date | null>(defaultDates ? defaultDates[1] : null)
  const today = new Date().toISOString().split('T')[0]
  const [startDateText, setStartDateText] = useState(today)
  const [startTimeText, setStartTimeText] = useState('00:00')
  const [endDateText, setEndDateText] = useState(today)
  const [endTimeText, setEndTimeText] = useState('23:59')
  const [startDateError, setStartDateError] = useState('')
  const [startTimeError, setStartTimeError] = useState('')
  const [endDateError, setEndDateError] = useState('')
  const [endTimeError, setEndTimeError] = useState('')

  // Validation functions
  const validateDate = (dateStr: string): boolean => {
    if (!dateStr) return false
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateStr)) return false
    const date = new Date(dateStr)
    return date instanceof Date && !isNaN(date.getTime()) && dateStr === date.toISOString().split('T')[0]
  }

  const validateTime = (timeStr: string): boolean => {
    if (!timeStr) return false
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(timeStr)
  }

  // Initialize text inputs when defaultDates change
  useEffect(() => {
    if (defaultDates && defaultDates[0] && defaultDates[1]) {
      const startDate = defaultDates[0]
      const endDate = defaultDates[1]
      setStartDateText(startDate.toISOString().split('T')[0])
      setStartTimeText(startDate.toTimeString().substring(0, 5))
      setEndDateText(endDate.toISOString().split('T')[0])
      setEndTimeText(endDate.toTimeString().substring(0, 5))
    }
  }, [defaultDates])

  const handleChange = (dates: [Date | null, Date | null] | null) => {
    if (!dates) {
      setStartDate(null)
      setEndDate(null)
      return
    }

    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  // Sync internal state with prop changes
  useEffect(() => {
    if (defaultDates) {
      setStartDate(defaultDates[0])
      setEndDate(defaultDates[1])
    }
  }, [defaultDates])

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    // Don't close if clicking anywhere within our datepicker container
    const target = event.target as HTMLElement
    const datepickerContainer = target.closest('.date-picker')

    if (datepickerContainer) {
      return // Click is within our datepicker, don't close
    }

    onClickOutside?.()
  }

  const getCombinedDateTime = (dateStr: string, timeStr: string) => {
    if (!validateDate(dateStr) || !validateTime(timeStr)) {
      throw new Error('Invalid date or time format')
    }
    const [hours, minutes] = timeStr.split(':')
    const combinedDateTime = new Date(dateStr)
    combinedDateTime.setHours(parseInt(hours, 10))
    combinedDateTime.setMinutes(parseInt(minutes, 10))
    return combinedDateTime
  }

  const handleInputChange = (type: 'startDate' | 'startTime' | 'endDate' | 'endTime', value: string) => {
    switch (type) {
      case 'startDate':
        setStartDateText(value)
        setStartDateError(validateDate(value) ? '' : 'Invalid date format (YYYY-MM-DD)')
        break
      case 'startTime':
        setStartTimeText(value)
        setStartTimeError(validateTime(value) ? '' : 'Invalid time format (HH:MM)')
        break
      case 'endDate':
        setEndDateText(value)
        setEndDateError(validateDate(value) ? '' : 'Invalid date format (YYYY-MM-DD)')
        break
      case 'endTime':
        setEndTimeText(value)
        setEndTimeError(validateTime(value) ? '' : 'Invalid time format (HH:MM)')
        break
    }
  }

  return (
    <div className="relative">
      {children}
      {isOpen && (
        <div className={`date-picker absolute z-10 mt-2.5 ${isOpen ? 'date-picker--open' : ''}`}>
          <div className="relative -ml-2 mt-2 inline-flex rounded bg-white shadow-[0_0_32px_rgba(0,0,0,0.08)]">
            <svg
              className="absolute -top-[6px] left-3 shadow-lg"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="6"
              fill="none"
              viewBox="0 0 18 6"
            >
              <path fill="#fff" d="M18 6H0L8.445.37a1 1 0 011.11 0L18 6z"></path>
            </svg>
            <div className="relative flex flex-col p-5">
              <DatePickerLib
                selected={startDate}
                onChange={handleChange}
                startDate={startDate}
                endDate={endDate}
                renderCustomHeader={(params: ReactDatePickerCustomHeaderProps) => <DatePickerHeader {...params} />}
                maxDate={maxDate}
                minDate={minDate}
                showDisabledMonthNavigation
                selectsRange
                useWeekdaysShort
                inline
                onClickOutside={handleClickOutside}
              />
              {showTimeInput && (
                <div className="mt-3 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-neutral-400">Start</h4>
                      {(startDateError || startTimeError) && (
                        <span className="text-xs text-red-500">{startDateError || startTimeError}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <InputText
                        label="Date"
                        name="start-date"
                        type="text"
                        className="flex-grow"
                        value={startDateText}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                      />
                      <InputText
                        label="Time"
                        name="start-time"
                        type="text"
                        className="flex-grow"
                        value={startTimeText}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-neutral-400">End</h4>
                      {(endDateError || endTimeError) && (
                        <span className="text-xs text-red-500">{endDateError || endTimeError}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <InputText
                        label="Date"
                        name="end-date"
                        type="text"
                        className="flex-grow"
                        value={endDateText}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                      />
                      <InputText
                        label="Time"
                        name="end-time"
                        type="text"
                        className="flex-grow"
                        value={endTimeText}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              <Button
                type="button"
                className="mt-5 justify-center"
                size="md"
                onClick={() => {
                  try {
                    if (showTimeInput) {
                      // Validate all inputs
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

                      const startDateTime = getCombinedDateTime(startDateText, startTimeText)
                      const endDateTime = getCombinedDateTime(endDateText, endTimeText)
                      onChange(startDateTime, endDateTime)
                    } else if (startDate && endDate) {
                      onChange(startDate, endDate)
                    }
                  } catch (error) {
                    console.error('Error combining date and time:', error)
                  }
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
