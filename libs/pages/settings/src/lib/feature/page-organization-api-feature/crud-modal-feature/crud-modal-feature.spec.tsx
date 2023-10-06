import * as storeOrganization from '@qovery/domains/organization'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { type OrganizationEntity } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CrudModalFeature, type CrudModalFeatureProps } from './crud-modal-feature'

import SpyInstance = jest.SpyInstance

const mockOrganization: OrganizationEntity = organizationFactoryMock(1)[0]

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

describe('CrudModalFeature', () => {
  const props: CrudModalFeatureProps = {
    onClose: jest.fn(),
    organizationId: '1',
  }

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<CrudModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render submit and call good api endpoint', async () => {
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          results: {
            data: {},
          },
        }),
    }))

    const postApiTokenSpy: SpyInstance = jest.spyOn(storeOrganization, 'postApiToken')
    const { userEvent } = renderWithProviders(<CrudModalFeature {...props} />)

    const inputName = screen.getByRole('textbox', { name: /token name/i })
    const inputDescription = screen.getByRole('textbox', { name: /description/i })

    await userEvent.type(inputName, 'test')
    await userEvent.type(inputDescription, 'description')

    const button = screen.getByTestId('submit-button')
    expect(button).not.toBeDisabled()

    await userEvent.click(button)

    expect(postApiTokenSpy).toHaveBeenCalledWith({
      organizationId: props.organizationId,
      token: {
        name: 'test',
        description: 'description',
        role_id: '0',
      },
    })
  })
})
