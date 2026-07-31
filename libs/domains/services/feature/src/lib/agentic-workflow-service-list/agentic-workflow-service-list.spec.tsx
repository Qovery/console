import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowServiceList } from './agentic-workflow-service-list'

const mockUseAgenticWorkflowServices = jest.fn()

jest.mock('../hooks/use-agentic-workflow-services/use-agentic-workflow-services', () => ({
  useAgenticWorkflowServices: () => mockUseAgenticWorkflowServices(),
}))

describe('AgenticWorkflowServiceList', () => {
  it('should not render an empty section', () => {
    mockUseAgenticWorkflowServices.mockReturnValue({ data: [] })
    const { container } = renderWithProviders(<AgenticWorkflowServiceList environmentId="environment-1" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should render agentic workflows in their own section', () => {
    mockUseAgenticWorkflowServices.mockReturnValue({
      data: [
        { id: 'workflow-1', name: 'Review pull requests', enabled: true, model: { type: 'CLAUDE' } },
        { id: 'workflow-2', name: 'Triage incidents', enabled: false, model: { type: 'OPENAI' } },
      ],
    })
    renderWithProviders(<AgenticWorkflowServiceList environmentId="environment-1" />)

    expect(screen.getByRole('heading', { name: 'Agentic workflows' })).toBeInTheDocument()
    expect(screen.getByText('Review pull requests')).toBeInTheDocument()
    expect(screen.getByText('Triage incidents')).toBeInTheDocument()
    expect(screen.getByText('1 enabled')).toBeInTheDocument()
    expect(screen.getByText('CLAUDE')).toBeInTheDocument()
  })
})
