import { render } from '__tests__/utils/setup-jest'
import PageSettingsGeneralFeature from './page-settings-general-feature'

describe('PageSettingsGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})
