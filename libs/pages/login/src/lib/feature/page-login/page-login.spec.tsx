import { type Organization } from 'qovery-typescript-axios'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageLoginFeature from './page-login'

import SpyInstance = jest.SpyInstance

const useOrganizationsSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useOrganizations')

const mockOrganizations: Organization[] = organizationFactoryMock(1)

jest.mock('@elgorditosalsero/react-gtm-hook', () => ({
  ...jest.requireActual('@elgorditosalsero/react-gtm-hook'),
  useGTMDispatch: jest.fn(),
}))

describe('PageLoginFeature', () => {
  beforeEach(() => {
    useOrganizationsSpy.mockReturnValue({
      data: mockOrganizations,
    })
  })
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageLoginFeature />)
    expect(baseElement).toBeTruthy()
  })
})
