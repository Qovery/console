import { getMonth, getYear } from 'date-fns'
import { type ReactDatePickerCustomHeaderProps } from 'react-datepicker'
import { Icon } from '../../icon/icon'

export type DatePickerHeaderProps = Omit<
  ReactDatePickerCustomHeaderProps,
  | 'monthDate'
  | 'changeYear'
  | 'changeMonth'
  | 'customHeaderCount'
  | 'decreaseYear'
  | 'increaseYear'
  | 'prevYearButtonDisabled'
  | 'nextYearButtonDisabled'
>

export function DatePickerHeader({
  date,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: DatePickerHeaderProps) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return (
    <div className="mb-5 flex justify-between">
      <div className="text-sm font-medium text-neutral-400">
        <span className="mr-1">{months[getMonth(date)]}</span>
        <span>{getYear(date)}</span>
      </div>
      <div className="flex">
        <button
          className="mr-2 inline-flex h-5 w-5 items-center justify-center text-sm text-neutral-400 transition-colors hover:text-brand-500 disabled:text-neutral-100"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          data-testid="date-picker-header-previous-btn"
        >
          <Icon iconName="chevron-left" />
        </button>
        <button
          className="inline-flex h-5 w-5 items-center justify-center text-sm text-neutral-400 transition-colors hover:text-brand-500 disabled:text-neutral-100"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          data-testid="date-picker-header-next-btn"
        >
          <Icon iconName="chevron-right" />
        </button>
      </div>
    </div>
  )
}

export default DatePickerHeader
