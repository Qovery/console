import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ContainerRegistryKindEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAvailableContainerRegistries from '../hooks/use-available-container-registries/use-available-container-registries'
import ContainerRegistryForm, {
  type ContainerRegistryFormProps,
  getOptionsContainerRegistry,
} from './container-registry-form'

const useAvailableContainerRegistriesMockSpy = jest.spyOn(
  useAvailableContainerRegistries,
  'useAvailableContainerRegistries'
) as jest.Mock

const props: ContainerRegistryFormProps = {
  isEdit: false,
}

describe('ContainerRegistryForm', () => {
  beforeEach(() => {
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
          required_config: ['region', 'scaleway_access_key', 'scaleway_project_id', 'scaleway_secret_key'],
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
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<ContainerRegistryForm {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should display the ID field when in edit mode', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} isEdit />, {
        defaultValues: {
          id: '1111-1111-1111',
          name: 'my-registry',
          description: '',
          url: 'https://docker.io',
          kind: ContainerRegistryKindEnum.DOCKER_HUB,
        },
      })
    )

    const idInput = screen.getByLabelText('Qovery ID')
    expect(idInput).toBeInTheDocument()
    expect(idInput).toHaveValue('1111-1111-1111')
    expect(idInput).toBeDisabled()
  })

  it('should not display the ID field when in create mode', () => {
    renderWithProviders(wrapWithReactHookForm(<ContainerRegistryForm {...props} />))
    expect(screen.queryByLabelText('Qovery ID')).not.toBeInTheDocument()
  })

  it('should render the form with DOCKER_HUB', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} isEdit />, {
        defaultValues: {
          id: '1111-1111-1111',
          name: 'hello',
          description: 'description',
          url: 'https://docker.io',
          kind: ContainerRegistryKindEnum.DOCKER_HUB,
          config: {
            login_type: 'ANONYMOUS',
          },
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://docker.io')
    screen.getByDisplayValue('1111-1111-1111')
    screen.getByLabelText('Login type')
  })

  it('should render the form with ECR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} isEdit />, {
        defaultValues: {
          id: '1111-1111-1111',
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.ECR,
          config: {},
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
    screen.getByDisplayValue('1111-1111-1111')

    screen.getByLabelText('Region')
    screen.getByLabelText('Access key')
    screen.getByLabelText('Secret key')
  })

  it('should render the form with PUBLIC_ECR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} isEdit />, {
        defaultValues: {
          id: '1111-1111-1111',
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.PUBLIC_ECR,
          config: {},
        },
      })
    )

    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
    screen.getByDisplayValue('1111-1111-1111')
  })

  it('should render the form with SCALEWAY_CR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} isEdit />, {
        defaultValues: {
          id: '1111-1111-1111',
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.SCALEWAY_CR,
          config: {},
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
    screen.getByDisplayValue('1111-1111-1111')

    screen.getByLabelText('Region')
    screen.getByLabelText('Access key')
    screen.getByLabelText('Secret key')
  })

  it('should render the form with GITHUB_CR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} isEdit />, {
        defaultValues: {
          id: '1111-1111-1111',
          name: 'hello',
          description: 'description',
          url: 'https://ghcr.io',
          kind: ContainerRegistryKindEnum.GITHUB_CR,
          config: {
            login_type: 'ANONYMOUS',
          },
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://ghcr.io')
    screen.getByDisplayValue('1111-1111-1111')
    screen.getByLabelText('Login type')
  })

  it('should render the form with GITLAB_CR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} isEdit />, {
        defaultValues: {
          id: '1111-1111-1111',
          name: 'hello',
          description: 'description',
          url: 'https://registry.gitlab.com',
          kind: ContainerRegistryKindEnum.GITLAB_CR,
          config: {
            login_type: 'ANONYMOUS',
          },
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://registry.gitlab.com')
    screen.getByDisplayValue('1111-1111-1111')
    screen.getByLabelText('Login type')
  })

  it('should render the form with GENERIC_CR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} isEdit />, {
        defaultValues: {
          id: '1111-1111-1111',
          name: 'hello',
          description: 'description',
          kind: ContainerRegistryKindEnum.GENERIC_CR,
          config: {
            login_type: 'ANONYMOUS',
          },
        },
      })
    )

    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('1111-1111-1111')
    screen.getByLabelText('Login type')
  })

  it('should render the form with DOCKER_HUB and login type ACCOUNT', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} isEdit />, {
        defaultValues: {
          id: '1111-1111-1111',
          name: 'hello',
          description: 'description',
          url: 'https://docker.io',
          kind: ContainerRegistryKindEnum.DOCKER_HUB,
          config: {
            login_type: 'ACCOUNT',
            username: 'username',
            password: 'password',
          },
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://docker.io')
    screen.getByDisplayValue('1111-1111-1111')
    screen.getByDisplayValue('username')
    screen.getByDisplayValue('password')
  })

  it('should render the form with ECR and credentials', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} isEdit />, {
        defaultValues: {
          id: '1111-1111-1111',
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.ECR,
          config: {
            region: 'region',
            access_key_id: 'access_key_id',
            secret_access_key: 'secret_access_key',
          },
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
    screen.getByDisplayValue('1111-1111-1111')
    screen.getByDisplayValue('region')
    screen.getByDisplayValue('access_key_id')
    screen.getByDisplayValue('secret_access_key')
  })

  it('should render the form with SCALEWAY_CR and credentials', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} isEdit />, {
        defaultValues: {
          id: '1111-1111-1111',
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.SCALEWAY_CR,
          config: {
            region: 'region',
            scaleway_project_id: 'scaleway_project_id',
            scaleway_access_key: 'scaleway_access_key',
            scaleway_secret_key: 'scaleway_secret_key',
          },
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
    screen.getByDisplayValue('1111-1111-1111')
    screen.getByDisplayValue('region')
    screen.getByDisplayValue('scaleway_project_id')
    screen.getByDisplayValue('scaleway_access_key')
    screen.getByDisplayValue('scaleway_secret_key')
  })

  it('should render the form with GCP_ARTIFACT_REGISTRY and credentials', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} isEdit />, {
        defaultValues: {
          id: '1111-1111-1111',
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY,
          config: {
            region: 'region',
            json_credentials: 'json_credentials',
          },
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
    screen.getByDisplayValue('1111-1111-1111')
    screen.getByDisplayValue('region')
    screen.getByDisplayValue('json_credentials')
  })

  it('should have an array of container registry', async () => {
    const options = getOptionsContainerRegistry([
      {
        kind: ContainerRegistryKindEnum.DOCKER_HUB,
        required_config: ['username', 'password'],
        is_mandatory: false,
      },
      {
        kind: ContainerRegistryKindEnum.ECR,
        required_config: ['region', 'access_key_id', 'secret_access_key'],
        is_mandatory: true,
      },
    ])

    expect(options[0].value).toBe(ContainerRegistryKindEnum.DOCKER_HUB)
  })
})
