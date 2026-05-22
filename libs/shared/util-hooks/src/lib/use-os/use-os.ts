import { useMemo } from 'react'

export type OS = 'macos' | 'linux' | 'windows'

export function detectOS(): OS {
  if (typeof navigator === 'undefined') return 'macos'
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('win')) return 'windows'
  if (ua.includes('mac')) return 'macos'
  return 'linux'
}

export function useOS(): OS {
  return useMemo(() => detectOS(), [])
}

export default useOS
