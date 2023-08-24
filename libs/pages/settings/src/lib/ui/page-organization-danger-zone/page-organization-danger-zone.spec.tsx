import { render } from '__tests__/utils/setup-jest'
import PageOrganizationDangerZone, { type PageOrganizationDangerZoneProps } from './page-organization-danger-zone'

const props: PageOrganizationDangerZoneProps = {
  deleteOrganization: jest.fn(),
  loading: false,
}

describe('PageOrganizationDangerZone', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationDangerZone {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
