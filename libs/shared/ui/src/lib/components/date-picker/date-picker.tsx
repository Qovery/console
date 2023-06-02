import { PropsWithChildren, useCallback, useRef, useState } from 'react'
import DatePickerLib, {
  CalendarContainer,
  CalendarContainerProps,
  ReactDatePickerCustomHeaderProps,
} from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Button from '../buttons/button/button'
import InputText from '../inputs/input-text/input-text'
import DatePickerHeader from './date-picker-header/date-picker-header'

export interface DatePickerProps {
  onChange: (startDate: Date, endDate: Date) => void
  isOpen: boolean
  minDate?: Date
  maxDate?: Date
  showTimeInput?: boolean
  defaultDates?: [Date, Date]
}

export function DatePicker({
  onChange,
  isOpen,
  minDate,
  maxDate,
  showTimeInput,
  defaultDates,
  children,
}: PropsWithChildren<DatePickerProps>) {
  const [startDate, setStartDate] = useState<Date>(defaultDates ? defaultDates[0] : new Date())
  const [endDate, setEndDate] = useState<Date>(defaultDates ? defaultDates[1] : new Date())
  const inputStartTime = useRef<HTMLInputElement>(null)
  const inputEndTime = useRef<HTMLInputElement>(null)

  const handleChange = useCallback((dates: [Date, Date]) => {
    const [start, end] = dates

    setStartDate(start)
    setEndDate(end)
  }, [])

  const getCombinedDateTime = useCallback((date: Date, time: string) => {
    const [hours, minutes] = time.split(':')
    const combinedDateTime = new Date(date)
    combinedDateTime.setHours(parseInt(hours, 10))
    combinedDateTime.setMinutes(parseInt(minutes, 10))
    return combinedDateTime
  }, [])

  const renderContainer = ({ children }: CalendarContainerProps) => {
    return (
      <CalendarContainer className="bg-white inline-flex rounded relative mt-2 -ml-2 shadow-[0_0_32px_rgba(0,0,0,0.08)]">
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
        <div className="flex flex-col relative p-5">
          {children}
          {showTimeInput && (
            <div className="flex mt-3">
              <InputText
                label="Start time"
                name="start-time"
                type="time"
                className="flex-grow mr-2"
                customRef={inputStartTime}
                value="00:00"
              />
              <InputText
                label="End time"
                name="end-time"
                type="time"
                className="flex-grow"
                customRef={inputEndTime}
                value="23:59"
              />
            </div>
          )}
          <Button
            className="mt-5"
            onClick={() =>
              onChange(
                getCombinedDateTime(startDate, inputStartTime?.current?.value || '00:00'),
                getCombinedDateTime(endDate, inputEndTime?.current?.value || '23:59')
              )
            }
          >
            Apply
          </Button>
        </div>
      </CalendarContainer>
    )
  }

  return (
    <div className="relative">
      {children}
      {isOpen && (
        <div className={`date-picker absolute z-50 mt-2.5 ${isOpen ? 'date-picker--open' : ''}`}>
          <DatePickerLib
            withPortal
            selected={startDate}
            onChange={handleChange}
            startDate={startDate}
            endDate={endDate}
            renderCustomHeader={(params: ReactDatePickerCustomHeaderProps) => <DatePickerHeader {...params} />}
            calendarContainer={renderContainer}
            maxDate={maxDate}
            minDate={minDate}
            showDisabledMonthNavigation
            selectsRange
            useWeekdaysShort
            inline
          />
        </div>
      )}
    </div>
  )
}

export default DatePicker
