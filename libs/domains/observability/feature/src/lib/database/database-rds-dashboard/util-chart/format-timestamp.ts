// Generic helper to format timestamps for chart data
export function formatTimestamp(timestampMs: number, useLocalTime: boolean) {
  const date = new Date(timestampMs)

  const timeString = useLocalTime
    ? date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : formatUTCTime(date)

  const fullTimeString = useLocalTime
    ? date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : formatUTCDateTime(date)

  return { timeString, fullTimeString }
}

function formatUTCTime(date: Date): string {
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  const seconds = date.getUTCSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

function formatUTCDateTime(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getUTCMonth()]
  const day = date.getUTCDate()
  const year = date.getUTCFullYear()
  const time = formatUTCTime(date)
  return `${month} ${day}, ${year}, ${time} UTC`
}
