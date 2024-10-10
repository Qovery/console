import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { RowDeploymentLogs } from './row-deployment-logs'

describe('RowDeploymentLogs', () => {
  const mockProps = {
    index: 0,
    original: {
      id: 1,
      timestamp: '2023-04-01T12:00:00Z',
      message: {
        safe_message: 'Test log message',
      },
      details: {
        stage: {
          step: 'Building',
        },
      },
    },
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<RowDeploymentLogs {...mockProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('renders basic row content', () => {
    renderWithProviders(<RowDeploymentLogs {...mockProps} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Test log message')).toBeInTheDocument()
  })
})
