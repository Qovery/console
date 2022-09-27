import { act, fireEvent } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import * as storeOrganization from '@qovery/domains/organization'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import CrudModalFeature, { CrudModalFeatureProps } from './crud-modal-feature'

import SpyInstance = jest.SpyInstance

const mockOrganization: OrganizationEntity = storeOrganization.organizationFactoryMock(1)[0]

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editOrganizationContainerRegistry: jest.fn(),
    getOrganizationsState: () => ({
      loadingStatus: 'loaded',
      ids: [mockOrganization.id],
      entities: {
        [mockOrganization.id]: mockOrganization,
      },
      error: null,
    }),
    selectOrganizationById: () => mockOrganization,
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
  useParams: () => ({ organizationId: '0' }),
}))

describe('CrudModalFeature', () => {
  const props: CrudModalFeatureProps = {
    onClose: jest.fn(),
    registry: storeOrganization.containerRegistriesMock(1)[0],
  }

  it('should render successfully', async () => {
    const { baseElement } = render(<CrudModalFeature {...props} />)
    await act(() => {
      expect(baseElement).toBeTruthy()
    })
  })

  it('should dispatch editOrganizationContainerRegistry if form is submitted', async () => {
    const editOrganizationContainerRegistrySpy: SpyInstance = jest.spyOn(
      storeOrganization,
      'editOrganizationContainerRegistry'
    )

    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<CrudModalFeature {...props} />)

    await act(() => {
      const inputUsername = getByTestId('input-username')
      fireEvent.input(inputUsername, { target: { value: 'hello' } })
      const inputPassword = getByTestId('input-password')
      fireEvent.input(inputPassword, { target: { value: 'password' } })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    // const cloneApplication = handleSubmit(
    //   { memory: 9, cpu: [1], instances: [1, 3] },
    //   mockApplication,
    //   MemorySizeEnum.MB
    // )

    // expect(editOrganizationContainerRegistrySpy.mock.calls[0][0].containerRegistryId).toBe(
    //   mockOrganization.containerRegistries?.items[0].id
    // )
    expect(editOrganizationContainerRegistrySpy.mock.calls[0][0].data).toStrictEqual(
      mockOrganization.containerRegistries?.items[0]
    )
  })
})
