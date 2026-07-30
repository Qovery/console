import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowCreationFlow, useAgenticWorkflowCreateContext } from './agentic-workflow-context'

function FormDefaults() {
  const { form } = useAgenticWorkflowCreateContext()
  const values = form.getValues()

  return (
    <>
      <span data-testid="cpu">{values.cpu}</span>
      <span data-testid="memory">{values.memory}</span>
      <span data-testid="storage">{values.storage}</span>
      <span data-testid="whitelist-hosts">{values.whitelistHosts}</span>
      <span data-testid="workflow-enabled">{String(values.workflowEnabled)}</span>
    </>
  )
}

describe('AgenticWorkflowCreationFlow', () => {
  it('should initialize the form with MVP defaults', () => {
    renderWithProviders(
      <AgenticWorkflowCreationFlow creationFlowUrl="/create/agentic-workflow" onExit={jest.fn()}>
        <FormDefaults />
      </AgenticWorkflowCreationFlow>
    )

    expect(screen.getByTestId('cpu')).toHaveTextContent('2000')
    expect(screen.getByTestId('memory')).toHaveTextContent('2048')
    expect(screen.getByTestId('storage')).toHaveTextContent('10')
    expect(screen.getByTestId('whitelist-hosts')).toHaveTextContent('*')
    expect(screen.getByTestId('workflow-enabled')).toHaveTextContent('true')
  })
})
