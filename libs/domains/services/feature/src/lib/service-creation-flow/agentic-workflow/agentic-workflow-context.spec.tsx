import { AgenticWorkflowExecutionMode } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowCreationFlow, useAgenticWorkflowCreateContext } from './agentic-workflow-context'

function FormDefaults() {
  const { form, variablesForm } = useAgenticWorkflowCreateContext()
  const values = form.getValues()
  const variables = variablesForm.getValues('variables')

  return (
    <>
      <span data-testid="name">{values.name}</span>
      <span data-testid="agent-prompt">{values.agentPrompt}</span>
      <span data-testid="cpu">{values.cpu}</span>
      <span data-testid="memory">{values.memory}</span>
      <span data-testid="storage">{values.storage}</span>
      <span data-testid="whitelist-hosts">{values.whitelistHosts}</span>
      <span data-testid="execution-mode">{values.executionMode}</span>
      <span data-testid="variables">{variables.map((variable) => variable.variable).join(',')}</span>
    </>
  )
}

describe('AgenticWorkflowCreationFlow', () => {
  it('should initialize the form with MVP defaults', () => {
    renderWithProviders(
      <AgenticWorkflowCreationFlow onExit={jest.fn()}>
        <FormDefaults />
      </AgenticWorkflowCreationFlow>
    )

    expect(screen.getByTestId('cpu')).toHaveTextContent('2000')
    expect(screen.getByTestId('memory')).toHaveTextContent('2048')
    expect(screen.getByTestId('storage')).toHaveTextContent('10')
    expect(screen.getByTestId('whitelist-hosts')).toHaveTextContent('*')
    expect(screen.getByTestId('execution-mode')).toHaveTextContent(AgenticWorkflowExecutionMode.IN_PLACE)
  })

  it('should merge a template seed over the defaults', () => {
    renderWithProviders(
      <AgenticWorkflowCreationFlow
        onExit={jest.fn()}
        seed={{ name: 'Incident Analyser', agentPrompt: 'Investigate the incident', whitelistHosts: 'api.incident.io' }}
        variablesSeed={[{ variable: 'INCIDENT_IO_API_KEY', value: '', isSecret: true }]}
      >
        <FormDefaults />
      </AgenticWorkflowCreationFlow>
    )

    // Seeded fields are applied…
    expect(screen.getByTestId('name')).toHaveTextContent('Incident Analyser')
    expect(screen.getByTestId('agent-prompt')).toHaveTextContent('Investigate the incident')
    expect(screen.getByTestId('whitelist-hosts')).toHaveTextContent('api.incident.io')
    expect(screen.getByTestId('variables')).toHaveTextContent('INCIDENT_IO_API_KEY')
    // …while untouched fields keep their defaults.
    expect(screen.getByTestId('cpu')).toHaveTextContent('2000')
  })
})
