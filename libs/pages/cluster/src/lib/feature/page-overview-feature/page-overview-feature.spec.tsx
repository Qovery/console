import { renderWithProviders } from '@qovery/shared/util-tests'
import PageSettingsCredentialsFeature from './page-overview-feature'

describe('PageSettingsCredentialsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsCredentialsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
