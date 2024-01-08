import { KubernetesEnum } from 'qovery-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { ClusterType } from './cluster-type'

describe('ClusterType', () => {
  it('should render as K3S', () => {
    const { baseElement } = renderWithProviders(<ClusterType cloudProvider="AWS" kubernetes={KubernetesEnum.K3_S} />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should render as EKS', () => {
    const { baseElement } = renderWithProviders(<ClusterType cloudProvider="AWS" kubernetes={KubernetesEnum.MANAGED} />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should render as SCW', () => {
    const { baseElement } = renderWithProviders(<ClusterType cloudProvider="SCW" />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should render as GCP', () => {
    const { baseElement } = renderWithProviders(<ClusterType cloudProvider="GCP" />)
    expect(baseElement).toMatchSnapshot()
  })
})
