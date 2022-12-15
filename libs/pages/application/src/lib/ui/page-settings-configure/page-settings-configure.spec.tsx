import { render } from '__tests__/utils/setup-jest'
import PageSettingsConfigure, { PageSettingsConfigureProps } from './page-settings-configure'

const props: PageSettingsConfigureProps = {
  deleteApplication: jest.fn(),
}

describe('PageSettingsDangerZone', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsConfigure {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
