import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SelectCommitModal } from './select-commit-modal'

jest.mock('@qovery/shared/util-dates', () => {
  const actual = jest.requireActual('@qovery/shared/util-dates')
  return {
    ...actual,
    /** Relative time drifts between runs; snapshot must stay stable. */
    timeAgo: () => '0 seconds',
    /**
     * `commitsByDay` keys use local `toDateString()` but `dateToFormat` uses UTC — CI vs dev timezones
     * otherwise flip the header (e.g. Apr 02 vs Apr 03).
     */
    dateToFormat: (date: string, format: string) => {
      if (format === 'MMM dd, yyyy') {
        return 'Apr 03, 2026'
      }
      return actual.dateToFormat(date, format)
    },
  }
})

jest.mock('../hooks/use-last-deployed-commit/use-last-deployed-commit', () => {
  return {
    ...jest.requireActual('../hooks/use-last-deployed-commit/use-last-deployed-commit'),
    useLastDeployedCommit: () => ({
      data: {
        commits: [
          {
            created_at: '2026-04-03T13:25:12.247Z',
            author_name: 'foo',
            git_commit_id: '123',
            message: 'lorem',
            tag: '',
          },
          {
            created_at: '2026-04-03T13:25:12.247Z',
            author_name: 'foo',
            git_commit_id: '456',
            message: 'ipsum',
            tag: '',
          },
        ],
        delta: 1,
        deployedCommit: {
          created_at: '2026-04-03T13:25:12.247Z',
          author_name: 'foo',
          git_commit_id: '456',
          message: 'ipsum',
          tag: '',
        },
      },
    }),
  }
})

describe('SelectCommitModal', () => {
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
})
