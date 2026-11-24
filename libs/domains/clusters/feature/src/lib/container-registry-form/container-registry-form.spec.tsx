import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { CloudProviderEnum, ContainerRegistryKindEnum, KubernetesEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAvailableContainerRegistries from '../hooks/use-available-container-registries/use-available-container-registries'
import {
  ContainerRegistryForm,
  type ContainerRegistryFormProps,
  getOptionsContainerRegistry,
} from './container-registry-form'

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(() => false),
}))

const useAvailableContainerRegistriesMockSpy = jest.spyOn(
  useAvailableContainerRegistries,
  'useAvailableContainerRegistries'
) as jest.Mock
const useFeatureFlagEnabledMock = useFeatureFlagEnabled as jest.MockedFunction<typeof useFeatureFlagEnabled>

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

    useFeatureFlagEnabledMock.mockReturnValue(true)
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

  it('should render the form with ECR STS', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} />, {
        defaultValues: {
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.ECR,
          type: 'STS',
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')

    screen.getByLabelText('Region')
    screen.getByLabelText('Authentication type')
    screen.getByLabelText('Role ARN')
  })

  it('should render the form with ECR STATIC', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} />, {
        defaultValues: {
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.ECR,
          type: 'STATIC',
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')

    screen.getByLabelText('Region')
    screen.getByLabelText('Authentication type')
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

  it('should render the form with GCP_ARTIFACT_REGISTRY WIF', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} />, {
        defaultValues: {
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY,
          type: 'WIF',
        },
      })
    )

    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
    screen.getByLabelText('Region')
    screen.getByLabelText('Authentication type')
    screen.getByLabelText('Service account email')
    screen.getByLabelText('Workload identity provider resource')
  })

  it('should render the form with GCP_ARTIFACT_REGISTRY STATIC', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} />, {
        defaultValues: {
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY,
          type: 'STATIC',
        },
      })
    )

    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
    screen.getByLabelText('Region')
    screen.getByLabelText('Authentication type')
    expect(screen.getByTestId('input-credentials-json')).toBeInTheDocument()
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

  it('should render the form with AZURE_CR', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ContainerRegistryForm {...props} />, {
        defaultValues: {
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.AZURE_CR,
          username: 'azure',
          password: 'password',
        },
      })
    )
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://qovery.com')).toBeInTheDocument()
    expect(screen.getByLabelText('Azure tenant ID')).toBeInTheDocument()
    expect(screen.getByLabelText('Azure subscription ID')).toBeInTheDocument()
  })

  describe('for a cluster registry', () => {
    const onPremiseCluster = {
      ...clusterFactoryMock(1, CloudProviderEnum.ON_PREMISE)[0],
      kubernetes: KubernetesEnum.SELF_MANAGED,
      is_demo: false,
    }
    const awsCluster = clusterFactoryMock(1, CloudProviderEnum.AWS)[0]

    const getKindOptions = () => {
      selectEvent.openMenu(screen.getByLabelText('Type'))
      return screen.getAllByRole('option').map((option) => option.textContent)
    }

    it('hides the registry name and description and offers the on-premise kinds at cluster creation', () => {
      renderWithProviders(
        wrapWithReactHookForm(<ContainerRegistryForm fromClusterCreation />, {
          defaultValues: { kind: ContainerRegistryKindEnum.GENERIC_CR },
        })
      )

      expect(screen.queryByLabelText('Registry name')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Description')).not.toBeInTheDocument()
      expect(getKindOptions()).toStrictEqual(['DOCKER_HUB', 'GENERIC_CR', 'GITHUB_CR'])
    })

    it('offers the on-premise kinds in the settings of an on-premise cluster', () => {
      renderWithProviders(
        wrapWithReactHookForm(<ContainerRegistryForm fromEditClusterSettings cluster={onPremiseCluster} />, {
          defaultValues: { name: 'hello', kind: ContainerRegistryKindEnum.GENERIC_CR },
        })
      )

      expect(screen.getByLabelText('Registry name')).toBeDisabled()
      expect(getKindOptions()).toStrictEqual(['DOCKER_HUB', 'GENERIC_CR', 'GITHUB_CR'])
    })

    it.each([ContainerRegistryKindEnum.GITHUB_CR, ContainerRegistryKindEnum.DOCKER_HUB])(
      'forces the account login of a %s registry at cluster creation',
      async (kind) => {
        renderWithProviders(
          wrapWithReactHookForm(<ContainerRegistryForm fromClusterCreation />, {
            defaultValues: { kind: ContainerRegistryKindEnum.GENERIC_CR, config: { login_type: 'ANONYMOUS' } },
          })
        )

        await selectEvent.select(screen.getByLabelText('Type'), kind, { container: document.body })

        expect(screen.getByLabelText('Login type')).toBeDisabled()
        expect(screen.getByText('Account')).toBeInTheDocument()
        expect(screen.getByTestId('input-username')).toBeInTheDocument()
        expect(screen.getByTestId('input-password')).toBeInTheDocument()
      }
    )

    it('shows the account login of a GitHub registry loaded in the settings of an on-premise cluster', () => {
      renderWithProviders(
        wrapWithReactHookForm(<ContainerRegistryForm fromEditClusterSettings cluster={onPremiseCluster} />, {
          defaultValues: { kind: ContainerRegistryKindEnum.GITHUB_CR, url: 'https://ghcr.io' },
        })
      )

      expect(screen.getByLabelText('Login type')).toBeDisabled()
      expect(screen.getByLabelText('Personal Access Token')).toBeInTheDocument()
    })

    it('checks a generic registry URL against the cluster registry rules in the settings of an on-premise cluster', async () => {
      const { userEvent } = renderWithProviders(
        wrapWithReactHookForm(<ContainerRegistryForm fromEditClusterSettings cluster={onPremiseCluster} />, {
          defaultValues: { kind: ContainerRegistryKindEnum.GENERIC_CR, url: '' },
        })
      )

      expect(
        screen.getByText('Expected format: https://registry.example.com or https://registry.example.com:5000')
      ).toBeInTheDocument()
      await userEvent.type(screen.getByLabelText('Registry url'), 'https://registry.example.com/v2')

      expect(
        await screen.findByText('The registry URL must not contain a path: keep the host and the optional port only.')
      ).toBeInTheDocument()
    })

    it('keeps the generic registry URL check of an organization registry', async () => {
      const { userEvent } = renderWithProviders(
        wrapWithReactHookForm(<ContainerRegistryForm />, {
          defaultValues: { kind: ContainerRegistryKindEnum.GENERIC_CR, url: '' },
        })
      )

      expect(screen.queryByText(/^Expected format/)).not.toBeInTheDocument()
      await userEvent.type(screen.getByLabelText('Registry url'), 'https://registry.example.com/v2')
      await userEvent.tab()

      expect(screen.queryByText(/The registry URL must not contain a path/)).not.toBeInTheDocument()
      expect(screen.queryByText('URL must be valid and start with «http(s)://»')).not.toBeInTheDocument()
    })

    it('does not encourage Docker Hub credentials where they are required', async () => {
      renderWithProviders(
        wrapWithReactHookForm(<ContainerRegistryForm fromClusterCreation />, {
          defaultValues: { kind: ContainerRegistryKindEnum.GENERIC_CR, config: { login_type: 'ANONYMOUS' } },
        })
      )

      await selectEvent.select(screen.getByLabelText('Type'), 'DOCKER_HUB', { container: document.body })

      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.queryByText(/We encourage you to set credentials for Docker Hub/)).not.toBeInTheDocument()
    })

    it('still encourages Docker Hub credentials for an organization registry', () => {
      renderWithProviders(
        wrapWithReactHookForm(<ContainerRegistryForm />, {
          defaultValues: { kind: ContainerRegistryKindEnum.DOCKER_HUB, config: { login_type: 'ACCOUNT' } },
        })
      )

      expect(screen.getByText(/We encourage you to set credentials for Docker Hub/)).toBeInTheDocument()
    })

    it('empties the saved credentials when the kind changes in the settings of a cluster', async () => {
      renderWithProviders(
        wrapWithReactHookForm(<ContainerRegistryForm fromEditClusterSettings cluster={onPremiseCluster} />, {
          defaultValues: {
            kind: ContainerRegistryKindEnum.GITHUB_CR,
            url: 'https://ghcr.io',
            config: { username: 'qovery' },
          },
        })
      )
      expect(screen.getByLabelText('Container registry prefix')).toHaveValue('qovery')

      await selectEvent.select(screen.getByLabelText('Type'), 'DOCKER_HUB', { container: document.body })

      expect(screen.getByLabelText('Username')).toHaveValue('')
      expect(screen.getByLabelText('Password')).toHaveValue('')
    })

    it('keeps the login type of a GitHub registry free in the settings of another cluster', () => {
      renderWithProviders(
        wrapWithReactHookForm(<ContainerRegistryForm fromEditClusterSettings cluster={awsCluster} />, {
          defaultValues: { kind: ContainerRegistryKindEnum.GITHUB_CR, url: 'https://ghcr.io' },
        })
      )

      expect(screen.getByLabelText('Login type')).toBeEnabled()
      expect(screen.queryByLabelText('Personal Access Token')).not.toBeInTheDocument()
    })
  })
})
