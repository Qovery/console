import { differenceInMinutes, formatDistanceToNowStrict, getDaysInMonth } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'

export const timeAgo = (date: Date, compact = false) => {
  if (compact) {
    const distance = formatDistanceToNowStrict(date, { addSuffix: false })
    return distance
      .replace(/\s/g, '')
      .replace(/seconds?/, 's')
      .replace(/minutes?/, 'm')
      .replace(/hours?/, 'h')
      .replace(/days?/, 'd')
      .replace(/months?/, 'mo')
      .replace(/years?/, 'y')
  }
  return formatDistanceToNowStrict(date)
}

export const dateDifferenceMinutes = (firstDate?: Date, secondDate?: Date) => {
  return firstDate && secondDate && differenceInMinutes(firstDate, secondDate)
}

const addZero = (time: number) => (time < 10 ? `0${time}` : time)

export function dateDifference(firstDate: Date, secondDate: Date) {
  let difference = new Date(firstDate).getTime() - new Date(secondDate).getTime()

  const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24)
  difference -= daysDifference * 1000 * 60 * 60 * 24

  const hoursDifference = Math.floor(difference / 1000 / 60 / 60)
  difference -= hoursDifference * 1000 * 60 * 60

  const minutesDifference = Math.floor(difference / 1000 / 60)
  difference -= minutesDifference * 1000 * 60

  const secondsDifference = Math.floor(difference / 1000)

  return `${addZero(hoursDifference)}:${addZero(minutesDifference)}:${addZero(secondsDifference)}`
}

const formatInTimeZone = (date: Date, fmt: string, tz: string) =>
  format(utcToZonedTime(date, tz), fmt, { timeZone: tz })

// 10:10
export const dateToHours = (date: string) => {
  const d = new Date(date)
  return `${addZero(d.getUTCHours())}:${addZero(d.getUTCMinutes())}`
}

// 2022-09-10 10:10:20
export function dateYearMonthDayHourMinuteSecond(date: Date, withTime = true, withSecond = true) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  const second = date.getSeconds().toString().padStart(2, '0')

  return `${year}-${month}-${day}${withTime ? ` ${hour}:${minute}${withSecond ? `:${second}` : ''}` : ''}`
}

// 15 Sep, 10:23:20
export const dateFullFormat = (date: string | number, timeZone?: string, customFormat = 'dd MMM, Y, HH:mm:ss') => {
  return formatInTimeZone(
    new Date(date),
    customFormat,
    timeZone ? timeZone : Intl.DateTimeFormat().resolvedOptions().timeZone
  )
}

export const dateMediumLocalFormat = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

export const dateToFormat = (date: string, format: string) => {
  return formatInTimeZone(new Date(date), format, 'UTC')
}

export function convertDatetoTimestamp(strDate: string) {
  const datum = Date.parse(strDate)
  return datum / 1000
}

// Mon, 16 Oct 2023 13:27:34 GMT
// Standard full format used in HTML tooltip and title attribute
export function dateUTCString(date: string | number) {
  return new Date(date).toUTCString()
}

// Set day of the month in a given day, limited to max number of days in month
export function setDayOfTheMonth(date: Date, dayOfTheMonth: number) {
  date.setMonth(date.getMonth(), Math.min(dayOfTheMonth, getDaysInMonth(date)))
  return date
}

// Format ISO 8601 Duration to HH:mm:ss
export function formatDuration(isoDuration: string): string {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/
  const matches = isoDuration.match(regex)

  if (!matches) {
    throw new Error('Invalid ISO 8601 duration format')
  }

  const hours = parseInt(matches[1] || '0', 10)
  const minutes = parseInt(matches[2] || '0', 10)
  const seconds = Math.floor(parseFloat(matches[3] || '0'))

  return `${addZero(hours)}:${addZero(minutes)}:${addZero(seconds)}`
}

// Format ISO 8601 Duration to mm:ss
export function formatDurationMinutesSeconds(isoDuration: string): string {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/
  const matches = isoDuration.match(regex)

  if (!matches) {
    throw new Error('Invalid ISO 8601 duration format')
  }

  const hoursInMinutes = parseInt(matches[1] || '0', 10) * 60
  const minutes = parseInt(matches[2] || '0', 10) + hoursInMinutes
  const seconds = Math.floor(parseFloat(matches[3] || '0'))

  if (minutes === 0) {
    return `${seconds}s`
  }

  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
}
