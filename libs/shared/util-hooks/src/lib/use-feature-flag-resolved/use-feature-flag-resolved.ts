import { useFeatureFlagEnabled, usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'

/**
 * Like `useFeatureFlagEnabled`, but tells "not loaded yet" apart from "off".
 * Returns `undefined` until PostHog has answered (or failed to), then `true` or `false`.
 * A flag that does not exist in PostHog resolves to `false`.
 */
export function useFeatureFlagResolved(flag: string): boolean | undefined {
  const posthog = usePostHog()
  const enabled = useFeatureFlagEnabled(flag)
  const [flagsLoaded, setFlagsLoaded] = useState(() => Boolean(posthog.featureFlags?.hasLoadedFlags))

  // PostHog also calls this when loading the flags fails, so the answer never stays pending.
  useEffect(() => posthog.onFeatureFlags(() => setFlagsLoaded(true)), [posthog])

  if (enabled) return true
  return flagsLoaded ? false : undefined
}
