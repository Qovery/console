import { renderWithProviders } from '@qovery/shared/util-tests'
import PageSettingsPreviewEnvironmentsFeature from './page-settings-preview-environments-feature'

describe('PageSettingsPreviewEnvironmentsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsPreviewEnvironmentsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
