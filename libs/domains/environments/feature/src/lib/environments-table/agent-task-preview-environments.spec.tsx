import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgentTaskPreviewEnvironments } from './agent-task-preview-environments'

const mockOverview = jest.fn()
jest.mock('@tanstack/react-router', () => ({ useParams: () => ({ projectId: 'project' }) }))
jest.mock('@qovery/domains/projects/feature', () => ({ useEnvironmentsOverview: () => mockOverview() }))
jest.mock('./environment-section/environment-section', () => ({
  EnvironmentSection: ({ title, items }: { title: string; items: Array<{ name: string }> }) => (
    <section>
      <h2>{title}</h2>
      {items.map(({ name }) => (
        <div key={name}>{name}</div>
      ))}
    </section>
  ),
}))

it('only lists agent previews from the current environment', () => {
  const suffix = ' - agentic-workflow-run-9ec8d862-6970-4f99-bc36-0e398203968e'
  mockOverview.mockReturnValue({
    data: [
      { name: 'Source' + suffix, mode: 'PREVIEW' },
      { name: 'Other' + suffix, mode: 'PREVIEW' },
      { name: 'Normal preview', mode: 'PREVIEW' },
    ],
  })
  renderWithProviders(<AgentTaskPreviewEnvironments sourceEnvironmentName="Source" />)
  expect(screen.getByText('Source' + suffix)).toBeInTheDocument()
  expect(screen.queryByText('Other' + suffix)).not.toBeInTheDocument()
  expect(screen.queryByText('Normal preview')).not.toBeInTheDocument()
})
it('hides the table when no agent previews exist', () => {
  mockOverview.mockReturnValue({ data: [] })
  const { container } = renderWithProviders(<AgentTaskPreviewEnvironments sourceEnvironmentName="Source" />)
  expect(container).toBeEmptyDOMElement()
})
