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

  describe('nginx logs', () => {
    const nginxLog = {
      ...mockLog,
      app: 'ingress-nginx',
    }

    it('should render NGINX badge for nginx logs', () => {
      renderRowServiceLogs(nginxLog)

      expect(screen.getByText('NGINX')).toBeInTheDocument()
      expect(screen.queryByText('12345')).not.toBeInTheDocument()
    })

    it('should not expand nginx log row on click', async () => {
      const { userEvent } = renderRowServiceLogs(nginxLog)

      await userEvent.click(screen.getByText('Test log message'))
      expect(screen.queryByText('Instance')).not.toBeInTheDocument()
      expect(screen.queryByText('Container')).not.toBeInTheDocument()
    })

    it('should not show container cell for nginx logs when hasMultipleContainers is true', () => {
      renderRowServiceLogs(nginxLog, true)

      expect(screen.getByText('NGINX')).toBeInTheDocument()
      expect(screen.queryByText('test-container')).not.toBeInTheDocument()
    })
  })

  describe('envoy logs', () => {
    const envoyLog = {
      ...mockLog,
      app: 'envoy',
    }

    it('should render ENVOY badge for envoy logs', () => {
      renderRowServiceLogs(envoyLog)

      expect(screen.getByText('ENVOY')).toBeInTheDocument()
      expect(screen.queryByText('12345')).not.toBeInTheDocument()
    })

    it('should not expand envoy log row on click', async () => {
      const { userEvent } = renderRowServiceLogs(envoyLog)

      await userEvent.click(screen.getByText('Test log message'))
      expect(screen.queryByText('Instance')).not.toBeInTheDocument()
      expect(screen.queryByText('Container')).not.toBeInTheDocument()
    })

    it('should not show container cell for envoy logs when hasMultipleContainers is true', () => {
      renderRowServiceLogs(envoyLog, true)

      expect(screen.getByText('ENVOY')).toBeInTheDocument()
      expect(screen.queryByText('test-container')).not.toBeInTheDocument()
    })
  })

  describe('regular service logs', () => {
    it('should render instance button for regular service logs', () => {
      renderRowServiceLogs(mockLog)

      expect(screen.getByText('12345')).toBeInTheDocument()
      expect(screen.queryByText('NGINX')).not.toBeInTheDocument()
      expect(screen.queryByText('ENVOY')).not.toBeInTheDocument()
    })

    it('should expand regular service log row on click', async () => {
      const { userEvent } = renderRowServiceLogs(mockLog)

      await userEvent.click(screen.getByText('Test log message'))
      expect(screen.getByText('Instance')).toBeInTheDocument()
      expect(screen.getByText('Container')).toBeInTheDocument()
    })

    it('should show container cell for regular logs when hasMultipleContainers is true', () => {
      renderRowServiceLogs(mockLog, true)

      expect(screen.getAllByText('test-container')).toHaveLength(1)
      expect(screen.queryByText('NGINX')).not.toBeInTheDocument()
      expect(screen.queryByText('ENVOY')).not.toBeInTheDocument()
    })
  })
})
