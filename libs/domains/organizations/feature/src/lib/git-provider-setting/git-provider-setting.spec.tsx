import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { GitProviderEnum, type GitTokenResponse } from 'qovery-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { GitProviderSetting, getGitTokenValue, mergeProviders } from './git-provider-setting'

jest.mock('../hooks/use-auth-providers/use-auth-providers', () => {
  return {
    ...jest.requireActual('../hooks/use-auth-providers/use-auth-providers'),
    useAuthProviders: () => ({
      data: [
        {
          id: '0000-1111-2222',
          name: 'GITHUB',
          owner: 'Qovery',
          use_bot: false,
        },
      ],
    }),
  }
})

jest.mock('../hooks/use-git-tokens/use-git-tokens', () => {
  return {
    ...jest.requireActual('../hooks/use-git-tokens/use-git-tokens'),
    useGitTokens: () => ({
      data: [
        {
          id: '0000-1111-2222',
          created_at: '',
          name: 'my-token',
          type: 'GITHUB',
        },
      ],
    }),
  }
})

describe('GitProviderSetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GitProviderSetting disabled={false} />))
    expect(baseElement).toMatchSnapshot()
  })

  it('should merge authProviders and gitTokens correctly', () => {
    const authProviders = [
      { name: GitProviderEnum.GITHUB, owner: 'user1' },
      { name: GitProviderEnum.GITLAB, owner: 'user2' },
    ]

    const gitTokens: GitTokenResponse[] = [
      { name: 'token1', type: GitProviderEnum.GITHUB, id: '123', created_at: '' },
      { name: 'token2', type: GitProviderEnum.GITLAB, id: '456', created_at: '' },
    ]

    const result = mergeProviders(authProviders, gitTokens)

    expect(result).toHaveLength(4)
    expect(result[0].label).toBe('Github (user1)')
    expect(result[1].label).toBe('Gitlab (user2)')
    expect(result[2].label).toBe('Token1')
    expect(result[3].label).toBe('Token2')
  })

  it('should parse a valid token value', () => {
    const tokenValue = 'TOKEN_github_123'
    const result = getGitTokenValue(tokenValue)
    expect(result).toEqual({ type: 'github', id: '123' })
  })

  it('should return null for an invalid token value', () => {
    const tokenValue = 'INVALID'
    const result = getGitTokenValue(tokenValue)
    expect(result).toBeNull()
  })
})
