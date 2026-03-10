import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentStages, type EnvironmentStagesProps } from './environment-stages'

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({ organizationId: 'org-1', projectId: 'proj-1', environmentId: 'env-1' }),
  Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
}))

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
})
