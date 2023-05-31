import { useState } from 'react'
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
}

export function DatePicker({ onChange }: DatePickerProps) {
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>()

  const handleChange = (dates: [Date, Date]) => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  const renderContainer = ({ children }: CalendarContainerProps) => {
    return (
      <CalendarContainer className="date-picker bg-white inline-flex rounded relative mt-2 -ml-2">
        <svg
          className="absolute -top-[6px] left-3"
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
    <DatePickerLib
      withPortal
      selected={startDate}
      onChange={handleChange}
      startDate={startDate}
      endDate={endDate}
      renderCustomHeader={(params: ReactDatePickerCustomHeaderProps) => <DatePickerHeader {...params} />}
      calendarContainer={renderContainer}
      selectsRange
      useWeekdaysShort
      inline
    />
  )
}

export default DatePicker
