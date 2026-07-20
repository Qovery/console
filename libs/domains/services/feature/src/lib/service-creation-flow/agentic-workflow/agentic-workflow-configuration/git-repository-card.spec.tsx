import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { GitRepositoryCard } from './git-repository-card'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  GitBranchSettings: ({ organizationId, gitTokenId }: { organizationId: string; gitTokenId?: string }) => (
    <div data-testid="git-branch-settings">
      {organizationId}:{gitTokenId}
    </div>
  ),
  GitProviderSetting: ({ organizationId }: { organizationId: string }) => (
    <div data-testid="git-provider-setting">{organizationId}</div>
  ),
  GitRepositorySetting: ({ organizationId, gitTokenId }: { organizationId: string; gitTokenId?: string }) => (
    <div data-testid="git-repository-setting">
      {organizationId}:{gitTokenId}
    </div>
  ),
}))

describe('GitRepositoryCard', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render repository settings and remove the repository', async () => {
    const onRemove = jest.fn()
    const { userEvent } = renderWithProviders(
      <GitRepositoryCard
        index={0}
        onChange={jest.fn()}
        onRemove={onRemove}
        repository={{
          provider: 'GITHUB',
          gitTokenId: 'token-1',
          repository: 'https://github.com/qovery/console',
          branch: 'main',
          rootPath: '/',
        }}
      />
    )

    expect(screen.getByText('Repository 1')).toBeInTheDocument()
    expect(screen.getByTestId('git-provider-setting')).toHaveTextContent('org-1')
    expect(screen.getByTestId('git-repository-setting')).toHaveTextContent('org-1:token-1')
    expect(screen.getByTestId('git-branch-settings')).toHaveTextContent('org-1:token-1')

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))

    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})
