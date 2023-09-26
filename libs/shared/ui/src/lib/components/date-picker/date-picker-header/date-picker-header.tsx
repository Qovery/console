import { getMonth, getYear } from 'date-fns'
import { type ReactDatePickerCustomHeaderProps } from 'react-datepicker'
import ButtonLegacy from '../../buttons/button-legacy/button-legacy'
import IconFa from '../../icon-fa/icon-fa'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'

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
    <div className="flex justify-between mb-5">
      <div className="text-neutral-400 text-sm font-medium">
        <span className="mr-1">{months[getMonth(date)]}</span>
        <span>{getYear(date)}</span>
      </div>
      <div className="flex">
        <ButtonLegacy
          className="inline-flex items-center justify-center text-sm w-5 h-5 mr-2 transition-colors text-neutral-400 hover:text-brand-500 disabled:text-neutral-100"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          data-testid="date-picker-header-previous-btn"
        >
          <IconFa name={IconAwesomeEnum.CHEVRON_LEFT} />
        </ButtonLegacy>
        <ButtonLegacy
          className="inline-flex items-center justify-center text-sm w-5 h-5 transition-colors text-neutral-400 hover:text-brand-500 disabled:text-neutral-100"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          data-testid="date-picker-header-next-btn"
        >
          <IconFa name={IconAwesomeEnum.CHEVRON_RIGHT} />
        </ButtonLegacy>
      </div>
    </div>
  )
}

export default DatePickerHeader
