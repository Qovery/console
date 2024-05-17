import { renderWithProviders } from '@qovery/shared/util-tests'
import PageNewFeature from './page-new-feature'

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageNewFeature />)
    expect(baseElement).toBeTruthy()
  })
})
