import { renderWithProviders } from '@qovery/shared/util-tests'
import { ClusterSetup } from './cluster-setup'

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useOS: () => 'macos',
}))

describe('ClusterSetup', () => {
  it('should match manage deployment snapshot', async () => {
    const { baseElement } = renderWithProviders(<ClusterSetup type="SELF_MANAGED" />)
    expect(baseElement).toMatchSnapshot()
  })
})
