import { renderWithProviders } from '@qovery/shared/util-tests'
import PageHelmCreateFeature from './page-helm-create-feature'

describe('PageHelmCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageHelmCreateFeature />)
    expect(baseElement).toBeTruthy()
  })
})
