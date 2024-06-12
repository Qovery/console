import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SelectCommitModal } from './select-commit-modal'

jest.mock('../hooks/use-last-deployed-commit/use-last-deployed-commit', () => {
  return {
    ...jest.requireActual('../hooks/use-last-deployed-commit/use-last-deployed-commit'),
    useLastDeployedCommit: () => ({
      data: {
        commits: [
          { created_at: '123', author_name: 'foo', git_commit_id: '123', message: 'lorem', tag: '' },
          { created_at: '456', author_name: 'foo', git_commit_id: '456', message: 'ipsum', tag: '' },
        ],
        delta: 1,
        deployedCommit: { created_at: '456', author_name: 'foo', git_commit_id: '456', message: 'ipsum', tag: '' },
      },
    }),
  }
})

describe('SelectCommitModal', () => {
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
})
