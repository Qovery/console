import { useModal } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ContextMenu, getJsonError, isGitRepositoryComplete, isOutputComplete } from './agentic-workflow-configuration'

function ContextMenuHarness() {
  const { openModal } = useModal()

  return (
    <ContextMenu
      onAddQovery={() =>
        openModal({
          content: <div>Qovery environment popup</div>,
          options: { fakeModal: true },
        })
      }
      onAddGit={() =>
        openModal({
          content: <div>Git repository popup</div>,
          options: { fakeModal: true },
        })
      }
    />
  )
}

describe('AgenticWorkflowConfiguration validation', () => {
  it('should require valid JSON only when a required JSON field is empty or invalid', () => {
    expect(getJsonError('', false)).toBeUndefined()
    expect(getJsonError('', true)).toBe('Please enter a valid JSON configuration.')
    expect(getJsonError('{"mcpServers":{}}', true)).toBeUndefined()
    expect(getJsonError('{invalid', true)).toBe('Invalid JSON format.')
  })

  it('should require token, repository, and branch for configured repositories', () => {
    expect(
      isGitRepositoryComplete({
        provider: 'GITHUB',
        repository: 'https://github.com/qovery/console',
        branch: 'main',
      })
    ).toBe(true)

    expect(
      isGitRepositoryComplete({
        provider: 'GITHUB',
        repository: 'https://github.com/qovery/console',
        branch: '',
      })
    ).toBe(false)
  })

  it('should require a webhook URL for configured output webhooks', () => {
    expect(isOutputComplete({ url: 'https://hooks.example.com/workflow', headersJson: '{}', prompt: '' })).toBe(true)
    expect(isOutputComplete({ url: '', headersJson: '{}', prompt: 'Notify the team.' })).toBe(false)
  })

  it.each([
    ['From Qovery environment', 'Qovery environment popup'],
    ['From Git repository', 'Git repository popup'],
  ])('should open the relevant context popup from %s', async (menuItem, popupContent) => {
    const { userEvent } = renderWithProviders(<ContextMenuHarness />)

    await userEvent.click(screen.getByRole('button', { name: 'Add context' }))
    await userEvent.click(await screen.findByText(menuItem))

    expect(await screen.findByText(popupContent)).toBeInTheDocument()
  })
})
