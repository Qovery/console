import { renderWithProviders } from '@qovery/shared/util-tests'
import TabsFeature from './tabs-feature'

describe('TabsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<TabsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
