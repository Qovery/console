import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useLastDeployedCommit } from '../hooks/use-last-deployed-commit/use-last-deployed-commit'
import { SelectCommitModal } from './select-commit-modal'

jest.mock('../hooks/use-last-deployed-commit/use-last-deployed-commit', () => {
  return {
    ...jest.requireActual('../hooks/use-last-deployed-commit/use-last-deployed-commit'),
    useLastDeployedCommit: jest.fn(),
  }
})

const mockedUseLastDeployedCommit = jest.mocked(useLastDeployedCommit)

describe('SelectCommitModal', () => {
  beforeEach(() => {
    mockedUseLastDeployedCommit.mockReturnValue({
      data: {
        commits: [
          { created_at: '2024-01-01T00:00:00Z', author_name: 'foo', git_commit_id: '123', message: 'lorem', tag: '' },
          { created_at: '2024-01-02T00:00:00Z', author_name: 'foo', git_commit_id: '456', message: 'ipsum', tag: '' },
        ],
        delta: 1,
        deployedCommit: {
          created_at: '2024-01-02T00:00:00Z',
          author_name: 'foo',
          git_commit_id: '456',
          message: 'ipsum',
          tag: '',
        },
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      isSuccess: true,
      error: null,
      status: 'success',
      fetchStatus: 'idle',
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should match snapshot', () => {
    const onCancel = jest.fn()
    const onSubmit = jest.fn()
    const { container } = renderWithProviders(
      <SelectCommitModal
        title="Deploy other version"
        description="Type a version to deploy"
        submitLabel="Deploy"
        serviceId="1"
        serviceType="APPLICATION"
        gitRepository={{}}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        For X service
      </SelectCommitModal>
    )
    expect(container).toMatchSnapshot()
  })
  it('should call cancel properly', async () => {
    const onCancel = jest.fn()
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <SelectCommitModal
        title="Deploy other version"
        description="Type a version to deploy"
        submitLabel="Deploy"
        serviceId="1"
        serviceType="APPLICATION"
        gitRepository={{}}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        For X service
      </SelectCommitModal>
    )
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })
  it('should call submit properly', async () => {
    const onCancel = jest.fn()
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <SelectCommitModal
        title="Deploy other version"
        description="Type a version to deploy"
        submitLabel="Deploy"
        serviceId="1"
        serviceType="APPLICATION"
        gitRepository={{}}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        For X service
      </SelectCommitModal>
    )
    await userEvent.click(screen.getByRole('radio', { name: /123/i }))
    await userEvent.click(screen.getByRole('button', { name: /Deploy/i }))
    expect(onSubmit).toHaveBeenCalledWith('123')
  })

  it('should show empty state and hide search when no commits are returned', () => {
    mockedUseLastDeployedCommit.mockReturnValueOnce({
      data: {
        commits: [],
        delta: 0,
        deployedCommit: {
          created_at: '2024-01-02T00:00:00Z',
          author_name: 'foo',
          git_commit_id: '456',
          message: 'ipsum',
          tag: '',
        },
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      isSuccess: true,
      error: null,
      status: 'success',
      fetchStatus: 'idle',
    })

    renderWithProviders(
      <SelectCommitModal
        title="Deploy other version"
        description="Type a version to deploy"
        submitLabel="Deploy"
        serviceId="1"
        serviceType="APPLICATION"
        gitRepository={{}}
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
      >
        For X service
      </SelectCommitModal>
    )

    expect(screen.queryByPlaceholderText(/search by commit message or commit id/i)).not.toBeInTheDocument()
    expect(screen.getByText(/No commit available/i)).toBeInTheDocument()
  })
})
