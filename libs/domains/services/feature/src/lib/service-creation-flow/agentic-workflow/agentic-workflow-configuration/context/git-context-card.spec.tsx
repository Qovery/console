import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { GitContextCard, GitContextCompactCard } from './git-context-card'

describe('GitContextCard', () => {
  it('calls onClick when pressed', async () => {
    const onClick = jest.fn()
    const { userEvent } = renderWithProviders(<GitContextCard onClick={onClick} />)

    await userEvent.click(screen.getByRole('button', { name: /Add from Git repository/ }))

    expect(onClick).toHaveBeenCalled()
  })
})

describe('GitContextCompactCard', () => {
  it('shows an uppercase GitHub provider label and the repository', () => {
    renderWithProviders(<GitContextCompactCard provider="GITHUB" repository="Qovery/console" onClick={jest.fn()} />)

    expect(screen.getByText('GITHUB')).toBeInTheDocument()
    expect(screen.getByText('Qovery/console')).toBeInTheDocument()
  })

  it('falls back to a generic Git label when no provider', () => {
    renderWithProviders(<GitContextCompactCard repository="my-repo" onClick={jest.fn()} />)

    expect(screen.getByText('GIT')).toBeInTheDocument()
  })

  it('calls onClick from the manage button', async () => {
    const onClick = jest.fn()
    const { userEvent } = renderWithProviders(
      <GitContextCompactCard provider="GITLAB" repository="my-repo" onClick={onClick} />
    )

    expect(screen.getByText('GITLAB')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Manage context' }))

    expect(onClick).toHaveBeenCalled()
  })

  it('prevents managing the context when disabled', async () => {
    const onClick = jest.fn()
    const { userEvent } = renderWithProviders(<GitContextCompactCard disabled repository="my-repo" onClick={onClick} />)

    const manageButton = screen.getByRole('button', { name: 'Manage context' })
    expect(manageButton).toBeDisabled()
    await userEvent.click(manageButton)

    expect(onClick).not.toHaveBeenCalled()
  })
})
