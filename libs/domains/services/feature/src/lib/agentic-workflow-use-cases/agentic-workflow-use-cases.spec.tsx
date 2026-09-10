import posthog from 'posthog-js'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowUseCases } from './agentic-workflow-use-cases'

const mockShowPylonForm = jest.fn()

jest.mock('posthog-js', () => ({ capture: jest.fn() }))

jest.mock('@qovery/shared/util-hooks', () => ({
  useSupportChat: () => ({ showPylonForm: mockShowPylonForm }),
}))

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')

  return {
    ...actual,
    Link: ({
      children,
      search,
      to,
      ...props
    }: {
      children: ReactNode
      search?: Record<string, string>
      to: string
    }) => {
      const query = search ? `?${new URLSearchParams(search).toString()}` : ''
      return (
        <a href={`${to}${query}`} {...props}>
          {children}
        </a>
      )
    },
  }
})

describe('AgenticWorkflowUseCases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should expose agent task templates from the automation area', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowUseCases organizationId="org-1" projectId="project-1" environmentId="env-1" />
    )

    expect(screen.getByText('Incident Analyser')).toBeInTheDocument()
    const [incidentAnalyser] = screen.getAllByRole('link', { name: /Use template/i })
    expect(incidentAnalyser).toHaveAttribute(
      'href',
      '/organization/org-1/project/project-1/environment/env-1/service/create/agentic-workflow?template=incident-analyser'
    )
    expect(screen.getByText('Start from scratch')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Configure manually/i })).toBeInTheDocument()

    await userEvent.click(incidentAnalyser)
    expect(posthog.capture).toHaveBeenCalledWith('select-agent-use-case', { agentUseCase: 'incident-analyser' })
  })

  it('should open support from the custom agent action', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowUseCases organizationId="org-1" projectId="project-1" environmentId="env-1" />
    )

    await userEvent.click(screen.getByRole('button', { name: /Contact us/i }))

    expect(mockShowPylonForm).toHaveBeenCalledWith('request-ai-builder-portal')
  })

  it('should expose the use cases from a create menu', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowUseCases organizationId="org-1" projectId="project-1" environmentId="env-1" display="menu" />
    )

    expect(screen.getByRole('button', { name: /Need a specific agent/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Create agent task/i }))

    expect(screen.getByRole('menuitem', { name: /Incident Analyser/i })).toHaveAttribute(
      'href',
      '/organization/org-1/project/project-1/environment/env-1/service/create/agentic-workflow?template=incident-analyser'
    )
    expect(screen.getByRole('menuitem', { name: /Manual/i })).toHaveAttribute(
      'href',
      '/organization/org-1/project/project-1/environment/env-1/service/create/agentic-workflow'
    )
    expect(screen.queryByRole('menuitem', { name: /Start from scratch/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /Need a specific agent/i })).not.toBeInTheDocument()
  })
})
