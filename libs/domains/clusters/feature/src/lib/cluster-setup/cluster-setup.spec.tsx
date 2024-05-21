import { renderWithProviders } from '@qovery/shared/util-tests'
import { ClusterSetup } from './cluster-setup'

describe('ClusterSetup', () => {
  it('should match manage deployment snapshot', async () => {
    const { baseElement } = renderWithProviders(<ClusterSetup type="SELF_MANAGED" />)
    expect(baseElement).toMatchSnapshot()
  })
})
