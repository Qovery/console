import { renderWithProviders } from '@qovery/shared/util-tests'
import PageClustersGeneralFeature from './page-clusters-general-feature'

describe('PageClustersGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageClustersGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})
