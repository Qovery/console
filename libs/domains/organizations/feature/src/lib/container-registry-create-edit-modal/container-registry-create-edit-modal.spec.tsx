import { ContainerRegistryKindEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAvailableContainerRegistries from '../hooks/use-available-container-registries/use-available-container-registries'
import * as useCreateContainerRegistry from '../hooks/use-create-container-registry/use-create-container-registry'
import * as useEditContainerRegistry from '../hooks/use-edit-container-registry/use-edit-container-registry'
import { ContainerRegistryCreateEditModal } from './container-registry-create-edit-modal'

const mockNavigate = jest.fn()
const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}))

const props = {
  organizationId: '0000-0000-0000',
  onClose: jest.fn(),
}

describe('ContainerRegistryCreateEditModal', () => {
  const useCreateContainerRegistryMockSpy = jest.spyOn(
    useCreateContainerRegistry,
    'useCreateContainerRegistry'
  ) as jest.Mock
  const useEditContainerRegistryMockSpy = jest.spyOn(useEditContainerRegistry, 'useEditContainerRegistry') as jest.Mock
  const useAvailableContainerRegistriesMockSpy = jest.spyOn(
    useAvailableContainerRegistries,
    'useAvailableContainerRegistries'
  ) as jest.Mock

  beforeEach(() => {
    useCreateContainerRegistryMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useEditContainerRegistryMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useAvailableContainerRegistriesMockSpy.mockReturnValue({
      data: [
        {
          kind: ContainerRegistryKindEnum.DOCKER_HUB,
          name: 'Docker Hub',
          url: 'https://docker.io',
          required_config: ['username', 'password'],
          is_mandatory: false,
        },
        {
          kind: ContainerRegistryKindEnum.ECR,
          name: 'Amazon ECR',
          url: 'https://ecr.amazonaws.com',
          required_config: ['region', 'access_key_id', 'secret_access_key'],
          is_mandatory: true,
        },
        {
          kind: ContainerRegistryKindEnum.SCALEWAY_CR,
          name: 'Scaleway Container Registry',
          url: 'https://rg.<region>.scw.cloud',
          required_config: ['region', 'scaleway_project_id', 'scaleway_access_key', 'scaleway_secret_key'],
          is_mandatory: true,
        },
        {
          kind: ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY,
          name: 'Google Container Registry',
          url: 'https://<region>-docker.pkg.dev',
          required_config: ['region', 'json_credentials'],
          is_mandatory: true,
        },
      ],
    })
  })

  it('should render the form with DOCKER_HUB', async () => {
    const registry = {
      id: '1111-1111-1111',
      created_at: '',
      updated_at: '',
      name: 'hello',
      description: 'description',
      url: 'https://docker.io',
      kind: ContainerRegistryKindEnum.DOCKER_HUB,
      config: {
        login_type: 'ACCOUNT',
        username: 'username',
        password: 'password',
      },
    }

    const { userEvent } = renderWithProviders(
      <ContainerRegistryCreateEditModal {...props} isEdit registry={registry} />
    )

    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://docker.io')
    screen.getByDisplayValue('1111-1111-1111')
    screen.getByLabelText('Login type')
  })

  it('should submit the form to edit a registry', async () => {
    const registry = {
      id: '1111-1111-1111',
      created_at: '',
      updated_at: '',
      name: 'my-registry-name',
      url: 'https://docker.io',
      kind: ContainerRegistryKindEnum.DOCR,
      config: {},
    }

    const { userEvent } = renderWithProviders(
      <ContainerRegistryCreateEditModal {...props} isEdit registry={registry} />
    )

    const btn = screen.getByTestId('submit-button')
    await userEvent.click(btn)

    expect(useEditContainerRegistryMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      containerRegistryId: '1111-1111-1111',
      containerRegistryRequest: {
        name: 'my-registry-name',
        url: 'https://docker.io',
        kind: ContainerRegistryKindEnum.DOCR,
        config: {},
      },
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ContainerRegistryCreateEditModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display the ID field when in edit mode', () => {
    renderWithProviders(
      <ContainerRegistryCreateEditModal
        {...props}
        isEdit
        registry={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',
          name: 'my-registry',
          description: '',
          url: 'https://docker.io',
          kind: ContainerRegistryKindEnum.DOCKER_HUB,
        }}
      />
    )

    const idInput = screen.getByLabelText('Qovery ID')
    expect(idInput).toBeInTheDocument()
    expect(idInput).toHaveValue('1111-1111-1111')
    expect(idInput).toBeDisabled()
  })

  it('should not display the ID field when in create mode', () => {
    renderWithProviders(<ContainerRegistryCreateEditModal {...props} />)
    expect(screen.queryByLabelText('Qovery ID')).not.toBeInTheDocument()
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
})
