import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HeaderEnvironmentStages, type HeaderEnvironmentStagesProps } from './header-environment-stages'

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
  ...jest.requireActual('@tanstack/react-router'),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
  useParams: () => ({
    organizationId: '0',
    projectId: '1',
    environmentId: '2',
    serviceId: '3',
    versionId: '4',
  }),
}))

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
