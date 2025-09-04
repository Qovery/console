// Helpers for alignment (timestamps in seconds)
// Needed to avoid issues with Prometheus when the time range is not aligned with the step interval
const ALIGN_SEC = 30
export const alignStartSec = (ts?: string) =>
  ts == null ? undefined : Math.floor(Number(ts) / ALIGN_SEC) * ALIGN_SEC + ''
export const alignEndSec = (ts?: string) =>
  ts == null ? undefined : Math.ceil(Number(ts) / ALIGN_SEC) * ALIGN_SEC + ''
