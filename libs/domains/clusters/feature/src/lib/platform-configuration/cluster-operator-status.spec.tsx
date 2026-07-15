import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterOperatorStatus } from './cluster-operator-status'
import * as operatorHooks from './hooks/use-cluster-operator'

describe('ClusterOperatorStatus', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('shows connection and image and chart drift information', () => {
    jest.spyOn(operatorHooks, 'useClusterOperatorStatus').mockReturnValue({
      data: {
        organization_id: 'org-123',
        cluster_id: 'cluster-123',
        operator_connected: true,
        last_heartbeat: '2026-08-18T08:15:50Z',
        operator_version: 'v1.202.0',
        desired_image_version: 'v1.203.0',
        reported_chart_version: '0.2.0',
        desired_chart_version: '0.2.1',
        status: 'OUTDATED_IMAGE_AND_CHART',
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof operatorHooks.useClusterOperatorStatus>)

    renderWithProviders(<ClusterOperatorStatus organizationId="org-123" clusterId="cluster-123" />)

    expect(screen.getByText('Update available')).toBeInTheDocument()
    expect(screen.getByText('v1.202.0')).toBeInTheDocument()
    expect(screen.getByText('Target: v1.203.0')).toBeInTheDocument()
    expect(screen.getByText('0.2.0')).toBeInTheDocument()
    expect(screen.getByText('Target: 0.2.1')).toBeInTheDocument()
  })

  it('shows when the cluster is not attached', () => {
    jest.spyOn(operatorHooks, 'useClusterOperatorStatus').mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof operatorHooks.useClusterOperatorStatus>)

    renderWithProviders(<ClusterOperatorStatus organizationId="org-123" clusterId="cluster-123" />)

    expect(screen.getByText('Not attached')).toBeInTheDocument()
    expect(screen.getByText('Never')).toBeInTheDocument()
  })
})
