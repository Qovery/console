import { TooltipProvider } from '@radix-ui/react-tooltip'
import posthog from 'posthog-js'
import {
  ClusterStateEnum,
  type ClusterStatus,
  DeploymentHistoryTriggerAction,
  DeploymentInfraReason,
} from 'qovery-typescript-axios'
import type { ReactNode } from 'react'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/context'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
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
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
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
  })

  it('renders the latest cluster deployment row linked to cluster logs', () => {
    renderWithProviders(
      <ClusterLastDeploymentSection organizationId="org-1" clusterId="cluster-1" clusterStatus={baseClusterStatus} />
    )

    const link = screen.getByText('Deploy').closest('a')

    expect(screen.getByText('Last deployment')).toBeInTheDocument()
    expect(screen.getByText('mocked-time ago')).toBeInTheDocument()
    expect(link).toHaveAttribute('to', '/organization/$organizationId/cluster/$clusterId/cluster-logs')
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
    expect(mockSendMessage).toHaveBeenCalledWith('Why did my cluster deployment fail? (deployment id: execution-1)')
    expect(posthog.capture).toHaveBeenCalledWith('ai-copilot-troubleshoot-triggered', {
      source: 'cluster-last-deployment',
      deployment_id: 'execution-1',
      cluster_id: 'cluster-1',
      trigger_reason: 'error',
    })
  })
})
