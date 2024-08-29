import { ContainerRegistryKindEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAvailableContainerRegistries from '../hooks/use-available-container-registries/use-available-container-registries'
import * as useCreateContainerRegistry from '../hooks/use-create-container-registry/use-create-container-registry'
import * as useEditContainerRegistry from '../hooks/use-edit-container-registry/use-edit-container-registry'
import ContainerRegistryCreateEditModal, {
  type ContainerRegistryCreateEditModalProps,
} from './container-registry-create-edit-modal'

const useCreateContainerRegistryMockSpy = jest.spyOn(
  useCreateContainerRegistry,
  'useCreateContainerRegistry'
) as jest.Mock
const useEditContainerRegistryMockSpy = jest.spyOn(useEditContainerRegistry, 'useEditContainerRegistry') as jest.Mock
const useAvailableContainerRegistriesMockSpy = jest.spyOn(
  useAvailableContainerRegistries,
  'useAvailableContainerRegistries'
) as jest.Mock

const props: ContainerRegistryCreateEditModalProps = {
  organizationId: '0000-0000-0000',
  onClose: jest.fn(),
}

describe('ContainerRegistryCreateEditModal', () => {
  beforeEach(() => {
    useCreateContainerRegistryMockSpy.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ id: '000' }),
    })
    useEditContainerRegistryMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useAvailableContainerRegistriesMockSpy.mockReturnValue({
      data: [
        {
          kind: 'ECR',
          required_config: ['region', 'access_key_id', 'secret_access_key'],
          is_mandatory: true,
        },
        {
          kind: 'DOCR',
          required_config: ['token'],
          is_mandatory: true,
        },
        {
          kind: 'SCALEWAY_CR',
          required_config: ['region', 'scaleway_access_key', 'scaleway_secret_key'],
          is_mandatory: true,
        },
        {
          kind: 'DOCKER_HUB',
          required_config: ['username', 'password'],
          is_mandatory: false,
        },
        {
          kind: 'PUBLIC_ECR',
          required_config: [],
          is_mandatory: false,
        },
        {
          kind: 'GENERIC_CR',
          required_config: ['username', 'password'],
          is_mandatory: false,
        },
        {
          kind: 'GITHUB_CR',
          required_config: ['username', 'password'],
          is_mandatory: false,
        },
        {
          kind: 'GITLAB_CR',
          required_config: ['username', 'password'],
          is_mandatory: false,
        },
        {
          kind: 'GCP_ARTIFACT_REGISTRY',
          required_config: ['region', 'json_credentials'],
          is_mandatory: true,
        },
      ],
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ContainerRegistryCreateEditModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with DOCKER_HUB', async () => {
    renderWithProviders(
      <ContainerRegistryCreateEditModal
        registry={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',
          name: 'hello',
          description: 'description',
          url: 'https://docker.io',
          kind: ContainerRegistryKindEnum.DOCKER_HUB,
        }}
        {...props}
      />
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://docker.io')

    screen.getByLabelText('Login type')
  })

  it('should render the form with ECR', async () => {
    renderWithProviders(
      <ContainerRegistryCreateEditModal
        registry={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.ECR,
        }}
        {...props}
      />
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')

    screen.getByLabelText('Region')
    screen.getByLabelText('Access key')
    screen.getByLabelText('Secret key')
  })

  it('should render the form with PUBLIC_ECR', async () => {
    renderWithProviders(
      <ContainerRegistryCreateEditModal
        registry={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.PUBLIC_ECR,
        }}
        {...props}
      />
    )

    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
  })

  it('should render the form with SCALEWAY_CR', async () => {
    renderWithProviders(
      <ContainerRegistryCreateEditModal
        registry={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.SCALEWAY_CR,
        }}
        {...props}
      />
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')

    screen.getByLabelText('Region')
    screen.getByLabelText('Access key')
    screen.getByLabelText('Secret key')
  })
  it('should render the form with GITHUB_CR', async () => {
    renderWithProviders(
      <ContainerRegistryCreateEditModal
        registry={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',
          name: 'hello',
          description: 'description',
          url: 'https://ghcr.io',
          kind: ContainerRegistryKindEnum.GITHUB_CR,
        }}
        {...props}
      />
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://ghcr.io')

    screen.getByLabelText('Login type')
  })

  it('should render the form with GITLAB_CR', async () => {
    renderWithProviders(
      <ContainerRegistryCreateEditModal
        registry={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',
          name: 'hello',
          description: 'description',
          url: 'https://registry.gitlab.com',
          kind: ContainerRegistryKindEnum.GITLAB_CR,
        }}
        {...props}
      />
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://registry.gitlab.com')

    screen.getByLabelText('Login type')
  })

  it('should render the form with GENERIC_CR', async () => {
    renderWithProviders(
      <ContainerRegistryCreateEditModal
        registry={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',

          name: 'hello',
          description: 'description',
          kind: ContainerRegistryKindEnum.GENERIC_CR,
        }}
        {...props}
      />
    )

    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')

    screen.getByLabelText('Login type')
  })

  it('should submit the form to create a registry', async () => {
    const { userEvent } = renderWithProviders(<ContainerRegistryCreateEditModal {...props} />)

    const inputType = screen.getByLabelText('Type')
    await selectEvent.select(inputType, 'DOCKER_HUB', {
      container: document.body,
    })

    const inputName = screen.getByLabelText('Registry name')
    await userEvent.type(inputName, 'registry-name')

    const btn = screen.getByRole('button', { name: 'Create' })
    expect(btn).toBeEnabled()

    await userEvent.click(btn)

    expect(useCreateContainerRegistryMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      containerRegistryRequest: {
        config: {
          access_key_id: undefined,
          password: undefined,
          region: undefined,
          scaleway_access_key: undefined,
          scaleway_secret_key: undefined,
          secret_access_key: undefined,
          username: undefined,
        },
        description: undefined,
        kind: 'DOCKER_HUB',
        name: 'registry-name',
        url: 'https://docker.io',
      },
    })

    expect(props.onClose).toHaveBeenCalledWith({ id: '000' })
  })

  it('should submit the form to edit a registry', async () => {
    const { userEvent } = renderWithProviders(
      <ContainerRegistryCreateEditModal
        {...props}
        isEdit
        registry={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',
          name: 'my-registry',
          kind: ContainerRegistryKindEnum.DOCR,
          url: 'https://docker.io',
        }}
      />
    )

    const inputName = screen.getByLabelText('Registry name')
    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'my-registry-name')

    const btn = screen.getByRole('button', { name: 'Confirm' })
    expect(btn).toBeEnabled()

    await userEvent.click(btn)

    expect(useEditContainerRegistryMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      containerRegistryId: '1111-1111-1111',
      containerRegistryRequest: {
        config: {
          access_key_id: undefined,
          password: undefined,
          region: undefined,
          scaleway_access_key: undefined,
          scaleway_secret_key: undefined,
          secret_access_key: undefined,
          username: undefined,
        },
        description: undefined,
        kind: 'DOCR',
        name: 'my-registry-name',
        url: 'https://docker.io',
      },
    })

    expect(props.onClose).toHaveBeenCalled()
  })
})
