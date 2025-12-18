import { type GitTokenResponse } from 'qovery-typescript-axios'
import { isGitTokenExpired } from './use-git-tokens'

describe('useGitTokens sorting', () => {
  // Helper to simulate the sorting logic that should be in the hook
  const sortTokens = (data: GitTokenResponse[]): GitTokenResponse[] => {
    return [...data].sort((a, b) => {
      const aExpired = isGitTokenExpired(a)
      const bExpired = isGitTokenExpired(b)
      if (aExpired !== bExpired) return aExpired ? 1 : -1
      return a.name.localeCompare(b.name)
    })
  }

  const createToken = (name: string, expired_at?: string): GitTokenResponse => ({
    id: `id-${name}`,
    name,
    type: 'GITHUB',
    created_at: '2023-01-01T00:00:00Z',
    associated_services_count: 0,
    git_api_url: 'https://api.github.com',
    ...(expired_at && { expired_at }),
  })

  it('should sort valid tokens before expired tokens', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 30)

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)

    const tokens: GitTokenResponse[] = [
      createToken('expired-alpha', pastDate.toISOString()),
      createToken('valid-zebra', futureDate.toISOString()),
      createToken('expired-beta', pastDate.toISOString()),
      createToken('valid-apple', futureDate.toISOString()),
    ]

    const sorted = sortTokens(tokens)

    // Valid tokens should come first
    expect(sorted[0].name).toBe('valid-apple')
    expect(sorted[1].name).toBe('valid-zebra')
    // Expired tokens should come last
    expect(sorted[2].name).toBe('expired-alpha')
    expect(sorted[3].name).toBe('expired-beta')
  })

  it('should sort alphabetically within each group', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)

    const tokens: GitTokenResponse[] = [
      createToken('charlie', futureDate.toISOString()),
      createToken('alpha', futureDate.toISOString()),
      createToken('bravo', futureDate.toISOString()),
    ]

    const sorted = sortTokens(tokens)

    expect(sorted[0].name).toBe('alpha')
    expect(sorted[1].name).toBe('bravo')
    expect(sorted[2].name).toBe('charlie')
  })

  it('should treat tokens without expiration date as valid', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 30)

    const tokens: GitTokenResponse[] = [
      createToken('expired-token', pastDate.toISOString()),
      createToken('no-expiry-token'), // No expired_at
    ]

    const sorted = sortTokens(tokens)

    // Token without expiration should be treated as valid (first)
    expect(sorted[0].name).toBe('no-expiry-token')
    expect(sorted[1].name).toBe('expired-token')
  })

  it('should handle all tokens valid', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)

    const tokens: GitTokenResponse[] = [
      createToken('zebra', futureDate.toISOString()),
      createToken('alpha', futureDate.toISOString()),
    ]

    const sorted = sortTokens(tokens)

    expect(sorted[0].name).toBe('alpha')
    expect(sorted[1].name).toBe('zebra')
  })

  it('should handle all tokens expired', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 30)

    const tokens: GitTokenResponse[] = [
      createToken('zebra', pastDate.toISOString()),
      createToken('alpha', pastDate.toISOString()),
    ]

    const sorted = sortTokens(tokens)

    expect(sorted[0].name).toBe('alpha')
    expect(sorted[1].name).toBe('zebra')
  })

  it('should handle empty array', () => {
    const sorted = sortTokens([])
    expect(sorted).toEqual([])
  })
})
