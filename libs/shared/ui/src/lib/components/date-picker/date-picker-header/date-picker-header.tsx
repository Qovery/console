import { getMonth, getYear } from 'date-fns'
// import { useState } from 'react'
import { ReactDatePickerCustomHeaderProps } from 'react-datepicker'
import IconFa from '../../icon-fa/icon-fa'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'

export function DatePickerHeader({
  date,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: ReactDatePickerCustomHeaderProps) {
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
      <div className="text-text-700 text-sm font-medium">
        <span className="mr-1">{months[getMonth(date)]}</span>
        <span>{getYear(date)}</span>
      </div>
      <div className="flex">
        <button
          className="inline-flex items-center justify-center text-sm w-5 h-5 mr-2 transition-colors text-text-700 hover:text-brand-500"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
        >
          <IconFa name={IconAwesomeEnum.CHEVRON_LEFT} />
        </button>
        <button
          className="inline-flex items-center justify-center text-sm w-5 h-5 transition-colors text-text-700 hover:text-brand-500"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
        >
          <IconFa name={IconAwesomeEnum.CHEVRON_RIGHT} />
        </button>
      </div>
    </div>
  )
}

export default DatePickerHeader
