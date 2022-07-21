import { render } from '__tests__/utils/setup-jest'
import PageSettingsPreviewEnvironmentsFeature from './page-settings-preview-environments-feature'

describe('PageSettingsPreviewEnvironmentsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsPreviewEnvironmentsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
