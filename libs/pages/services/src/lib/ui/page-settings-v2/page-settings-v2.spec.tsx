import { render } from '__tests__/utils/setup-jest'
import PageSettingsV2 from './page-settings-v2'

describe('PageSettingsV2', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsV2 />)
    expect(baseElement).toBeTruthy()
  })
})
