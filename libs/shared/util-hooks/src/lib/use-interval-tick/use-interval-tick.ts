import { useEffect, useState } from 'react'

/**
 * Triggers a re-render every `intervalMs` milliseconds while `enabled` is true.
 * Use this to drive live-updating time displays without storing derived state.
 *
 * @param enabled - When false, the interval is not started. Defaults to `true`.
 * @param intervalMs - Interval in milliseconds. Defaults to `1000`.
 */
export function useIntervalTick(enabled = true, intervalMs = 1000): void {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => setTick((n) => n + 1), intervalMs)
    return () => window.clearInterval(id)
  }, [enabled, intervalMs])
}
