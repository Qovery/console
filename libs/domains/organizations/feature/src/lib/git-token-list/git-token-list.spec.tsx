import * as utilDates from '@qovery/shared/util-dates'
import { renderWithProviders } from '@qovery/shared/util-tests'
import GitTokenList from './git-token-list'

jest.mock('../hooks/use-git-tokens/use-git-tokens', () => {
  return {
    ...jest.requireActual('../hooks/use-git-tokens/use-git-tokens'),
    useGitTokens: () => ({
      isFetched: true,
      data: [
        {
          name: 'token1',
          type: 'GITHUB',
          id: '123',
          created_at: '2023-10-31T10:48:26.645507Z',
          updated_at: '2023-11-30T10:48:26.645507Z',
          associated_services_count: 0,
        },
        {
          name: 'token2',
          type: 'GITLAB',
          id: '456',
          created_at: '2023-10-31T10:48:26.645507Z',
          updated_at: '2023-11-30T10:48:26.645507Z',
          associated_services_count: 0,
        },
      ],
    }),
  }
})

describe('GitTokenList', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<GitTokenList />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    jest.spyOn(utilDates, 'timeAgo').mockReturnValue('1 month')

    const { baseElement } = renderWithProviders(<GitTokenList />)
    expect(baseElement).toMatchSnapshot()
  })
})
