import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_PRE_CHECK_LOGS_URL } from '@qovery/shared/routes'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentStages, type EnvironmentStagesProps } from './environment-stages'

describe('EnvironmentStages', () => {
  const defaultProps: EnvironmentStagesProps = {
    environment: {
      id: 'env-1',
      name: 'Test Environment',
      organization: { id: 'org-1' },
      project: { id: 'proj-1' },
      cloud_provider: {
        provider: 'AWS',
      },
    },
    environmentStatus: {
      state: 'RUNNING',
      last_deployment_id: 'exec-1',
    },
    hideSkipped: false,
    setHideSkipped: jest.fn(),
    deploymentStages: [],
    preCheckStage: {
      status: 'SUCCESS',
      total_duration_sec: 120,
    },
  }

  it('renders loading spinner when deploymentStages is undefined', () => {
    renderWithProviders(<EnvironmentStages {...defaultProps} deploymentStages={undefined} />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('renders pre-check stage when preCheckStage is provided', () => {
    renderWithProviders(<EnvironmentStages {...defaultProps} />)
    expect(screen.getByText('Pre-check')).toBeInTheDocument()
  })

  it('renders children when deploymentStages is provided', () => {
    renderWithProviders(
      <EnvironmentStages {...defaultProps}>
        <div data-testid="child-content">Child Content</div>
      </EnvironmentStages>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('renders the "Hide skipped" checkbox', () => {
    renderWithProviders(<EnvironmentStages {...defaultProps} />)
    expect(screen.getByLabelText('Hide skipped')).toBeInTheDocument()
  })

  it('renders the correct link for pre-check logs', () => {
    renderWithProviders(<EnvironmentStages {...defaultProps} />)
    const logLink = screen.getByText('Pre-check logs').closest('a')
    expect(logLink).toHaveAttribute(
      'href',
      ENVIRONMENT_LOGS_URL('org-1', 'proj-1', 'env-1') + ENVIRONMENT_PRE_CHECK_LOGS_URL('exec-1')
    )
  })
})
