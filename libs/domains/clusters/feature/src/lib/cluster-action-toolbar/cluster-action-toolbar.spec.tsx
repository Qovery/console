import { ClusterStateEnum, type ClusterStatusGet } from 'qovery-typescript-axios'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterActionToolbar } from './cluster-action-toolbar'

const mockCluster = clusterFactoryMock(1)[0]
const mockClusterStatus: ClusterStatusGet = {
  cluster_id: mockCluster.id,
  status: ClusterStateEnum.DEPLOYED,
  is_deployed: true,
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))

describe('ClusterActionToolbar', () => {
  it('should match manage deployment snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(
      <ClusterActionToolbar cluster={mockCluster} organizationId="1" clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )
    const buttonManageDeployment = screen.getByLabelText(/manage deployment/i)
    await userEvent.click(buttonManageDeployment)

    expect(baseElement).toMatchSnapshot()
  })

  it('should match other actions snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(
      <ClusterActionToolbar cluster={mockCluster} organizationId="1" clusterStatus={mockClusterStatus} />,
      {
        container: document.body,
      }
    )
    const buttonOtherActions = screen.getByLabelText(/other actions/i)
    await userEvent.click(buttonOtherActions)

    expect(baseElement).toMatchSnapshot()
  })
})
