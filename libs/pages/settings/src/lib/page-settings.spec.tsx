import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router-dom'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { organizationFactoryMock } from '@qovery/shared/factories'
import PageSettings from './page-settings'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: 'Link',
  useParams: () => ({ organizationId: '1' }),
}))

const useOrganizationSpy = jest.spyOn(organizationsDomain, 'useOrganization')
const [mockOrganization] = organizationFactoryMock(1)

describe('PagesSettings', () => {
  beforeEach(() => {
    useOrganizationSpy.mockReturnValue({
      data: mockOrganization,
    })
  })
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location="/organization/1/settings/general">
        <Route path="/organization/1/settings/*" element={<PageSettings />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})
