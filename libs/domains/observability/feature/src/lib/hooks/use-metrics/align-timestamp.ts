// Helpers for alignment (timestamps in seconds)
// Needed to avoid issues with Prometheus when the time range is not aligned with the step interval
const ALIGN_SEC = 30
export const alignStartSec = (ts?: string) =>
  ts == null ? undefined : Math.floor(Number(ts) / ALIGN_SEC) * ALIGN_SEC + ''
export const alignEndSec = (ts?: string) =>
  ts == null ? undefined : Math.ceil(Number(ts) / ALIGN_SEC) * ALIGN_SEC + ''

const THANOS_RAW_RETENTION = 15 * 24 * 60 * 60 * 1000 // 15 days
const THANOS_5M_RETENTION = 30 * 24 * 60 * 60 * 1000 // 30 days

export const resolutionByRetention = (startTimestamp: string) => {
  const startMs = Number(startTimestamp) * 1000
  const nowMs = Date.now()
  const ageMs = Math.max(0, nowMs - startMs)

  let byAge: '0s' | '5m' | '1h'
  if (ageMs > THANOS_RAW_RETENTION) {
    if (ageMs > THANOS_5M_RETENTION) {
      byAge = '1h'
    } else {
      byAge = '5m'
    }
  } else {
    byAge = '0s'
  }

  return byAge
}
