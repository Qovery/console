import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { GitContextModal } from './git-context-modal'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  GitBranchSettings: () => <div>Git branch</div>,
  GitProviderSetting: () => <div>Git provider</div>,
  GitPublicRepositorySettings: () => <div>Git public repository</div>,
  GitRepositorySetting: () => <div>Git repository</div>,
}))

describe('GitContextModal', () => {
  it('renders the add title with the provider setting', () => {
    renderWithProviders(<GitContextModal onSave={jest.fn()} setOpen={jest.fn()} />)

    expect(screen.getByRole('heading', { name: 'Add from Git repository' })).toBeInTheDocument()
    expect(screen.getByText('Git provider')).toBeInTheDocument()
  })

  it('cancels via the Cancel button', async () => {
    const setOpen = jest.fn()
    const { userEvent } = renderWithProviders(<GitContextModal onSave={jest.fn()} setOpen={setOpen} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(setOpen).toHaveBeenCalledWith(false)
  })

  it('saves the repository', async () => {
    const onSave = jest.fn()
    const { userEvent } = renderWithProviders(<GitContextModal onSave={onSave} setOpen={jest.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Add repository' }))

    expect(onSave).toHaveBeenCalled()
  })

  it('supports editing and removing an existing context', async () => {
    const onRemove = jest.fn()
    const { userEvent } = renderWithProviders(
      <GitContextModal
        context={{ repository: 'Qovery/console', branch: 'main' }}
        onRemove={onRemove}
        onSave={jest.fn()}
        setOpen={jest.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Edit Git repository' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))

    expect(onRemove).toHaveBeenCalled()
  })

  it('keeps the modal open and announces a removal failure', async () => {
    const setOpen = jest.fn()
    const { userEvent } = renderWithProviders(
      <GitContextModal
        context={{ repository: 'Qovery/console', branch: 'main' }}
        onRemove={jest.fn().mockRejectedValue(new Error('Unable to save'))}
        onSave={jest.fn()}
        setOpen={setOpen}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save this repository. Try again.')
    expect(setOpen).not.toHaveBeenCalled()
  })
})
