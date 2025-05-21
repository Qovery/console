import { renderWithProviders } from '@qovery/shared/util-tests'
import PageOverviewFeature from './page-overview-feature'

describe('PageOverviewFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOverviewFeature />)
    expect(baseElement).toBeTruthy()
  })
})
