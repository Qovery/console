import * as tanstackReactRouter from '@tanstack/react-router'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useDeployCluster from '../hooks/use-deploy-cluster/use-deploy-cluster'
import { ClusterUpdateModal } from './cluster-update-modal'

const useDeployClusterMockSpy = jest.spyOn(useDeployCluster, 'useDeployCluster') as jest.Mock
const useNavigateMockSpy = jest.spyOn(tanstackReactRouter, 'useNavigate') as jest.Mock

const mockNavigate = jest.fn()
const mockDeployCluster = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
}))

describe('ClusterUpdateModal', () => {
  const mockCluster = {
    id: 'cluster-1',
    name: 'Test Cluster',
    organization: {
      id: 'org-1',
    },
  }

  beforeEach(() => {
    useDeployClusterMockSpy.mockReturnValue({
      mutateAsync: mockDeployCluster,
      isLoading: false,
    })
    useNavigateMockSpy.mockReturnValue(mockNavigate)
    mockDeployCluster.mockReset()
    mockNavigate.mockReset()
  })
  it('should render the modal with cluster name', () => {
    renderWithProviders(<ClusterUpdateModal cluster={mockCluster} />)

    expect(screen.getByText('Test Cluster')).toBeInTheDocument()
  })

  it('should call deployCluster with right params when form is submitted', async () => {
    const { userEvent } = renderWithProviders(<ClusterUpdateModal cluster={mockCluster} />)

    const input = screen.getByTestId('input-value')
    await userEvent.type(input, 'Test Cluster')

    const submitButton = screen.getByTestId('submit-button')
    await userEvent.click(submitButton)

    expect(mockDeployCluster).toHaveBeenCalledWith({
      organizationId: mockCluster.organization.id,
      clusterId: mockCluster.id,
      dryRun: false,
    })
  })

  it('should toggle dryRun value when checkbox is clicked', async () => {
    const { userEvent } = renderWithProviders(<ClusterUpdateModal cluster={mockCluster} />)

    const checkbox = screen.getByRole('checkbox', { name: /dry-run/i })
    expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('should not redirect to cluster logs page when dry-run is not selected', async () => {
    const { userEvent } = renderWithProviders(<ClusterUpdateModal cluster={mockCluster} />)

    const submitButton = screen.getByTestId('submit-button')
    await userEvent.click(submitButton)

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should redirect to cluster logs page when dry-run is selected', async () => {
    const { userEvent } = renderWithProviders(<ClusterUpdateModal cluster={mockCluster} />)

    const input = screen.getByTestId('input-value')
    await userEvent.type(input, 'Test Cluster')

    const checkbox = screen.getByRole('checkbox', { name: /dry-run/i })
    await userEvent.click(checkbox)

    const submitButton = screen.getByTestId('submit-button')
    await userEvent.click(submitButton)

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/cluster/$clusterId/cluster-logs',
      params: {
        organizationId: mockCluster.organization.id,
        clusterId: mockCluster.id,
      },
    })
  })
})
