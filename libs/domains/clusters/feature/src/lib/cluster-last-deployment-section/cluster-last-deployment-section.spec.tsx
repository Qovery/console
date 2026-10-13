import { TooltipProvider } from '@radix-ui/react-tooltip'
import posthog from 'posthog-js'
import {
  type ClusterDeploymentHistory,
  ClusterDeploymentHistoryOperationEnum,
  ClusterStateEnum,
  type ClusterStatus,
  DeploymentHistoryTriggerAction,
  DeploymentInfraReason,
} from 'qovery-typescript-axios'
import type { ReactNode } from 'react'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/context'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type UseClusterDeploymentHistoryProps } from '../hooks/use-cluster-deployment-history/use-cluster-deployment-history'
import { ClusterLastDeploymentSection } from './cluster-last-deployment-section'

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    capture: jest.fn(),
  },
}))

jest.mock('@qovery/shared/util-dates', () => ({
  ...jest.requireActual('@qovery/shared/util-dates'),
  dateUTCString: () => 'mocked-date',
  timeAgo: () => 'mocked-time',
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Link: ({
    children,
    params,
    to,
    ...props
  }: {
    children?: ReactNode
    params: Record<string, string>
    to: string
    [key: string]: unknown
  }) => (
    <a {...props} href={Object.entries(params).reduce((path, [key, value]) => path.replace(`$${key}`, value), to)}>
      {children}
    </a>
  ),
}))

let mockClusterDeploymentHistoryProps: UseClusterDeploymentHistoryProps | undefined

const defaultDeploymentHistory: ClusterDeploymentHistory[] = [
  {
    identifier: {
      deployment_id: 'deployment-1',
      execution_id: 'execution-1',
      cluster_id: 'cluster-1',
    },
    auditing_data: {
      created_at: '2026-08-10T12:30:00Z',
      updated_at: '2026-08-10T12:31:00Z',
    },
    status: 'DEPLOYED',
    action_status: 'SUCCESS',
    trigger_action: 'DEPLOY',
    operation: ClusterDeploymentHistoryOperationEnum.CLUSTER,
    is_dry_run: false,
    reason: 'UNSPECIFIED',
    total_duration: 'PT1M',
  },
]

let mockDeploymentHistory = defaultDeploymentHistory

jest.mock('../hooks/use-cluster-deployment-history/use-cluster-deployment-history', () => ({
  useClusterDeploymentHistory: (props: UseClusterDeploymentHistoryProps) => {
    mockClusterDeploymentHistoryProps = props

    return {
      data: mockDeploymentHistory,
      isFetched: true,
    }
  },
}))

const baseClusterStatus: ClusterStatus = {
  cluster_id: 'cluster-1',
  status: ClusterStateEnum.DEPLOYED,
  is_deployed: true,
  last_execution_id: 'execution-1',
  last_deployment_date: '2026-08-10T12:30:00Z',
  reason: DeploymentInfraReason.UNSPECIFIED,
}

const mockSetDevopsCopilotOpen = jest.fn()
const mockSendMessage = jest.fn()

const wrapper = ({ children }: { children: ReactNode }) => (
  <DevopsCopilotContext.Provider
    value={{
      devopsCopilotOpen: false,
      setDevopsCopilotOpen: mockSetDevopsCopilotOpen,
      sendMessageRef: { current: mockSendMessage },
    }}
  >
    <TooltipProvider>{children}</TooltipProvider>
  </DevopsCopilotContext.Provider>
)

