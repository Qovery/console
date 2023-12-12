import { renderWithProviders } from '@qovery/shared/util-tests'
import PageSettingsDangerZone, { type PageSettingsDangerZoneProps } from './page-settings-danger-zone'

const props: PageSettingsDangerZoneProps = {
  deleteService: jest.fn(),
}

describe('PageSettingsDangerZone', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsDangerZone {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
