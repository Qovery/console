import { formatLocalDate, getCombinedDateTime, validateTime } from '../date-picker.utils'

export const areSameDates = (firstDate: Date | null, secondDate: Date | null) => {
  if (!firstDate || !secondDate) return firstDate === secondDate
  return firstDate.getTime() === secondDate.getTime()
}

export const getDateRangeKey = (dates?: [Date, Date]) => dates?.map((date) => date.getTime()).join('-') ?? ''

export const getTimeInputValue = (date: Date, useLocalTime: boolean) =>
  useLocalTime ? date.toTimeString().substring(0, 5) : date.toISOString().substring(11, 16)

// react-datepicker renders and returns days in browser local time. In UTC mode, shift dates so their local
// components match their UTC components, keeping the calendar grid aligned with the UTC date inputs.
export const toCalendarDate = <T extends Date | null | undefined>(date: T, useLocalTime: boolean): T => {
  if (!date || useLocalTime) return date

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  ) as T
}

// `date` is a calendar day from react-datepicker, so its local components are the picked day in both modes
export const mergeDateWithTimeText = ({
  date,
  timeText,
  useLocalTime,
}: {
  date: Date | null
  timeText: string
  useLocalTime: boolean
}) => {
  if (!date || !validateTime(timeText)) return date

  return getCombinedDateTime(formatLocalDate(date), timeText, useLocalTime)
}
