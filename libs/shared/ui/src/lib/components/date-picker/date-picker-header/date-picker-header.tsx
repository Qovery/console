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
      <div className="text-sm font-medium text-neutral">
        <span className="mr-1">{months[getMonth(date)]}</span>
        <span>{getYear(date)}</span>
      </div>
      <div className="flex">
        <button
          className="inline-flex h-5 w-5 items-center justify-center text-sm text-neutral-subtle transition-colors hover:text-neutral disabled:text-neutral-disabled"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          data-testid="date-picker-header-previous-btn"
        >
          <Icon iconName="chevron-left" />
        </button>
        <button
          className="inline-flex h-5 w-5 items-center justify-center text-sm text-neutral-subtle transition-colors hover:text-neutral disabled:text-neutral-disabled"
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
