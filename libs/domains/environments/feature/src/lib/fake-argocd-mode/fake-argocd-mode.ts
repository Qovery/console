export type FakeArgoCdMode = 'none' | 'argocd-only' | 'hybrid'

const ARGO_CD_TAG_DISPLAY_THRESHOLD = 0.7
const ARGO_CD_ONLY_THRESHOLD = 0.7
const ARGO_CD_HYBRID_SERVICE_THRESHOLD = 0.5

function seededRandom(seed: string): number {
  // FNV-1a hash to keep pseudo-random values stable for a given seed.
  let hash = 2166136261

  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0) / 4294967295
}

export function getFakeArgoCdMode(seed: string): FakeArgoCdMode {
  const normalizedSeed = seed.trim() || 'default'
  const shouldDisplayArgoCdTag = seededRandom(`${normalizedSeed}:display`) < ARGO_CD_TAG_DISPLAY_THRESHOLD

  if (!shouldDisplayArgoCdTag) {
    return 'none'
  }

  return seededRandom(`${normalizedSeed}:mode`) < ARGO_CD_ONLY_THRESHOLD ? 'argocd-only' : 'hybrid'
}

export function isFakeArgoCdService({
  environmentId,
  serviceId,
}: {
  environmentId: string
  serviceId: string
}): boolean {
  const normalizedEnvironmentId = environmentId.trim() || 'default'
  const mode = getFakeArgoCdMode(normalizedEnvironmentId)

  if (mode === 'none') {
    return false
  }

  if (mode === 'argocd-only') {
    return true
  }

  return seededRandom(`${normalizedEnvironmentId}:${serviceId}:bucket`) < ARGO_CD_HYBRID_SERVICE_THRESHOLD
}
