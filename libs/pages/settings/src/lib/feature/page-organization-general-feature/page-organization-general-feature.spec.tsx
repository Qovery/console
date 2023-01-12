import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { Organization } from 'qovery-typescript-axios'
import * as storeOrganization from '@qovery/domains/organization'
import { organizationFactoryMock } from '@qovery/shared/factories'
import PageOrganizationGeneralFeature, { handleSubmit } from './page-organization-general-feature'

import SpyInstance = jest.SpyInstance

const mockOrganization: Organization = organizationFactoryMock(1)[0]

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editOrganization: jest.fn(),
    selectOrganizationById: () => {
      const currentMockOrganization = mockOrganization
      mockOrganization.description = 'description'
      mockOrganization.website_url = 'https://qovery.com'
      mockOrganization.logo_url = 'my-logo'
      return currentMockOrganization
    },
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ organizationId: '0' }),
}))

describe('PageOrganizationGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch editOrganization if form is submitted', async () => {
    const editOrganizationSpy: SpyInstance = jest.spyOn(storeOrganization, 'editOrganization')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<PageOrganizationGeneralFeature />)

    await act(() => {
      const input = getByTestId('input-name')
      fireEvent.input(input, { target: { value: 'hello-world' } })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    const newOrganization = {
      name: 'hello-world',
      website_url: 'https://qovery.com',
      logo_url: 'my-logo',
      description: 'description',
      admin_emails: ['test@test.com'],
    }

    const cloneOrganization = handleSubmit(newOrganization, mockOrganization)

    expect(editOrganizationSpy.mock.calls[0][0].organizationId).toBe(mockOrganization.id)
    expect(cloneOrganization.name).toBe('hello-world')
    expect(cloneOrganization.description).toBe('description')
    expect(cloneOrganization.website_url).toBe('https://qovery.com')
    expect(cloneOrganization.logo_url).toBe('my-logo')
    expect(editOrganizationSpy.mock.calls[0][0].data).toStrictEqual(cloneOrganization)
  })
})
