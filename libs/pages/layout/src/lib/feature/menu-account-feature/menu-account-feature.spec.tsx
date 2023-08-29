import { render } from '__tests__/utils/setup-jest'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { type OrganizationEntity } from '@qovery/shared/interfaces'
import MenuAccountFeature from './menu-account-feature'

const mockOrganizations = organizationFactoryMock(2)
const mockOrganization: OrganizationEntity = mockOrganizations[0]

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  selectOrganizationById: () => mockOrganization,
  selectAllOrganization: () => mockOrganizations,
}))

describe('MenuAccountFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MenuAccountFeature />)
    expect(baseElement).toBeTruthy()
  })
})
