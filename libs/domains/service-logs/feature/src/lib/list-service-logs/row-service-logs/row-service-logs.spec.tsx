import { TablePrimitives } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceLogsProvider } from '../service-logs-context/service-logs-context'
import RowServiceLogs from './row-service-logs'

const { Table } = TablePrimitives

describe('RowServiceLogs', () => {
  const mockLog = {
    timestamp: '1680350400000',
    message: 'Test log message',
    instance: 'test-pod-12345',
    container: 'test-container',
    version: '1.0.0',
    level: 'INFO' as const,
  }

  const mockEnvironment = {
    id: 'env-1',
    organization: { id: 'org-1' },
    project: { id: 'proj-1' },
  }

  const mockServiceStatus = {
    execution_id: 'exec-1',
  }

  const renderRowServiceLogs = (log = mockLog, hasMultipleContainers = false, highlightedText?: string) => {
    return renderWithProviders(
      <ServiceLogsProvider environment={mockEnvironment} serviceId="service-1" serviceStatus={mockServiceStatus}>
        {/* Necessary to remove DOM warning */}
        <Table.Root>
          <Table.Body>
            <RowServiceLogs log={log} hasMultipleContainers={hasMultipleContainers} highlightedText={highlightedText} />
          </Table.Body>
        </Table.Root>
      </ServiceLogsProvider>
    )
  }

  it('should render successfully', () => {
    const { baseElement } = renderRowServiceLogs()
    expect(baseElement).toBeTruthy()
  })

  it('renders basic row content', () => {
    renderRowServiceLogs()

    expect(screen.getByText('12345')).toBeInTheDocument()
    expect(screen.getByText('Test log message')).toBeInTheDocument()
  })

  it('toggles expanded state on click', async () => {
    const { userEvent } = renderRowServiceLogs()

    await userEvent.click(screen.getByText('Test log message'))
    expect(screen.getByText('Instance')).toBeInTheDocument()
    expect(screen.getByText('Container')).toBeInTheDocument()
  })

  it('renders cell has more than two container', () => {
    renderRowServiceLogs(mockLog, true)

    expect(screen.getAllByText('test-container')).toHaveLength(1)
  })
})
