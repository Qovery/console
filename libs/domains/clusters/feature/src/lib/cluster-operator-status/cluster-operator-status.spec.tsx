import { type ClusterOperatorStatusResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useUpdateClusterOperator } from '../hooks/use-update-cluster-operator/use-update-cluster-operator'
import { ClusterOperatorStatus } from './cluster-operator-status'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'organization-id', clusterId: 'cluster-id' }),
}))
jest.mock('../hooks/use-update-cluster-operator/use-update-cluster-operator')

const mockUseUpdateClusterOperator = useUpdateClusterOperator as jest.Mock
const mockUpdateOperator = jest.fn()

const operatorStatus = {
  status: 'OUTDATED_CHART',
  operator_connected: true,
  desired_chart_version: '1.2.0',
  desired_image_version: '1.2.0',
} as ClusterOperatorStatusResponse

describe('ClusterOperatorStatus', () => {
  beforeEach(() => {
    mockUpdateOperator.mockReset()
    mockUseUpdateClusterOperator.mockReturnValue({ mutate: mockUpdateOperator, isLoading: false })
  })

  it('updates the Operator to the target versions', async () => {
    const { userEvent } = renderWithProviders(<ClusterOperatorStatus operatorStatus={operatorStatus} />)

    await userEvent.click(screen.getByRole('button', { name: 'Update Operator' }))

    expect(mockUpdateOperator).toHaveBeenCalledWith({
      organizationId: 'organization-id',
      clusterId: 'cluster-id',
      chartVersion: '1.2.0',
      imageVersion: '1.2.0',
    })
  })

  it('does not start another update while one is in progress', async () => {
    mockUseUpdateClusterOperator.mockReturnValue({ mutate: mockUpdateOperator, isLoading: true })
    const { userEvent } = renderWithProviders(<ClusterOperatorStatus operatorStatus={operatorStatus} />)

    const button = screen.getByRole('button', { name: 'Update Operator' })
    expect(button).toBeDisabled()
    button.focus()
    await userEvent.keyboard('{Enter}')

    expect(mockUpdateOperator).not.toHaveBeenCalled()
  })

  it('hides the update action while the Operator is not connected', () => {
    renderWithProviders(<ClusterOperatorStatus operatorStatus={{ ...operatorStatus, operator_connected: false }} />)

    expect(screen.queryByRole('button', { name: 'Update Operator' })).not.toBeInTheDocument()
  })

  it('disables the update action without a target chart version', () => {
    renderWithProviders(<ClusterOperatorStatus operatorStatus={{ ...operatorStatus, desired_chart_version: null }} />)

    expect(screen.getByRole('button', { name: 'Update Operator' })).toBeDisabled()
  })
})
