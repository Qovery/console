import { formatDateInput, getCombinedDateTime, validateTime } from '../date-picker.utils'

export const areSameDates = (firstDate: Date | null, secondDate: Date | null) => {
  if (!firstDate || !secondDate) return firstDate === secondDate
  return firstDate.getTime() === secondDate.getTime()
}

export const getDateRangeKey = (dates?: [Date, Date]) => dates?.map((date) => date.getTime()).join('-') ?? ''

export const getTimeInputValue = (date: Date, useLocalTime: boolean) =>
  useLocalTime ? date.toTimeString().substring(0, 5) : date.toISOString().substring(11, 16)

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

  return getCombinedDateTime(formatDateInput(date, useLocalTime), timeText, useLocalTime)
}
