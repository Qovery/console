import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import RowServiceLogs from './row-service-logs'

describe('RowServiceLogs', () => {
  const mockProps = {
    original: {
      id: 1,
      type: 'SERVICE',
      created_at: '2023-04-01T12:00:00Z',
      message: 'Test log message',
      pod_name: 'test-pod-12345',
      container_name: 'test-container',
      version: '1.0.0',
    },
    podNameColor: new Map([['test-pod-12345', '#ff0000']]),
    serviceType: 'CONTAINER',
    getVisibleCells: jest.fn(() => []),
    toggleExpanded: jest.fn(),
    getIsExpanded: jest.fn(() => false),
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<RowServiceLogs {...mockProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('renders basic row content', () => {
    renderWithProviders(<RowServiceLogs {...mockProps} />)

    expect(screen.getByText('12345')).toBeInTheDocument()
    expect(screen.getByText('Test log message')).toBeInTheDocument()
  })

  it('toggles expanded state on click', async () => {
    const { userEvent } = renderWithProviders(<RowServiceLogs {...mockProps} />)

    await userEvent.click(screen.getByText('12345'))
    expect(mockProps.toggleExpanded).toHaveBeenCalledWith(true)
  })

  it('renders HELM specific content for HELM service type', () => {
    const helmProps = {
      ...mockProps,
      serviceType: 'HELM',
    }

    renderWithProviders(<RowServiceLogs {...helmProps} />)

    expect(screen.getAllByText('test-container')).toHaveLength(1)
  })
})
