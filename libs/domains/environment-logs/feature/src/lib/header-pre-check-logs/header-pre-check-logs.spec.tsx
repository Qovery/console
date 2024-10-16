import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HeaderLogs, HeaderLogsProps } from './header-logs'

const mockProps: HeaderPreCheckLogsProps = {
  environment: {
    name: 'Test Environment',
    cloud_provider: {
      provider: 'AWS',
    },
  },
  environmentStatus: {
    state: 'RUNNING',
    total_deployment_duration_in_seconds: 125,
  },
}

describe('HeaderLogs', () => {
  it('renders correctly with given props', () => {
    renderWithProviders(<HeaderLogs {...mockProps} />)

    expect(screen.getByText('Test Environment')).toBeInTheDocument()
    expect(screen.getByText('Running')).toBeInTheDocument()
    expect(screen.getByText('2m : 5s')).toBeInTheDocument()
  })

  it('does not render deployment duration when status is DEPLOYING', () => {
    const props = {
      ...mockProps,
      environmentStatus: {
        ...mockProps.environmentStatus,
        state: 'DEPLOYING',
      },
    }

    renderWithProviders(<HeaderLogs {...props} />)

    expect(screen.queryByText(/\d+m : \d+s/)).not.toBeInTheDocument()
  })

  it('renders children correctly', () => {
    renderWithProviders(
      <HeaderPreCheckLogs {...mockProps}>
        <div data-testid="child-content">Child Content</div>
      </HeaderPreCheckLogs>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })
})
