import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import DeployedCommit from './deployed-commit'

describe('DeployedCommit', () => {
  it('should render the short id of the deployed commit', () => {
    renderWithProviders(
      <DeployedCommit gitRepository={{ deployed_commit_id: '4f3a1c2e9b8d7a6f5e4d3c2b1a0f9e8d7c6b5a49' }} />
    )

    expect(screen.getByRole('button', { name: '4f3a1c2' })).toBeInTheDocument()
  })

  it('should render nothing when no commit has been deployed yet', () => {
    const { container } = renderWithProviders(<DeployedCommit gitRepository={{}} />)

    expect(container).toBeEmptyDOMElement()
  })
})
