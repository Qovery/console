import { renderWithProviders } from '@qovery/shared/util-tests'
import ClusterDeleteModal, { type ClusterDeleteModalProps } from './cluster-delete-modal'

describe('ClusterDeleteModal', () => {
  const props: ClusterDeleteModalProps = {
    organizationId: '0',
    clusterId: '1',
    name: 'my-cluster',
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
