import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import DeployedCommit from './deployed-commit'

const commitId = '4f3a1c2e9b8d7a6f5e4d3c2b1a0f9e8d7c6b5a49'

describe('DeployedCommit', () => {
  it('should render the short id of the deployed commit', () => {
    renderWithProviders(<DeployedCommit gitRepository={{ deployed_commit_id: commitId }} />)

    expect(screen.getByRole('button', { name: '4f3a1c2' })).toBeInTheDocument()
  })

  it('should render nothing when no commit has been deployed yet', () => {
    const { container } = renderWithProviders(<DeployedCommit gitRepository={{}} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should show the commit date and a copy icon while hovered', async () => {
    const { userEvent } = renderWithProviders(
      <DeployedCommit gitRepository={{ deployed_commit_id: commitId, deployed_commit_date: '2026-11-19T10:00:00Z' }} />
    )
    const button = screen.getByRole('button', { name: '4f3a1c2' })

    await userEvent.hover(button)

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Commit at: 2026-11-19T10:00:00Z')
    expect(button.querySelector('.fa-copy')).toBeInTheDocument()

    await userEvent.unhover(button)

    expect(button.querySelector('.fa-code-commit')).toBeInTheDocument()
  })

  it('should name the deployed commit in the tooltip when its date is unknown', async () => {
    const { userEvent } = renderWithProviders(<DeployedCommit gitRepository={{ deployed_commit_id: commitId }} />)

    await userEvent.hover(screen.getByRole('button', { name: '4f3a1c2' }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Deployed commit')
  })
})
