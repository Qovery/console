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
  disabledFieldsExceptConfig: false,
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

  it('should render the form with DOCKER_HUB', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
          url: 'https://docker.io',
          kind: ContainerRegistryKindEnum.DOCKER_HUB,
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://docker.io')

    screen.getByLabelText('Login type')
  })

  it('should render the form with ECR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} />, {
        defaultValues: {
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.ECR,
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')

    screen.getByLabelText('Region')
    screen.getByLabelText('Access key')
    screen.getByLabelText('Secret key')
  })

  it('should render the form with PUBLIC_ECR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} />, {
        defaultValues: {
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.PUBLIC_ECR,
        },
      })
    )

    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
  })

  it('should render the form with SCALEWAY_CR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} />, {
        defaultValues: {
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.SCALEWAY_CR,
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')

    screen.getByLabelText('Region')
    screen.getByLabelText('Access key')
    screen.getByLabelText('Secret key')
  })
  it('should render the form with GITHUB_CR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
          url: 'https://ghcr.io',
          kind: ContainerRegistryKindEnum.GITHUB_CR,
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://ghcr.io')

    screen.getByLabelText('Login type')
  })

  it('should render the form with GITLAB_CR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
          url: 'https://registry.gitlab.com',
          kind: ContainerRegistryKindEnum.GITLAB_CR,
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://registry.gitlab.com')

    screen.getByLabelText('Login type')
  })

  it('should render the form with GENERIC_CR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
          kind: ContainerRegistryKindEnum.GENERIC_CR,
        },
      })
    )

    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')

    screen.getByLabelText('Login type')
  })

  it('should have an array of container registry', async () => {
    const options = getOptionsContainerRegistry([
      {
        kind: ContainerRegistryKindEnum.DOCKER_HUB,
      },
      {
        kind: ContainerRegistryKindEnum.ECR,
      },
    ])

    expect(options[0].value).toBe(ContainerRegistryKindEnum.DOCKER_HUB)
  })
})
