import { type Value } from '@qovery/shared/interfaces'

export interface DatePickerPeriodOption extends Value {
  isLocked?: boolean
}

export interface DatePickerBaseProps {
  onChange: (startDate: Date, endDate: Date) => void
  minDate?: Date
  maxDate?: Date
  showDateTimeInputs?: boolean
  defaultDates?: [Date, Date]
  onClickOutside?: () => void
  useLocalTime?: boolean
  maxRangeInDays?: number
  showTimezoneSelect?: boolean
  onTimezoneChange?: (useLocalTime: boolean) => void
  timezoneLabel?: string
  showCalendar?: boolean
  showPeriodSelect?: boolean
  periodOptions?: DatePickerPeriodOption[]
  periodValue?: string
  onPeriodChange?: (value: string) => void
  lockedLabel?: string
}

export interface DatePickerCalendarProps
  extends Omit<
    DatePickerBaseProps,
    'showCalendar' | 'showPeriodSelect' | 'periodOptions' | 'periodValue' | 'onPeriodChange' | 'lockedLabel'
  > {
  onRangeSelection?: () => void
}

export interface DatePickerProps extends DatePickerBaseProps {
  isOpen: boolean
}
