import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { GitProviderEnum, type GitTokenResponse } from 'qovery-typescript-axios'
import { render, renderWithProviders } from '@qovery/shared/util-tests'
import { GitProviderSetting, handleTokenSelection, mergeProviders } from './git-provider-setting'

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
      { name: 'token1', type: GitProviderEnum.GITHUB, id: '123', created_at: '', associated_services_count: 0 },
    ]

    const result = mergeProviders(authProviders, gitTokens)

    expect(result).toHaveLength(3)
    expect(result[0].label).toBe('Github (user1)')
    expect(result[0].searchText).toBe('Github user1')
    expect(result[1].label).toBe('Gitlab (user2)')
    expect(result[1].searchText).toBe('Gitlab user2')
    const { container } = render(result[2].label)
    expect(container).toHaveTextContent('Github Token (token1)')
    expect(result[2].searchText).toBe('Github Token token1')
  })

  it('should include searchText for all provider types for better search functionality', () => {
    const authProviders = [{ name: GitProviderEnum.BITBUCKET, owner: 'bitbucket-user' }]

    const gitTokens: GitTokenResponse[] = [
      {
        name: 'my-bitbucket-token',
        type: GitProviderEnum.BITBUCKET,
        id: '456',
        created_at: '',
        associated_services_count: 0,
      },
    ]

    const result = mergeProviders(authProviders, gitTokens)

    expect(result).toHaveLength(2)
    // Auth provider should have searchText
    expect(result[0].searchText).toBe('Bitbucket bitbucket-user')
    // Git token should have searchText that includes the token name for search
    expect(result[1].searchText).toBe('Bitbucket Token my-bitbucket-token')
  })
})

describe('handleTokenSelection', () => {
  it('should use newToken data directly when provided (race condition fix)', () => {
    const gitTokens: GitTokenResponse[] = [] // Empty list simulates stale cache
    const newToken: GitTokenResponse = {
      id: 'new-token-id',
      name: 'new-token-name',
      type: GitProviderEnum.GITHUB,
      created_at: '',
      associated_services_count: 0,
      git_api_url: 'https://github.com/example',
    }

    const result = handleTokenSelection('new-token-id', gitTokens, newToken)

    expect(result).toEqual({
      git_token_id: 'new-token-id',
      git_token_name: 'new-token-name',
      provider: GitProviderEnum.GITHUB,
      is_public_repository: false,
    })
  })
})
