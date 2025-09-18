const DURATION_TO_MINUTES: Record<string, number> = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '30m': 30,
  '1h': 60,
  '3h': 180,
  '6h': 360,
  '12h': 720,
  '24h': 1440,
  '2d': 2880,
  '7d': 10080,
  '14d': 20160,
  '21d': 30240,
  '28d': 40320,
}

export const alignedRangeInMinutes = (startTimestamp?: string, endTimestamp?: string) => {
  if (!startTimestamp || !endTimestamp) {
    return 'na'
  }

  const start = parseInt(startTimestamp, 10)
  const end = parseInt(endTimestamp, 10)

  if (isNaN(start) || isNaN(end)) {
    return 'na'
  }

  const diffSeconds = end - start
  const diffMinutes = diffSeconds / 60

  const supportedMinutes = Object.values(DURATION_TO_MINUTES).sort((a, b) => a - b)

  let selectedRange = supportedMinutes[0]

  for (const range of supportedMinutes) {
    if (diffMinutes >= range) {
      selectedRange = range
    } else {
      break
    }
  }

  return selectedRange.toString().padStart(6, '0')
}
