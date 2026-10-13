import { type ClusterDeploymentHistory, ClusterDeploymentHistoryOperationEnum } from 'qovery-typescript-axios'
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
    operation: ClusterDeploymentHistoryOperationEnum.CLUSTER,
    is_dry_run: false,
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
    expect(screen.queryByText('Dry run')).not.toBeInTheDocument()
  })

  it('should render a maintenance badge when reason is MAINTENANCE', () => {
    renderWithProviders(<ClusterDeploymentList organizationId="org-123" clusterId="cluster-123" />)

    expect(screen.getByText('Maintenance')).toBeInTheDocument()
  })

  it('should render the Operator action with its maintenance badge when operation is OPERATOR_UPDATE', async () => {
    mockDeploymentHistory = [
      {
        ...defaultDeploymentHistory[0],
        operation: ClusterDeploymentHistoryOperationEnum.OPERATOR_UPDATE,
      },
    ]
    const { userEvent } = renderWithProviders(
      <ClusterDeploymentList organizationId="org-123" clusterId="cluster-123" />
    )

    await userEvent.hover(screen.getByText('Operator'))

    expect(screen.getByText('Operator')).toBeInTheDocument()
    expect(screen.queryByText('Deploy')).not.toBeInTheDocument()
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
    expect(screen.getByText('Operator').closest('[tabindex]')?.tagName).toBe('TR')
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Operator update')
  })

  it('should render the Deploy action when operation is CLUSTER', () => {
    renderWithProviders(<ClusterDeploymentList organizationId="org-123" clusterId="cluster-123" />)

    expect(screen.getByText('Deploy')).toBeInTheDocument()
    expect(screen.queryByText('Operator')).not.toBeInTheDocument()
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
  })

  it('should render the Deploy action when operation is missing from the payload', () => {
    const legacyDeployment: Partial<ClusterDeploymentHistory> = { ...defaultDeploymentHistory[0] }
    delete legacyDeployment.operation
    mockDeploymentHistory = [legacyDeployment as ClusterDeploymentHistory]

    renderWithProviders(<ClusterDeploymentList organizationId="org-123" clusterId="cluster-123" />)

    expect(screen.getByText('Deploy')).toBeInTheDocument()
    expect(screen.queryByText('Operator')).not.toBeInTheDocument()
  })

  it('should render a dry run badge when the deployment is a dry run', () => {
    mockDeploymentHistory = [
      {
        ...defaultDeploymentHistory[0],
        is_dry_run: true,
      },
    ]

    renderWithProviders(<ClusterDeploymentList organizationId="org-123" clusterId="cluster-123" />)

    expect(screen.getByText('Dry run')).toBeInTheDocument()
  })

  it('should display trigger filters in title case', async () => {
    const { userEvent } = renderWithProviders(
      <ClusterDeploymentList organizationId="org-123" clusterId="cluster-123" />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Trigger by' }))

    expect(screen.getAllByText('Console')).toHaveLength(2)
    expect(screen.queryByText('CONSOLE')).not.toBeInTheDocument()
  })

  it('should render Unknown when the initiator was not recorded', () => {
    mockDeploymentHistory = [
      {
        ...defaultDeploymentHistory[0],
        auditing_data: {
          created_at: '2025-01-23T08:55:20.092474Z',
          updated_at: '2025-01-23T08:55:42.898794Z',
          origin: null,
          triggered_by: null,
        },
      },
    ]
    renderWithProviders(<ClusterDeploymentList organizationId="org-123" clusterId="cluster-123" />)

    expect(screen.getByText('Unknown')).toBeInTheDocument()
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
