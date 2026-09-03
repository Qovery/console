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
  it('shows a friendly provider label and the repository', () => {
    renderWithProviders(<GitContextCompactCard provider="GITHUB" repository="Qovery/console" onClick={jest.fn()} />)

    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Qovery/console')).toBeInTheDocument()
  })

  it('falls back to a generic Git label when no provider', () => {
    renderWithProviders(<GitContextCompactCard repository="my-repo" onClick={jest.fn()} />)

    expect(screen.getByText('Git')).toBeInTheDocument()
  })

  it('calls onClick from the manage button', async () => {
    const onClick = jest.fn()
    const { userEvent } = renderWithProviders(
      <GitContextCompactCard provider="GITLAB" repository="my-repo" onClick={onClick} />
    )

    expect(screen.getByText('GitLab')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Manage context' }))

    expect(onClick).toHaveBeenCalled()
  })
})
