import { renderWithProviders } from '@qovery/shared/util-tests'
import { ClusterStatusBadge } from './cluster-status-badge'

describe('ClusterStatusBadge', () => {
  it('should render as K3S', () => {
    const { baseElement } = renderWithProviders(<ClusterStatusBadge />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should render as EKS', () => {
    const { baseElement } = renderWithProviders(<ClusterStatusBadge />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should render as SCW', () => {
    const { baseElement } = renderWithProviders(<ClusterStatusBadge />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should render as GCP', () => {
    const { baseElement } = renderWithProviders(<ClusterStatusBadge />)
    expect(baseElement).toMatchSnapshot()
  })
})
