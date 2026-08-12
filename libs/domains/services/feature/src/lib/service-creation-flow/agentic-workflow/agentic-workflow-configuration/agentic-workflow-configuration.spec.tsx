import { useModal } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowCreationFlow } from '../agentic-workflow-context'
import {
  AgentCreationActions,
  ContextMenu,
  DockerSettings,
  getAgenticWorkflowValidationErrors,
  getJsonError,
  isGitRepositoryComplete,
  isOutputComplete,
} from './agentic-workflow-configuration'

jest.mock('./instructions-editor', () => ({
  InstructionsEditor: () => null,
}))

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

function DockerSettingsHarness() {
  return (
    <AgenticWorkflowCreationFlow creationFlowUrl="/create" onExit={jest.fn()}>
      <DockerSettings onAddRaw={jest.fn()} />
    </AgenticWorkflowCreationFlow>
  )
}

describe('AgenticWorkflowConfiguration validation', () => {
  it('should list the required values missing from the configuration', () => {
    expect(
      getAgenticWorkflowValidationErrors({
        name: '',
        modelApiKey: '',
        agentPrompt: '',
        gitRepositories: [],
        outputs: [],
      })
    ).toEqual(['Agent name', 'Model API key', 'Agent prompt'])
  })

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

  it('should display create agent and agent dropdown actions', async () => {
    const onCreateAgent = jest.fn()
    const onCloneAgent = jest.fn()
    const onDeleteAgent = jest.fn()
    const { userEvent } = renderWithProviders(
      <AgentCreationActions onCreateAgent={onCreateAgent} onCloneAgent={onCloneAgent} onDeleteAgent={onDeleteAgent} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Create agent' }))
    expect(onCreateAgent).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Agent actions' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Clone' }))
    expect(onCloneAgent).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Agent actions' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete agent' }))
    expect(onDeleteAgent).toHaveBeenCalledTimes(1)
  })

  it('should import a txt file and display its title in the Dockerfile fragment card', async () => {
    const { userEvent } = renderWithProviders(<DockerSettingsHarness />)
    const input = screen.getByLabelText('Dockerfile fragment file')
    const fileInputClick = jest.spyOn(input, 'click')
    const content = 'RUN apt-get update\nRUN apt-get install -y jq'

    await userEvent.click(screen.getByRole('button', { name: 'Add file' }))
    await userEvent.upload(input, new File([content], 'fragment.txt', { type: 'text/plain' }))

    expect(fileInputClick).toHaveBeenCalled()
    expect(await screen.findByText('fragment.txt')).toBeInTheDocument()
    expect(screen.queryByText(content)).not.toBeInTheDocument()
  })
})
