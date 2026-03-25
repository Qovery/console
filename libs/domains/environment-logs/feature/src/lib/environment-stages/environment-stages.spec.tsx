import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentStages, type EnvironmentStagesProps } from './environment-stages'

const mockDeploymentHistory = [
  {
    identifier: {
      execution_id: 'exec-123',
    },
    status: 'DEPLOYED',
    action_status: 'SUCCESS',
    trigger_action: 'DEPLOY',
    total_duration: 'PT60M',
    stages: [
      {
        name: 'build',
        status: 'SUCCESS',
        duration: 'PT60M',
        services: [
          {
            identifier: {
              name: 'web-service',
              service_id: 'service-123',
              execution_id: 'exec-123',
              service_type: 'APPLICATION',
            },
            status_details: {
              status: 'SUCCESS',
            },
            total_duration: 'PT60M',
            auditing_data: {
              created_at: '2024-01-30T12:00:00Z',
              updated_at: '2024-01-30T12:01:00Z',
              origin: 'CONSOLE',
              triggered_by: 'User',
            },
          },
        ],
      },
    ],
    auditing_data: {
      created_at: '2024-01-30T12:00:00Z',
      updated_at: '2024-01-30T12:01:00Z',
      origin: 'CONSOLE',
      triggered_by: 'User',
    },
  },
]

jest.mock('@qovery/domains/environments/feature', () => ({
  ...jest.requireActual('@qovery/domains/environments/feature'),
  useDeploymentHistory: () => ({
    data: mockDeploymentHistory,
    isFetched: true,
  }),
}))

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
