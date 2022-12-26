import { render } from '__tests__/utils/setup-jest'
import { organizationFactoryMock } from '@qovery/domains/organization'
import { userSignUpFactoryMock } from '@qovery/domains/user'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import MenuAccountFeature from './menu-account-feature'

const organizations = organizationFactoryMock(2)
const user = userSignUpFactoryMock()
const mockOrganization: OrganizationEntity = organizations[0]

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ organizationId: '1' }),
}))

jest.mock('react-redux', () => ({
  ...(jest.requireActual('react-redux') as any),
  selectOrganizationById: () => mockOrganization,
  selectAllOrganization: () => organizations,
  selectUserSignUp: () => user,
}))

describe('MenuAccountFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MenuAccountFeature />)
    expect(baseElement).toBeTruthy()
  })
})
