import { type Organization } from 'qovery-typescript-axios'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOrganizationGeneralFeature, { handleSubmit } from './page-organization-general-feature'

import SpyInstance = jest.SpyInstance

const useOrganizationSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useOrganization')
const useEditOrganizationSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useEditOrganization')

const mockOrganization: Organization = organizationFactoryMock(1)[0]

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '0' }),
}))

describe('PageOrganizationGeneral', () => {
  beforeEach(() => {
    useEditOrganizationSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useOrganizationSpy.mockReturnValue({
      data: mockOrganization,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch editOrganization if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationGeneralFeature />)

    const input = screen.getByTestId('input-name')
    await userEvent.clear(input)
    await userEvent.type(input, 'hello-world')

    expect(screen.getByTestId('submit-button')).toBeEnabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    const organization = {
      name: 'hello-world',
      website_url: mockOrganization.website_url,
      logo_url: mockOrganization.logo_url,
      description: mockOrganization.description,
      admin_emails: ['test@test.com'],
    }

    const cloneOrganization = handleSubmit(organization, mockOrganization)

    expect(useEditOrganizationSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      organizationRequest: cloneOrganization,
    })
  })
})
