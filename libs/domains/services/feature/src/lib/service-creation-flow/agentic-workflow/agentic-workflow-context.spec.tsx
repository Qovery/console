import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowCreationFlow, useAgenticWorkflowCreateContext } from './agentic-workflow-context'

function FormDefaults() {
  const { form } = useAgenticWorkflowCreateContext()
  const values = form.getValues()

  return (
    <>
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

    expect(screen.getByTestId('whitelist-hosts')).toHaveTextContent('*')
    expect(screen.getByTestId('workflow-enabled')).toHaveTextContent('true')
  })
})