describe('ClusterLastDeploymentSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockClusterDeploymentHistoryProps = undefined
    mockDeploymentHistory = defaultDeploymentHistory
  })

  it('renders the latest cluster deployment row linked to its deployment logs', () => {
    renderWithProviders(
      <ClusterLastDeploymentSection organizationId="org-1" clusterId="cluster-1" clusterStatus={baseClusterStatus} />
    )

    const link = screen.getByText('Deploy').closest('a')

    expect(screen.getByText('Last deployment')).toBeInTheDocument()
    expect(screen.getByText('mocked-time ago')).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/organization/org-1/cluster/cluster-1/deployments/logs/deployment-1')
  })

  it('renders a link to the deployments tab', () => {
    renderWithProviders(
      <ClusterLastDeploymentSection organizationId="org-1" clusterId="cluster-1" clusterStatus={baseClusterStatus} />
    )

    const link = screen.getByText('See all deployments').closest('a')

    expect(link).toHaveAttribute('href', '/organization/org-1/cluster/cluster-1/deployments')
  })

  it('does not poll deployment history when the cluster is not deploying', () => {
    renderWithProviders(
      <ClusterLastDeploymentSection organizationId="org-1" clusterId="cluster-1" clusterStatus={baseClusterStatus} />
    )

    expect(mockClusterDeploymentHistoryProps).toEqual({
      organizationId: 'org-1',
      clusterId: 'cluster-1',
      refetchInterval: undefined,
    })
  })

  it('polls deployment history while the cluster is deploying', () => {
    renderWithProviders(
      <ClusterLastDeploymentSection
        organizationId="org-1"
        clusterId="cluster-1"
        clusterStatus={{ ...baseClusterStatus, status: ClusterStateEnum.DEPLOYING }}
      />
    )

    expect(mockClusterDeploymentHistoryProps?.refetchInterval).toBe(5000)
  })

  it('uses the deployment type when it is returned by the API payload', () => {
    renderWithProviders(
      <ClusterLastDeploymentSection
        organizationId="org-1"
        clusterId="cluster-1"
        clusterStatus={
          {
            ...baseClusterStatus,
            trigger_action: DeploymentHistoryTriggerAction.STOP,
          } as ClusterStatus & { trigger_action: DeploymentHistoryTriggerAction }
        }
      />
    )

    expect(screen.getByText('Stop')).toBeInTheDocument()
  })

  it('renders the deployment reason when the cluster deployment is maintenance', () => {
    renderWithProviders(
      <ClusterLastDeploymentSection
        organizationId="org-1"
        clusterId="cluster-1"
        clusterStatus={{
          ...baseClusterStatus,
          reason: DeploymentInfraReason.MAINTENANCE,
        }}
      />
    )

    expect(screen.getByText('Maintenance')).toBeInTheDocument()
  })

  it('renders the Operator action with the reason when the last deployment is an Operator update', () => {
    mockDeploymentHistory = [
      { ...defaultDeploymentHistory[0], operation: ClusterDeploymentHistoryOperationEnum.OPERATOR_UPDATE },
    ]

    renderWithProviders(
      <ClusterLastDeploymentSection
        organizationId="org-1"
        clusterId="cluster-1"
        clusterStatus={{ ...baseClusterStatus, reason: DeploymentInfraReason.MAINTENANCE }}
      />
    )

    expect(screen.getByText('Operator')).toBeInTheDocument()
    expect(screen.queryByText('Deploy')).not.toBeInTheDocument()
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
    expect(screen.getByText('Operator').closest('a')?.querySelector('[tabindex]')).toBeNull()
  })

  it('renders the Deploy action when the cluster status has no last execution id', () => {
    mockDeploymentHistory = [
      { ...defaultDeploymentHistory[0], operation: ClusterDeploymentHistoryOperationEnum.OPERATOR_UPDATE },
    ]

    renderWithProviders(
      <ClusterLastDeploymentSection
        organizationId="org-1"
        clusterId="cluster-1"
        clusterStatus={{ ...baseClusterStatus, last_execution_id: undefined }}
      />
    )

    expect(screen.getByText('Deploy')).toBeInTheDocument()
    expect(screen.queryByText('Operator')).not.toBeInTheDocument()
  })

  it('renders the Deploy action when the last deployment is a cluster deployment', () => {
    renderWithProviders(
      <ClusterLastDeploymentSection organizationId="org-1" clusterId="cluster-1" clusterStatus={baseClusterStatus} />
    )

    expect(screen.getByText('Deploy')).toBeInTheDocument()
    expect(screen.queryByText('Operator')).not.toBeInTheDocument()
  })

  it('renders the Deploy action when operation is missing from the payload', () => {
    const legacyDeployment: Partial<ClusterDeploymentHistory> = { ...defaultDeploymentHistory[0] }
    delete legacyDeployment.operation
    mockDeploymentHistory = [legacyDeployment as ClusterDeploymentHistory]

    renderWithProviders(
      <ClusterLastDeploymentSection organizationId="org-1" clusterId="cluster-1" clusterStatus={baseClusterStatus} />
    )

    expect(screen.getByText('Deploy')).toBeInTheDocument()
    expect(screen.queryByText('Operator')).not.toBeInTheDocument()
  })

  it('ignores a stale Operator update when the cluster status points to a newer execution', () => {
    mockDeploymentHistory = [
      { ...defaultDeploymentHistory[0], operation: ClusterDeploymentHistoryOperationEnum.OPERATOR_UPDATE },
    ]

    renderWithProviders(
      <ClusterLastDeploymentSection
        organizationId="org-1"
        clusterId="cluster-1"
        clusterStatus={
          {
            ...baseClusterStatus,
            status: ClusterStateEnum.STOPPED,
            last_execution_id: 'execution-2',
            trigger_action: DeploymentHistoryTriggerAction.STOP,
          } as ClusterStatus & { trigger_action: DeploymentHistoryTriggerAction }
        }
      />
    )

    expect(screen.getByText('Stop')).toBeInTheDocument()
    expect(screen.queryByText('Operator')).not.toBeInTheDocument()
  })

  it('renders an empty state when the cluster has no deployment information', () => {
    renderWithProviders(
      <ClusterLastDeploymentSection
        organizationId="org-1"
        clusterId="cluster-1"
        clusterStatus={{
          ...baseClusterStatus,
          last_execution_id: null,
          last_deployment_date: null,
        }}
      />
    )

    expect(screen.getByText('No deployment recorded yet')).toBeInTheDocument()
  })

  it('renders a skeleton while loading', () => {
    const { container } = renderWithProviders(
      <ClusterLastDeploymentSection organizationId="org-1" clusterId="cluster-1" isLoading />
    )

    expect(container.querySelectorAll('[aria-busy="true"]').length).toBeGreaterThan(0)
  })

  it('launches a diagnostic for a failed cluster deployment', () => {
    renderWithProviders(
      <ClusterLastDeploymentSection
        organizationId="org-1"
        clusterId="cluster-1"
        clusterStatus={{ ...baseClusterStatus, status: ClusterStateEnum.DEPLOYMENT_ERROR }}
      />,
      { wrapper }
    )

    screen.getByRole('button', { name: 'Launch diagnostic' }).click()

    expect(mockSetDevopsCopilotOpen).toHaveBeenCalledWith(true)
    expect(mockSendMessage).toHaveBeenCalledWith('Why did my cluster deployment fail? (cluster id: cluster-1)')
    expect(posthog.capture).toHaveBeenCalledWith('ai-copilot-troubleshoot-triggered', {
      source: 'cluster-last-deployment',
      troubleshoot_type: 'cluster',
      deployment_id: 'execution-1',
      cluster_id: 'cluster-1',
      trigger_reason: 'error',
    })
  })
})
