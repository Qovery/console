import * as utilDates from '@qovery/shared/util-dates'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import GitTokenList from './git-token-list'

const mockUseGitTokens = jest.fn()

jest.mock('../hooks/use-git-tokens/use-git-tokens', () => {
  return {
    ...jest.requireActual('../hooks/use-git-tokens/use-git-tokens'),
    useGitTokens: () => mockUseGitTokens(),
  }
})

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: '0000-0000-0000' }),
}))

describe('GitTokenList', () => {
  beforeEach(() => {
    jest.spyOn(utilDates, 'timeAgo').mockReturnValue('1 month')
    mockUseGitTokens.mockReturnValue({
      isFetched: true,
      data: [
        {
          name: 'token1',
          type: 'GITHUB',
          id: '123',
          created_at: '2023-10-31T10:48:26.645507Z',
          updated_at: '2023-11-30T10:48:26.645507Z',
          associated_services_count: 0,
          isExpired: false,
        },
        {
          name: 'token2',
          type: 'GITLAB',
          id: '456',
          created_at: '2023-10-31T10:48:26.645507Z',
          updated_at: '2023-11-30T10:48:26.645507Z',
          associated_services_count: 0,
          isExpired: false,
        },
      ],
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<GitTokenList />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<GitTokenList />)
    expect(baseElement).toMatchSnapshot()
  })

  describe('expired token badge', () => {
    it('should show "Expired" badge for expired tokens', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 30) // 30 days ago

      mockUseGitTokens.mockReturnValue({
        isFetched: true,
        data: [
          {
            name: 'expired-token',
            type: 'GITHUB',
            id: '789',
            created_at: '2023-10-31T10:48:26.645507Z',
            updated_at: '2023-11-30T10:48:26.645507Z',
            expired_at: pastDate.toISOString(),
            associated_services_count: 0,
            isExpired: true,
          },
        ],
      })

      renderWithProviders(<GitTokenList />)

      expect(screen.getByText('Expired')).toBeInTheDocument()
    })

    it('should not show "Expired" badge for valid tokens', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30) // 30 days from now

      mockUseGitTokens.mockReturnValue({
        isFetched: true,
        data: [
          {
            name: 'valid-token',
            type: 'GITHUB',
            id: '789',
            created_at: '2023-10-31T10:48:26.645507Z',
            updated_at: '2023-11-30T10:48:26.645507Z',
            expired_at: futureDate.toISOString(),
            associated_services_count: 0,
            isExpired: false,
          },
        ],
      })

      renderWithProviders(<GitTokenList />)

      expect(screen.queryByText('Expired')).not.toBeInTheDocument()
    })

    it('should not show "Expired" badge for tokens without expiration date', () => {
      mockUseGitTokens.mockReturnValue({
        isFetched: true,
        data: [
          {
            name: 'no-expiry-token',
            type: 'GITHUB',
            id: '789',
            created_at: '2023-10-31T10:48:26.645507Z',
            updated_at: '2023-11-30T10:48:26.645507Z',
            associated_services_count: 0,
            isExpired: false,
          },
        ],
      })

      renderWithProviders(<GitTokenList />)

      expect(screen.queryByText('Expired')).not.toBeInTheDocument()
    })
  })
})
