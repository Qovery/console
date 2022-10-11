import { act, fireEvent } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { ContainerRegistryKindEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as storeOrganization from '@qovery/domains/organization'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import CreateModalFeature, { CreateModalFeatureProps } from './create-modal-feature'

import SpyInstance = jest.SpyInstance

const mockOrganization: OrganizationEntity = storeOrganization.organizationFactoryMock(1)[0]

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    postCustomRoles: jest.fn(),
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
  useParams: () => ({ organizationId: mockOrganization.id }),
}))

describe('CreateModalFeature', () => {
  const props: CreateModalFeatureProps = {
    onClose: jest.fn(),
  }

  it('should render successfully', async () => {
    const { baseElement } = render(<CreateModalFeature {...props} />)
    await act(() => {
      expect(baseElement).toBeTruthy()
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

    const { getByTestId, getByLabelText } = render(<CreateModalFeature {...props} />)

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
