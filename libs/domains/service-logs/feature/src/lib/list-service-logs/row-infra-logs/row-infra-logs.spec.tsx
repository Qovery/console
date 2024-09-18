import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import RowInfraLogs, { type RowInfraLogsProps } from './row-infra-logs'

describe('RowInfraLogs', () => {
  const mockData = {
    id: 1,
    type: 'INFRA' as const,
    created_at: '2023-04-01T12:00:00Z',
    message: 'Test log message',
  }

  const defaultProps: RowInfraLogsProps = {
    data: mockData,
    enabled: true,
    hasMultipleContainers: true,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<RowInfraLogs {...defaultProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('renders nothing when disabled', () => {
    renderWithProviders(<RowInfraLogs {...defaultProps} enabled={false} />)
    expect(screen.queryByText('NGINX')).not.toBeInTheDocument()
  })

  it('renders correctly when enabled', () => {
    renderWithProviders(<RowInfraLogs {...defaultProps} />)
    expect(screen.getByText('NGINX')).toBeInTheDocument()
    expect(screen.getByText('Test log message')).toBeInTheDocument()
  })
})
