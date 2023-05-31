import { PropsWithChildren, useState } from 'react'
import DatePickerLib, {
  CalendarContainer,
  CalendarContainerProps,
  ReactDatePickerCustomHeaderProps,
} from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Button from '../buttons/button/button'
import DatePickerHeader from './date-picker-header/date-picker-header'

export interface DatePickerProps {
  onChange: (startDate: Date, endDate?: Date) => void
  isOpen: boolean
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({ onChange, isOpen, minDate, maxDate, children }: PropsWithChildren<DatePickerProps>) {
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>()

  const handleChange = (dates: [Date, Date]) => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  const renderContainer = ({ children }: CalendarContainerProps) => {
    return (
      <CalendarContainer className="date-picker bg-white inline-flex rounded relative mt-2 -ml-2 shadow-[0_0_32px_rgba(0,0,0,0.08)]">
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
          <Button className="mt-5" onClick={() => onChange(startDate, endDate)}>
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
        <div className="absolute z-50 mt-2.5">
          <DatePickerLib
            withPortal
            portalId="root-portal"
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
