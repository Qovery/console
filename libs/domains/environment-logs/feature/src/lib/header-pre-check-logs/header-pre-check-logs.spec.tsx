import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HeaderPreCheckLogs, type HeaderPreCheckLogsProps } from './header-pre-check-logs'

const mockProps: HeaderPreCheckLogsProps = {
  environment: {
    id: 'env-id',
    name: 'Test Environment',
    organization: {
      id: 'org-id',
    },
    project: {
      id: 'project-id',
    },
    cloud_provider: {
      provider: 'AWS',
    },
  },
  preCheckStage: {
    status: 'SUCCESS',
    total_duration_sec: 125,
  },
}

describe('HeaderPreCheckLogs', () => {
  it('renders correctly with given props', () => {
    renderWithProviders(<HeaderPreCheckLogs {...mockProps} />)

    expect(screen.getByText('Pre-check')).toBeInTheDocument()
    expect(screen.getByText('2m : 5s')).toBeInTheDocument()
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
