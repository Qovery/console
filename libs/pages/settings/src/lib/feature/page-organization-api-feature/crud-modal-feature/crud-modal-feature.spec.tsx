import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { type OrganizationEntity } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CrudModalFeature, type CrudModalFeatureProps } from './crud-modal-feature'

const mockOrganization: OrganizationEntity = organizationFactoryMock(1)[0]

const useCreateApiTokenMockSpy = jest.spyOn(organizationsDomain, 'useCreateApiToken') as jest.Mock

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    selectOrganizationById: () => mockOrganization,
  }
})

const props: CrudModalFeatureProps = {
  onClose: jest.fn(),
  organizationId: '1',
}

describe('CrudModalFeature', () => {
  beforeEach(() => {
    useCreateApiTokenMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<CrudModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render submit and call good api endpoint', async () => {
    const { userEvent } = renderWithProviders(<CrudModalFeature {...props} />)

    const inputName = screen.getByRole('textbox', { name: /token name/i })
    const inputDescription = screen.getByRole('textbox', { name: /description/i })

    await userEvent.type(inputName, 'test')
    await userEvent.type(inputDescription, 'description')

    const button = screen.getByTestId('submit-button')
    expect(button).not.toBeDisabled()

    await userEvent.click(button)

    expect(useCreateApiTokenMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: props.organizationId,
      apiTokenCreateRequest: {
        name: 'test',
        description: 'description',
        role_id: '0',
      },
    })
  })
})
