import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HeaderEnvironmentStages, type HeaderEnvironmentStagesProps } from './header-environment-stages'

describe('HeaderEnvironmentStages', () => {
  const defaultProps: HeaderEnvironmentStagesProps = {
    environment: {
      name: 'Test Environment',
      cloud_provider: {
        provider: 'AWS',
      },
    },
    environmentStatus: {
      state: 'RUNNING',
      total_deployment_duration_in_seconds: 125,
      last_deployment_state: 'DEPLOYED',
    },
  }

  it('renders the environment name', () => {
    renderWithProviders(<HeaderEnvironmentStages {...defaultProps} />)
    expect(screen.getByText('Test Environment')).toBeInTheDocument()
  })

  it('renders the deployment duration when not deploying', () => {
    renderWithProviders(<HeaderEnvironmentStages {...defaultProps} />)
    expect(screen.getByText('2m : 5s')).toBeInTheDocument()
  })

  it('does not render the deployment duration when deploying', () => {
    const props = {
      ...defaultProps,
      environmentStatus: {
        ...defaultProps.environmentStatus,
        state: 'DEPLOYING',
      },
    }
    renderWithProviders(<HeaderEnvironmentStages {...props} />)
    expect(screen.queryByText('2m : 5s')).not.toBeInTheDocument()
  })

  it('renders children when provided', () => {
    renderWithProviders(
      <HeaderEnvironmentStages {...defaultProps}>
        <div data-testid="child-element">Child Content</div>
      </HeaderEnvironmentStages>
    )
    expect(screen.getByTestId('child-element')).toBeInTheDocument()
  })
})
