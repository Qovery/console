import { type Cluster, type ClusterStatus } from 'qovery-typescript-axios'
import { fireEvent, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useClusterDeploymentErrorServices } from '../hooks/use-cluster-deployment-error-services/use-cluster-deployment-error-services'
import { useClusterRunningErrorServices } from '../hooks/use-cluster-running-error-services/use-cluster-running-error-services'
import { useClusterRunningStatusSocket } from '../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket'
import { ClusterServiceDeploymentStatusSockets } from '../hooks/use-cluster-service-deployment-status-socket/cluster-service-deployment-status-sockets'
import { ClusterServiceRunningStatusSockets } from '../hooks/use-cluster-service-running-status-socket/cluster-service-running-status-sockets'
import { ClusterProductionCard } from './cluster-production-card'

const mockNavigate = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))
jest.mock('../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket')
jest.mock('../hooks/use-cluster-deployment-error-services/use-cluster-deployment-error-services')
jest.mock('../hooks/use-cluster-running-error-services/use-cluster-running-error-services')
jest.mock('../hooks/use-cluster-service-deployment-status-socket/cluster-service-deployment-status-sockets', () => ({
  ClusterServiceDeploymentStatusSockets: jest.fn(() => null),
}))
jest.mock('../hooks/use-cluster-service-running-status-socket/cluster-service-running-status-sockets', () => ({
  ClusterServiceRunningStatusSockets: jest.fn(() => null),
}))
jest.mock('../cluster-running-status-indicator/cluster-running-status-indicator', () => ({
  ClusterRunningStatusIndicator: () => <span data-testid="cluster-running-status-indicator" />,
}))

const mockUseClusterRunningStatusSocket = jest.mocked(useClusterRunningStatusSocket)
const mockUseClusterDeploymentErrorServices = jest.mocked(useClusterDeploymentErrorServices)
const mockUseClusterRunningErrorServices = jest.mocked(useClusterRunningErrorServices)
const mockClusterServiceDeploymentStatusSockets = jest.mocked(ClusterServiceDeploymentStatusSockets)
const mockClusterServiceRunningStatusSockets = jest.mocked(ClusterServiceRunningStatusSockets)

const mockCluster = {
  id: 'cluster-id',
  name: 'kube-production',
  organization: { id: 'org-id' },
  cloud_provider: 'AWS',
  production: true,
} as Cluster

const mockClusterStatus = {
  status: 'DEPLOYED',
} as ClusterStatus

