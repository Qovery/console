import { ContainerRegistryKindEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { containerRegistriesByOrganizationIdMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CrudModalFeature, { type CrudModalFeatureProps } from './crud-modal-feature'

const mockContainerRegistries = containerRegistriesByOrganizationIdMock

const useEditContainerRegistryMockSpy = jest.spyOn(organizationsDomain, 'useEditContainerRegistry') as jest.Mock
const useCreateContainerRegistryMockSpy = jest.spyOn(organizationsDomain, 'useCreateContainerRegistry') as jest.Mock
const useAvailableContainerRegistryMockSpy = jest.spyOn(
  organizationsDomain,
  'useAvailableContainerRegistry'
) as jest.Mock

const props: CrudModalFeatureProps = {
  onClose: jest.fn(),
  registry: mockContainerRegistries[0],
  organizationId: '0',
}

describe('CrudModalFeature', () => {
  beforeEach(() => {
    useEditContainerRegistryMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useCreateContainerRegistryMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useAvailableContainerRegistryMockSpy.mockReturnValue({
      data: [
        {
          kind: 'DOCKER_HUB',
        },
      ],
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CrudModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should edit container registry if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<CrudModalFeature {...props} />)

    const inputUsername = screen.getByTestId('input-username')
    await userEvent.type(inputUsername, 'hello')

    const inputPassword = screen.getByTestId('input-password')
    await userEvent.type(inputPassword, 'password')

    expect(screen.getByTestId('submit-button')).not.toBeDisabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    const mockContainerRegistriesConfig = mockContainerRegistries[0]

    expect(useEditContainerRegistryMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      containerRegistryId: '0',
      containerRegistryRequest: {
        name: mockContainerRegistriesConfig.name,
        description: mockContainerRegistriesConfig.description,
        kind: mockContainerRegistriesConfig.kind,
        url: mockContainerRegistriesConfig.url,
        config: {
          username: 'hello',
          password: 'password',
        },
      },
    })
  })

  it('should create container registry if form is submitted', async () => {
    props.registry = undefined

    const { userEvent } = renderWithProviders(<CrudModalFeature {...props} />)

    const inputName = screen.getByTestId('input-name')
    await userEvent.type(inputName, 'my-registry')

    const selectType = screen.getByLabelText('Type')
    await selectEvent.select(selectType, ContainerRegistryKindEnum.DOCKER_HUB, { container: document.body })

    const inputUsername = screen.getByTestId('input-username')
    await userEvent.type(inputUsername, 'hello')

    const inputPassword = screen.getByTestId('input-password')
    await userEvent.type(inputPassword, 'password')

    expect(screen.getByTestId('submit-button')).not.toBeDisabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    const mockContainerRegistriesConfig = mockContainerRegistries[0]

    expect(useCreateContainerRegistryMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      containerRegistryRequest: {
        name: 'my-registry',
        kind: mockContainerRegistriesConfig.kind,
        description: undefined,
        url: 'https://docker.io',
        config: {
          username: 'hello',
          password: 'password',
        },
      },
    })
  })
})
