import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { GitProviderEnum, type GitTokenResponse } from 'qovery-typescript-axios'
import { render, renderWithProviders } from '@qovery/shared/util-tests'
import { GitProviderSetting, mergeProviders } from './git-provider-setting'

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
    expect(result[1].label).toBe('Gitlab (user2)')
    const { container } = render(result[2].label)
    expect(container).toHaveTextContent('Github Token (token1)')
  })
})
