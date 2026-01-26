export const validateDate = (dateStr: string): boolean => {
  if (!dateStr) return false
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateStr)) return false
  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date.getTime()) && dateStr === date.toISOString().split('T')[0]
}

export const validateTime = (timeStr: string): boolean => {
  if (!timeStr) return false
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(timeStr)
}

export const formatLocalDate = (date: Date): string => {
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  )
}

export const formatDateInput = (date: Date, useLocalTime: boolean): string => {
  return useLocalTime ? formatLocalDate(date) : date.toISOString().split('T')[0]
}

export const getCombinedDateTime = (dateStr: string, timeStr: string, useLocalTime: boolean): Date => {
  if (!validateDate(dateStr) || !validateTime(timeStr)) {
    throw new Error('Invalid date or time format')
  }

  if (useLocalTime) {
    return new Date(dateStr + 'T' + timeStr + ':00.000')
  }

  return new Date(dateStr + 'T' + timeStr + ':00.000Z')
}

export const getDateTimeInputErrors = ({
  startDateText,
  startTimeText,
  endDateText,
  endTimeText,
  minDate,
  maxDate,
  useLocalTime,
  activeField,
}: {
  startDateText: string
  startTimeText: string
  endDateText: string
  endTimeText: string
  minDate?: Date
  maxDate?: Date
  useLocalTime: boolean
  activeField?: 'start' | 'end'
}) => {
  const startDateValid = validateDate(startDateText)
  const startTimeValid = validateTime(startTimeText)
  const endDateValid = validateDate(endDateText)
  const endTimeValid = validateTime(endTimeText)

  let startDateError = startDateValid ? '' : 'Invalid date format (YYYY-MM-DD)'
  const startTimeError = startTimeValid ? '' : 'Invalid time format (HH:MM)'
  let endDateError = endDateValid ? '' : 'Invalid date format (YYYY-MM-DD)'
  const endTimeError = endTimeValid ? '' : 'Invalid time format (HH:MM)'

  const getBoundsError = (dateTime: Date) => {
    const normalize = (date: Date) =>
      useLocalTime
        ? new Date(date.getFullYear(), date.getMonth(), date.getDate())
        : new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    const normalizedDate = normalize(dateTime)
    const normalizedMaxDate = maxDate ? normalize(maxDate) : null
    const normalizedMinDate = minDate ? normalize(minDate) : null

    if (normalizedMaxDate && normalizedDate > normalizedMaxDate) {
      return `Cannot exceed ${formatDateInput(maxDate, useLocalTime)}`
    }
    if (normalizedMinDate && normalizedDate < normalizedMinDate) {
      return `Cannot precede ${formatDateInput(minDate, useLocalTime)}`
    }
    return ''
  }

  if (!startDateError && !startTimeError) {
    const startDateTime = getCombinedDateTime(startDateText, startTimeText, useLocalTime)
    startDateError = getBoundsError(startDateTime)
  }

  if (!endDateError && !endTimeError) {
    const endDateTime = getCombinedDateTime(endDateText, endTimeText, useLocalTime)
    endDateError = getBoundsError(endDateTime)
  }

  if (!startDateError && !startTimeError && !endDateError && !endTimeError) {
    const startDateTime = getCombinedDateTime(startDateText, startTimeText, useLocalTime)
    const endDateTime = getCombinedDateTime(endDateText, endTimeText, useLocalTime)

    if (startDateTime > endDateTime) {
      if (activeField === 'end') {
        endDateError = 'Cannot precede start date'
      } else {
        startDateError = 'Cannot exceed end date'
      }
    }
  }

  return {
    startDateError,
    startTimeError,
    endDateError,
    endTimeError,
  }
}

export const getPeriodDates = (periodValue: string, endDate: Date): [Date, Date] | null => {
  const match = /^(\d+)([mhd])$/i.exec(periodValue)
  if (!match) return null

  const amount = Number.parseInt(match[1], 10)
  const unit = match[2].toLowerCase()
  const unitToMs: Record<string, number> = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  const durationMs = unitToMs[unit]
  if (!durationMs || Number.isNaN(amount)) return null

  const startDate = new Date(endDate.getTime() - amount * durationMs)
  return [startDate, endDate]
}

export const clampEndDateForMaxRange = ({
  startDate,
  endDate,
  maxRangeInDays,
}: {
  startDate: Date
  endDate: Date
  maxRangeInDays?: number
}): Date | null => {
  if (!maxRangeInDays) return endDate

  const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  const timeDiff = Math.abs(endDateOnly.getTime() - startDateOnly.getTime())
  const daysDifference = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const inclusiveDays = daysDifference + 1

  if (inclusiveDays <= maxRangeInDays) {
    return endDate
  }

  const adjustedEndDateOnly = new Date(startDateOnly)
  adjustedEndDateOnly.setDate(adjustedEndDateOnly.getDate() + maxRangeInDays - 1)
  return adjustedEndDateOnly
}
