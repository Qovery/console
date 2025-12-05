// LocalStorage helpers to remember cluster installs the user started, so UI/notifications can scope to them and survive reloads.
const TRACK_KEY = 'cluster-install-tracked-ids'
const MAX_AGE_MS = 1000 * 60 * 60 * 24 // 24h safety cleanup

type TrackedInstall = { id: string; name?: string; createdAt: number }

const readInstalls = (): TrackedInstall[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(TRACK_KEY)
    const parsed = raw ? (JSON.parse(raw) as TrackedInstall[]) : []
    const now = Date.now()
    return parsed.filter((entry) => entry.id && now - entry.createdAt < MAX_AGE_MS)
  } catch (error) {
    console.error('Unable to read tracked cluster installs', error)
    return []
  }
}

const writeInstalls = (installs: TrackedInstall[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TRACK_KEY, JSON.stringify(installs))
  } catch (error) {
    console.error('Unable to persist tracked cluster installs', error)
  }
}

export const trackClusterInstall = (clusterId: string, clusterName?: string) => {
  if (!clusterId) return
  const existing = readInstalls().filter((entry) => entry.id !== clusterId)
  existing.push({ id: clusterId, name: clusterName, createdAt: Date.now() })
  writeInstalls(existing)
}

export const clearTrackedClusterInstall = (clusterId: string) => {
  if (!clusterId) return
  const next = readInstalls().filter((entry) => entry.id !== clusterId)
  writeInstalls(next)
}

export const getTrackedClusterInstallIds = (): string[] => readInstalls().map((entry) => entry.id)

export const getTrackedClusterInstalls = (): TrackedInstall[] => readInstalls()
