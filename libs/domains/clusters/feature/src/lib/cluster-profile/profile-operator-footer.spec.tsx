import { type ClusterOperatorStatusResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useClusterOperatorStatus } from '../hooks/use-cluster-operator-status/use-cluster-operator-status'
import { useUpdateClusterOperator } from '../hooks/use-update-cluster-operator/use-update-cluster-operator'
import { ProfileOperatorFooter } from './profile-operator-footer'

jest.mock('../hooks/use-cluster-operator-status/use-cluster-operator-status')
jest.mock('../hooks/use-update-cluster-operator/use-update-cluster-operator')

const mockUseClusterOperatorStatus = useClusterOperatorStatus as jest.Mock
const mockUseUpdateClusterOperator = useUpdateClusterOperator as jest.Mock
const mockUpdateOperator = jest.fn()

const operatorStatus: ClusterOperatorStatusResponse = {
  organization_id: 'org-123',
  cluster_id: 'cluster-123',
  operator_connected: true,
  last_heartbeat: new Date().toISOString(),
  operator_version: 'v1.202.0',
  desired_image_version: 'v1.203.0',
  reported_chart_version: '0.2.0',
  desired_chart_version: '0.2.1',
  status: 'OUTDATED_IMAGE_AND_CHART',
}

describe('ProfileOperatorFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUpdateClusterOperator.mockReturnValue({ mutate: mockUpdateOperator, isLoading: false })
  })

  it('renders nothing for a cluster without Operator', () => {
    mockUseClusterOperatorStatus.mockReturnValue({ data: null, isLoading: false })
    const { container } = renderWithProviders(
      <ProfileOperatorFooter organizationId="org-123" clusterId="cluster-123" />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('configures polling for the Operator status', () => {
    mockUseClusterOperatorStatus.mockReturnValue({ data: operatorStatus, isLoading: false })
    renderWithProviders(<ProfileOperatorFooter organizationId="org-123" clusterId="cluster-123" />)

    expect(mockUseClusterOperatorStatus).toHaveBeenCalledWith({
      organizationId: 'org-123',
      clusterId: 'cluster-123',
      refetchInterval: 30_000,
    })
    expect(screen.getByRole('button', { name: 'Qovery operator: Update available' })).toBeInTheDocument()
  })

  it('tells when the Operator status cannot be retrieved', async () => {
    mockUseClusterOperatorStatus.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    const { userEvent } = renderWithProviders(
      <ProfileOperatorFooter organizationId="org-123" clusterId="cluster-123" />
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Qovery operator: status unavailable' }))

    expect((await screen.findAllByText('The Operator status could not be retrieved.'))[0]).toBeInTheDocument()
  })

  it('does not keep showing a stale status once a refresh fails', async () => {
    mockUseClusterOperatorStatus.mockReturnValue({ data: operatorStatus, isLoading: false, isError: true })
    const { userEvent } = renderWithProviders(
      <ProfileOperatorFooter organizationId="org-123" clusterId="cluster-123" />
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Qovery operator: status unavailable' }))

    expect((await screen.findAllByText('The Operator status could not be retrieved.'))[0]).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Update Operator' })).not.toBeInTheDocument()
  })

  it('shows the Operator versions in a tooltip and starts an update', async () => {
    mockUseClusterOperatorStatus.mockReturnValue({ data: operatorStatus, isLoading: false })
    const { userEvent } = renderWithProviders(
      <ProfileOperatorFooter organizationId="org-123" clusterId="cluster-123" />
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Qovery operator: Update available' }))

    const status = (await screen.findAllByRole('region', { name: 'Qovery Operator status' }))[0]
    expect(status).toHaveTextContent('Update available')
    expect(status).toHaveTextContent('v1.202.0')
    expect(status).toHaveTextContent('Target: v1.203.0')
    expect(status).toHaveTextContent('0.2.0')
    expect(status).toHaveTextContent('Target: 0.2.1')

    await userEvent.click(screen.getAllByRole('button', { name: 'Update Operator' })[0])

    expect(mockUpdateOperator).toHaveBeenCalledWith({
      organizationId: 'org-123',
      clusterId: 'cluster-123',
      chartVersion: '0.2.1',
      imageVersion: 'v1.203.0',
    })
  })

  it('hides the update action while the Operator is disconnected', async () => {
    mockUseClusterOperatorStatus.mockReturnValue({
      data: { ...operatorStatus, operator_connected: false, status: 'DISCONNECTED' },
      isLoading: false,
    })
    const { userEvent } = renderWithProviders(
      <ProfileOperatorFooter organizationId="org-123" clusterId="cluster-123" />
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Qovery operator: Disconnected' }))

    expect((await screen.findAllByText('No recent heartbeat was received from the Operator.'))[0]).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Update Operator' })).not.toBeInTheDocument()
  })
})