describe('ClusterProductionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseClusterDeploymentErrorServices.mockReturnValue({
      serviceCount: 200,
      allErrorServices: [],
      errorServiceCount: 0,
      errorServices: [],
      hiddenErrorServiceCount: 0,
    })
    mockUseClusterRunningErrorServices.mockReturnValue({
      serviceCount: 200,
      allErrorServices: [],
      errorServiceCount: 0,
      errorServices: [],
      hiddenErrorServiceCount: 0,
    })
  })

  it('should display the healthy state when services are up to date', () => {
    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    expect(screen.getByText('200 services')).toBeInTheDocument()
    expect(screen.getByText('All services running and up to date')).toBeInTheDocument()
    expect(screen.queryByText(/issues ongoing on your services/i)).not.toBeInTheDocument()
  })

  it('should display a single mixed accordion with running and deployment issues', () => {
    mockUseClusterRunningErrorServices.mockReturnValue({
      serviceCount: 200,
      allErrorServices: [
        {
          environmentId: 'env-1',
          environmentName: 'web-alan-website',
          projectId: 'project-1',
          projectName: 'activepieces-prod',
          serviceId: 'service-1',
          serviceName: 'activepieces-prod-cloudflared',
        },
        {
          environmentId: 'env-2',
          environmentName: 'billing',
          projectId: 'project-2',
          projectName: 'backoffice',
          serviceId: 'service-2',
          serviceName: 'gateway',
        },
        {
          environmentId: 'env-3',
          environmentName: 'core',
          projectId: 'project-3',
          projectName: 'platform',
          serviceId: 'service-3',
          serviceName: 'worker',
        },
      ],
      errorServiceCount: 3,
      errorServices: [],
      hiddenErrorServiceCount: 0,
    })
    mockUseClusterDeploymentErrorServices.mockReturnValue({
      serviceCount: 200,
      allErrorServices: [
        {
          environmentId: 'env-4',
          environmentName: 'checkout',
          projectId: 'project-4',
          projectName: 'storefront',
          serviceId: 'service-4',
          serviceName: 'frontend',
          state: 'DEPLOYMENT_ERROR',
          stateLabel: 'Deployment error',
        },
        {
          environmentId: 'env-5',
          environmentName: 'payments',
          projectId: 'project-5',
          projectName: 'wallet',
          serviceId: 'service-5',
          serviceName: 'api',
          state: 'BUILD_ERROR',
          stateLabel: 'Build error',
        },
        {
          environmentId: 'env-6',
          environmentName: 'admin',
          projectId: 'project-6',
          projectName: 'zeta',
          serviceId: 'service-6',
          serviceName: 'panel',
          state: 'BUILD_ERROR',
          stateLabel: 'Build error',
        },
      ],
      errorServiceCount: 3,
      errorServices: [],
      hiddenErrorServiceCount: 0,
    })

    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    expect(screen.getByText('6 issues ongoing on your services')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: 'activepieces-prod / web-alan-website / activepieces-prod-cloudflared Error',
      })
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /6 issues ongoing on your services/i }))

    expect(
      screen.getByRole('button', {
        name: 'activepieces-prod / web-alan-website / activepieces-prod-cloudflared Error',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'storefront / checkout / frontend Deployment error',
      })
    ).toBeInTheDocument()
    expect(screen.queryByText('All services running and up to date')).not.toBeInTheDocument()
  })

  it('should navigate to the related service when a mixed issue item is clicked', () => {
    mockUseClusterDeploymentErrorServices.mockReturnValue({
      serviceCount: 200,
      allErrorServices: [
        {
          environmentId: 'env-2',
          environmentName: 'billing',
          projectId: 'project-2',
          projectName: 'backoffice',
          serviceId: 'service-2',
          serviceName: 'gateway',
          state: 'DEPLOYMENT_ERROR',
          stateLabel: 'Deployment error',
        },
      ],
      errorServiceCount: 1,
      errorServices: [],
      hiddenErrorServiceCount: 0,
    })

    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    fireEvent.click(screen.getByRole('button', { name: /1 issue ongoing on your services/i }))
    fireEvent.click(screen.getByRole('button', { name: 'backoffice / billing / gateway Deployment error' }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
      params: {
        organizationId: 'org-id',
        projectId: 'project-2',
        environmentId: 'env-2',
        serviceId: 'service-2',
      },
    })
  })

  it('should toggle the accordion without navigating to the cluster overview', () => {
    mockUseClusterRunningErrorServices.mockReturnValue({
      serviceCount: 200,
      allErrorServices: [
        {
          environmentId: 'env-1',
          environmentName: 'web-alan-website',
          projectId: 'project-1',
          projectName: 'activepieces-prod',
          serviceId: 'service-1',
          serviceName: 'activepieces-prod-cloudflared',
        },
      ],
      errorServiceCount: 1,
      errorServices: [],
      hiddenErrorServiceCount: 0,
    })

    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    fireEvent.click(screen.getByRole('button', { name: /1 issue ongoing on your services/i }))

    expect(
      screen.getByRole('button', {
        name: 'activepieces-prod / web-alan-website / activepieces-prod-cloudflared Error',
      })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /1 issue ongoing on your services/i }))

    expect(
      screen.queryByRole('button', {
        name: 'activepieces-prod / web-alan-website / activepieces-prod-cloudflared Error',
      })
    ).not.toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should display the empty state subtitle when the cluster has no services', () => {
    mockUseClusterDeploymentErrorServices.mockReturnValue({
      serviceCount: 0,
      allErrorServices: [],
      errorServiceCount: 0,
      errorServices: [],
      hiddenErrorServiceCount: 0,
    })
    mockUseClusterRunningErrorServices.mockReturnValue({
      serviceCount: 0,
      allErrorServices: [],
      errorServiceCount: 0,
      errorServices: [],
      hiddenErrorServiceCount: 0,
    })

    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    expect(screen.getByText('No services created yet')).toBeInTheDocument()
    expect(screen.queryByText('All services running and up to date')).not.toBeInTheDocument()
  })

  it('should not display the healthy state when the cluster is not deployed', () => {
    renderWithProviders(
      <ClusterProductionCard cluster={mockCluster} clusterStatus={{ status: 'DEPLOYING' } as ClusterStatus} />
    )

    expect(screen.queryByText('All services running and up to date')).not.toBeInTheDocument()
  })

  it('should not display the healthy state when the cluster has issues', () => {
    mockUseClusterDeploymentErrorServices.mockReturnValue({
      serviceCount: 200,
      allErrorServices: [
        {
          environmentId: 'env-2',
          environmentName: 'billing',
          projectId: 'project-2',
          projectName: 'backoffice',
          serviceId: 'service-2',
          serviceName: 'gateway',
          state: 'DEPLOYMENT_ERROR',
          stateLabel: 'Deployment error',
        },
      ],
      errorServiceCount: 1,
      errorServices: [],
      hiddenErrorServiceCount: 0,
    })

    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    expect(screen.queryByText('All services running and up to date')).not.toBeInTheDocument()
  })

  it('should initialize the cluster sockets and navigate to the overview when the card is clicked', () => {
    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    expect(mockUseClusterRunningStatusSocket).toHaveBeenCalledWith({
      organizationId: 'org-id',
      clusterId: 'cluster-id',
    })
    expect(mockClusterServiceRunningStatusSockets).toHaveBeenCalledWith(
      {
        organizationId: 'org-id',
        clusterId: 'cluster-id',
      },
      {}
    )
    expect(mockClusterServiceDeploymentStatusSockets).toHaveBeenCalledWith(
      {
        organizationId: 'org-id',
        clusterId: 'cluster-id',
      },
      {}
    )

    fireEvent.click(screen.getByRole('link'))

    expect(mockNavigate).toHaveBeenLastCalledWith({
      to: '/organization/$organizationId/cluster/$clusterId/overview',
      params: { organizationId: 'org-id', clusterId: 'cluster-id' },
    })
  })
})
