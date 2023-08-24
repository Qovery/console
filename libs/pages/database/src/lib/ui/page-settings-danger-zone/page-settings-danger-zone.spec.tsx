import { render } from '__tests__/utils/setup-jest'
import PageSettingsDangerZone, { type PageSettingsDangerZoneProps } from './page-settings-danger-zone'

const props: PageSettingsDangerZoneProps = {
  deleteDatabase: jest.fn(),
}

describe('PageSettingsDangerZone', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDangerZone {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
