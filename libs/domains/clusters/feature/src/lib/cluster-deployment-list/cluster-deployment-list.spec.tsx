import { type ClusterDeploymentHistory } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterDeploymentList } from './cluster-deployment-list'

const defaultDeploymentHistory: ClusterDeploymentHistory[] = [
  {
    identifier: {
      deployment_id: 'deployment-123',
      execution_id: 'exec-123',
      cluster_id: 'cluster-123',
    },
    auditing_data: {
      created_at: '2025-01-23T08:55:20.092474Z',
      updated_at: '2025-01-23T08:55:42.898794Z',
      origin: 'CONSOLE',
      triggered_by: 'John Doe',
    },
    status: 'DEPLOYED',
    action_status: 'SUCCESS',
    trigger_action: 'DEPLOY',
    reason: 'MAINTENANCE',
    total_duration: 'PT16.503S',
  },
]

let mockDeploymentHistory: ClusterDeploymentHistory[] = defaultDeploymentHistory
const mockNavigate = jest.fn()

jest.mock('@tanstack/react-router', () => {
  return {
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/', search: '' }),
    useRouter: () => ({
      buildLocation: () => ({ href: '/' }),
    }),
    Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
  }
})

jest.mock('../hooks/use-cluster-deployment-history/use-cluster-deployment-history', () => ({
  useClusterDeploymentHistory: () => ({
    data: mockDeploymentHistory,
    isFetched: true,
  }),
}))

describe('ClusterDeploymentList', () => {
  beforeEach(() => {
    mockDeploymentHistory = defaultDeploymentHistory
    mockNavigate.mockClear()
  })

  it('should render deployment history rows', () => {
    renderWithProviders(<ClusterDeploymentList organizationId="org-123" clusterId="cluster-123" />)

    expect(screen.getByText('exec-123')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Console')).toBeInTheDocument()
  })

  it('should render a maintenance badge when reason is MAINTENANCE', () => {
    renderWithProviders(<ClusterDeploymentList organizationId="org-123" clusterId="cluster-123" />)

    expect(screen.getByText('Maintenance')).toBeInTheDocument()
  })

  it('should render an empty state when there is no deployment', () => {
    mockDeploymentHistory = []
    renderWithProviders(<ClusterDeploymentList organizationId="org-123" clusterId="cluster-123" />)

    expect(screen.getByText('No deployment started')).toBeInTheDocument()
  })

  it('should navigate to the deployment logs on row click', async () => {
    const { userEvent } = renderWithProviders(
      <ClusterDeploymentList organizationId="org-123" clusterId="cluster-123" />
    )

    await userEvent.click(screen.getByText('exec-123'))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/cluster/$clusterId/deployments/logs/$deploymentId',
      params: {
        organizationId: 'org-123',
        clusterId: 'cluster-123',
        deploymentId: 'deployment-123',
      },
    })
  })
})
