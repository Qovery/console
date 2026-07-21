import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowCreationFlow, useAgenticWorkflowCreateContext } from '../agentic-workflow-context'
import { AIModelCards } from './ai-model-cards'

function SelectedModel() {
  const { form } = useAgenticWorkflowCreateContext()

  return <span data-testid="selected-model">{form.watch('aiModel')}</span>
}

describe('AIModelCards', () => {
  it('should keep Claude selectable and Bedrock disabled', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowCreationFlow creationFlowUrl="/create/agentic-workflow" onExit={jest.fn()}>
        <>
          <AIModelCards />
          <SelectedModel />
        </>
      </AgenticWorkflowCreationFlow>
    )

    expect(screen.getByTestId('selected-model')).toHaveTextContent('CLAUDE')
    expect(screen.getByRole('button', { name: /bedrock/i })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: /claude/i }))

    expect(screen.getByTestId('selected-model')).toHaveTextContent('CLAUDE')
  })
})
