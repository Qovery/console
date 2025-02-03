import { renderWithProviders } from '@qovery/shared/util-tests'
import ClusterAccessModal, { type ClusterAccessModalProps } from './cluster-access-modal'

describe('ClusterAccessModal', () => {
  const props: ClusterAccessModalProps = {
    clusterId: '000',
    type: 'MANAGED',
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ClusterAccessModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ClusterAccessModal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot with SELF_MANAGED type', () => {
    const { baseElement } = renderWithProviders(<ClusterAccessModal {...props} type="SELF_MANAGED" />)
    expect(baseElement).toMatchSnapshot()
  })
})
