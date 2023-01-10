import { act, fireEvent } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { ContainerRegistryKindEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as storeOrganization from '@qovery/domains/organization'
import { containerRegistriesByOrganizationIdMock, organizationFactoryMock } from '@qovery/shared/factories'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import CrudModalFeature, { CrudModalFeatureProps } from './crud-modal-feature'

import SpyInstance = jest.SpyInstance

const mockOrganization: OrganizationEntity = organizationFactoryMock(1)[0]
// todo check this error
const mockContainerRegistries = containerRegistriesByOrganizationIdMock

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editOrganizationContainerRegistry: jest.fn(),
    postOrganizationContainerRegistry: jest.fn(),
    fetchAvailableContainerRegistry: jest.fn(),
    getOrganizationsState: () => ({
      loadingStatus: 'loaded',
      ids: [mockOrganization.id],
      entities: {
        [mockOrganization.id]: mockOrganization,
      },
      error: null,
    }),
    selectOrganizationById: () => mockOrganization,
    selectAvailableContainerRegistry: () => [
      {
        kind: 'DOCKER_HUB',
      },
    ],
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ organizationId: mockOrganization.id }),
}))

describe('CrudModalFeature', () => {
  const props: CrudModalFeatureProps = {
    onClose: jest.fn(),
    registry: mockContainerRegistries[0],
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

    const mockContainerRegistriesConfig = mockContainerRegistries[0]

    expect(editOrganizationContainerRegistrySpy).toHaveBeenCalledWith({
      data: {
        name: mockContainerRegistriesConfig.name,
        description: mockContainerRegistriesConfig.description,
        kind: mockContainerRegistriesConfig.kind,
        url: mockContainerRegistriesConfig.url,
        config: {
          username: 'hello',
          password: 'password',
        },
      },
      containerRegistryId: mockContainerRegistriesConfig.id,
      organizationId: '',
    })
  })

  it('should dispatch postOrganizationContainerRegistry if form is submitted', async () => {
    const postOrganizationContainerRegistry: SpyInstance = jest.spyOn(
      storeOrganization,
      'postOrganizationContainerRegistry'
    )

    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    props.registry = undefined

    const { getByTestId, getByLabelText } = render(<CrudModalFeature {...props} />)

    await act(() => {
      const inputName = getByTestId('input-name')
      fireEvent.input(inputName, { target: { value: 'my-registry' } })

      selectEvent.select(getByLabelText('Type'), ContainerRegistryKindEnum.DOCKER_HUB, { container: document.body })
    })

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

    const mockContainerRegistriesConfig = mockContainerRegistries[0]

    expect(postOrganizationContainerRegistry).toHaveBeenCalledWith({
      data: {
        name: 'my-registry',
        kind: mockContainerRegistriesConfig.kind,
        description: undefined,
        url: undefined,
        config: {
          username: 'hello',
          password: 'password',
        },
      },
      organizationId: '',
    })
  })
})
