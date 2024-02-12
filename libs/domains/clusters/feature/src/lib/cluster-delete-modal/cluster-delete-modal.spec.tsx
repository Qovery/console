import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import ClusterDeleteModal, { type ClusterDeleteModalProps } from './cluster-delete-modal'

const [mockCluster] = clusterFactoryMock(1)

describe('ClusterDeleteModal', () => {
  mockCluster.name = 'my-cluster'
  const props: ClusterDeleteModalProps = {
    cluster: mockCluster,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ClusterDeleteModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ClusterDeleteModal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })
})
