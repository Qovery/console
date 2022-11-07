import { differenceInMinutes, format, formatDistanceToNowStrict } from 'date-fns'

export const timeAgo = (date: Date) => formatDistanceToNowStrict(date)

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

// 10:10
export const dateToHours = (date: string) => {
  const d = new Date(date)
  return `${addZero(d.getUTCHours())}:${addZero(d.getUTCMinutes())}`
}

// 2022-09-10 10:10:20
export function dateYearMonthDayHourMinuteSecond(date: Date, withTime = true) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${
    withTime ? `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}` : ''
  } `
}

// 15 Sep, 10:23:20
export const dateFullFormat = (date: string) => {
  return format(new Date(date), 'dd MMM, hh:mm:ss')
}
