import { addMinutes, subMinutes } from 'date-fns'

interface ServiceHistoryDateRange {
  startDate?: Date
  endDate?: Date
}

export function normalizeServiceHistoryDateRange(
  startDate?: Date,
  endDate?: Date,
  now = new Date()
): ServiceHistoryDateRange {
  if (!startDate || !endDate || startDate.getTime() !== endDate.getTime()) {
    return { startDate, endDate }
  }

  const adjustedEndDate = addMinutes(endDate, 30)
  const normalizedEndDate = adjustedEndDate > now ? now : adjustedEndDate

  return {
    startDate: subMinutes(normalizedEndDate, 60),
    endDate: normalizedEndDate,
  }
}
