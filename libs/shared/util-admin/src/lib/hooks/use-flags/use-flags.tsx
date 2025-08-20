import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useEffect, useState } from 'react'

export enum Flag {
  terraform = 'terraform',
  clusterAzure = 'cluster-azure',
  devopsCopilot = 'devops-copilot',
  serviceObs = 'service-obs',
  clusterRunningStatus = 'cluster-running-status',
}

type FlagKey = keyof typeof Flag

export function useFlags(flag: FlagKey) {
  const key = Flag[flag]

  const [localOverride, setLocalOverride] = useState<boolean | null>(null)
  const posthogValue = useFeatureFlagEnabled(key)

  useEffect(() => {
    const getLocalOverride = () => {
      if (typeof window === 'undefined') return null
      const stored = localStorage.getItem(`flag-override-${key}`)
      return stored !== null ? stored === 'true' : null
    }

    setLocalOverride(getLocalOverride())

    const handleStorageChange = () => {
      setLocalOverride(getLocalOverride())
    }

    // Listen for changes in localStorage to update the local override (multiple tabs)
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return localOverride !== null ? localOverride : posthogValue
}
