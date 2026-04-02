import { getFakeArgoCdMode, isFakeArgoCdService } from './fake-argocd-mode'

describe('getFakeArgoCdMode', () => {
  it('should return a deterministic mode for the same seed', () => {
    expect(getFakeArgoCdMode('env-1')).toBe(getFakeArgoCdMode('env-1'))
  })

  it('should return only supported modes', () => {
    const mode = getFakeArgoCdMode('env-2')

    expect(['none', 'argocd-only', 'hybrid']).toContain(mode)
  })

  it('should roughly match target probabilities', () => {
    const seeds = Array.from({ length: 10000 }, (_, index) => `env-${index + 1}`)
    const modes = seeds.map((seed) => getFakeArgoCdMode(seed))
    const displayedModes = modes.filter((mode) => mode !== 'none')
    const displayedRate = displayedModes.length / modes.length
    const onlyRate = displayedModes.filter((mode) => mode === 'argocd-only').length / displayedModes.length

    expect(displayedRate).toBeGreaterThan(0.66)
    expect(displayedRate).toBeLessThan(0.74)
    expect(onlyRate).toBeGreaterThan(0.66)
    expect(onlyRate).toBeLessThan(0.74)
  })
})

describe('isFakeArgoCdService', () => {
  const findSeedByMode = (mode: ReturnType<typeof getFakeArgoCdMode>) => {
    const match = Array.from({ length: 10000 }, (_, index) => `env-${index + 1}`).find(
      (seed) => getFakeArgoCdMode(seed) === mode
    )
    if (!match) {
      throw new Error(`No seed found for mode: ${mode}`)
    }
    return match
  }

  it('should be deterministic for the same environment and service', () => {
    expect(isFakeArgoCdService({ environmentId: 'env-1', serviceId: 'svc-1' })).toBe(
      isFakeArgoCdService({ environmentId: 'env-1', serviceId: 'svc-1' })
    )
  })

  it('should return false when env mode is none', () => {
    const environmentId = findSeedByMode('none')
    expect(isFakeArgoCdService({ environmentId, serviceId: 'svc-1' })).toBe(false)
  })

  it('should return true when env mode is argocd-only', () => {
    const environmentId = findSeedByMode('argocd-only')
    expect(isFakeArgoCdService({ environmentId, serviceId: 'svc-1' })).toBe(true)
    expect(isFakeArgoCdService({ environmentId, serviceId: 'svc-2' })).toBe(true)
  })
})
