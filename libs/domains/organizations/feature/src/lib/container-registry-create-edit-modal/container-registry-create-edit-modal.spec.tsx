import { useFeatureFlagEnabled } from 'posthog-js/react'
import {
  ContainerRegistryKindEnum,
  type ContainerRegistryRequest,
  type ContainerRegistryResponse,
} from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAvailableContainerRegistries from '../hooks/use-available-container-registries/use-available-container-registries'
import * as useCreateContainerRegistry from '../hooks/use-create-container-registry/use-create-container-registry'
import * as useEditContainerRegistry from '../hooks/use-edit-container-registry/use-edit-container-registry'
import ContainerRegistryCreateEditModal, {
  type ContainerRegistryCreateEditModalProps,
  getDefaultType,
  getGcpProjectIdFromServiceAccountEmail,
  getPayloadConfig,
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
const useFeatureFlagEnabledMock = useFeatureFlagEnabled as jest.MockedFunction<typeof useFeatureFlagEnabled>

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(() => false),
}))

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

    useFeatureFlagEnabledMock.mockReturnValue(true)
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

  it('should render the form with ECR and STS credentials', async () => {
    renderWithProviders(
      <ContainerRegistryCreateEditModal
        registry={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.ECR,
          config: {
            region: 'us-east-1',
            role_arn: 'arn:aws:iam::123456789012:role/MyRole',
          },
        }}
        {...props}
      />
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
    screen.getByDisplayValue('us-east-1')
    screen.getByDisplayValue('arn:aws:iam::123456789012:role/MyRole')

    screen.getByLabelText('Region')
    screen.getByLabelText('Role ARN')
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

  it('should render the form with GCP_ARTIFACT_REGISTRY WIF', async () => {
    renderWithProviders(
      <ContainerRegistryCreateEditModal
        registry={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',
          name: 'hello',
          url: 'https://us-east1-docker.pkg.dev',
          kind: ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY,
          config: {
            region: 'us-east1',
            service_account_email: 'qovery@my-project.iam.gserviceaccount.com',
            workload_identity_provider_resource:
              'projects/123456789/locations/global/workloadIdentityPools/qovery/providers/qovery-provider',
          },
        }}
        {...props}
      />
    )

    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://us-east1-docker.pkg.dev')
    screen.getByDisplayValue('us-east1')
    screen.getByDisplayValue('qovery@my-project.iam.gserviceaccount.com')
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

    expect(useCreateContainerRegistryMockSpy().mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: '0000-0000-0000',
        containerRegistryRequest: expect.objectContaining({
          kind: 'DOCKER_HUB',
          name: 'registry-name',
          url: 'https://docker.io',
          config: expect.objectContaining({
            region: undefined,
            username: undefined,
          }),
        }),
      })
    )

    expect(props.onClose).toHaveBeenCalledWith({ id: '000' })
  })

  it('should submit the form to create a GCP WIF registry', async () => {
    const { userEvent } = renderWithProviders(<ContainerRegistryCreateEditModal {...props} />)

    const inputType = screen.getByLabelText('Type')
    await selectEvent.select(inputType, 'GCP_ARTIFACT_REGISTRY', {
      container: document.body,
    })

    const inputName = screen.getByLabelText('Registry name')
    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'registry-name')

    const inputUrl = screen.getByLabelText('Registry url')
    await userEvent.clear(inputUrl)
    await userEvent.type(inputUrl, 'https://us-east1-docker.pkg.dev')

    const inputRegion = screen.getByLabelText('Region')
    await userEvent.type(inputRegion, 'us-east1')

    const inputServiceAccount = screen.getByLabelText('Service account email')
    await userEvent.type(inputServiceAccount, 'qovery@my-project.iam.gserviceaccount.com')

    const inputWorkloadIdentityProviderResource = screen.getByLabelText('Workload identity provider resource')
    await userEvent.type(
      inputWorkloadIdentityProviderResource,
      'projects/123456789/locations/global/workloadIdentityPools/qovery/providers/qovery-provider'
    )

    const btn = screen.getByRole('button', { name: 'Create' })
    expect(btn).toBeEnabled()

    await userEvent.click(btn)

    expect(useCreateContainerRegistryMockSpy().mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: '0000-0000-0000',
        containerRegistryRequest: expect.objectContaining({
          kind: ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY,
          name: 'registry-name',
          url: 'https://us-east1-docker.pkg.dev',
          config: expect.objectContaining({
            region: 'us-east1',
            gcp_credentials_type: 'workload_identity_federation',
            project_id: 'my-project',
            service_account_email: 'qovery@my-project.iam.gserviceaccount.com',
            workload_identity_provider_resource:
              'projects/123456789/locations/global/workloadIdentityPools/qovery/providers/qovery-provider',
          }),
        }),
      })
    )
  }, 30000)

  it('should set default registry type based on existing registry config', () => {
    expect(getDefaultType(undefined)).toBe('STS')

    const awsStaticRegistry = {
      id: '1111',
      created_at: '',
      updated_at: '',
      name: 'my-registry',
      url: 'https://registry.aws.com',
      kind: ContainerRegistryKindEnum.DOCKER_HUB,
      config: {
        region: 'eu-west-1',
      },
    } as ContainerRegistryResponse
    expect(getDefaultType(awsStaticRegistry)).toBe('STATIC')

    const awsStsRegistry = {
      id: '2222',
      created_at: '',
      updated_at: '',
      name: 'my-registry',
      url: 'https://registry.aws.com',
      kind: ContainerRegistryKindEnum.ECR,
      config: {
        region: 'us-east-1',
        role_arn: 'arn:aws:iam::123456789012:role/MyRole',
      },
    } as ContainerRegistryResponse
    expect(getDefaultType(awsStsRegistry)).toBe('STS')

    const gcpStaticRegistry = {
      id: '3333',
      created_at: '',
      updated_at: '',
      name: 'my-registry',
      url: 'https://us-east1-docker.pkg.dev',
      kind: ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY,
      config: {
        region: 'us-east1',
        service_account_email: 'qovery@my-project.iam.gserviceaccount.com',
      },
    } as ContainerRegistryResponse
    expect(getDefaultType(gcpStaticRegistry)).toBe('WIF')

    const gcpWifRegistryWithoutEmail = {
      id: '4444',
      created_at: '',
      updated_at: '',
      name: 'my-registry',
      url: 'https://us-east1-docker.pkg.dev',
      kind: ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY,
      config: {
        region: 'us-east1',
        workload_identity_provider_resource:
          'projects/123456789/locations/global/workloadIdentityPools/qovery/providers/qovery-provider',
      },
    } as ContainerRegistryResponse
    expect(getDefaultType(gcpWifRegistryWithoutEmail)).toBe('WIF')
  })

  it('should build payload for registry based on type and kind', () => {
    expect(
      getPayloadConfig({
        type: 'STS',
        kind: ContainerRegistryKindEnum.ECR,
        config: {
          region: 'us-east-1',
          role_arn: 'arn:aws:iam::123456789012:role/my-role',
          secret_access_key: 'ignored',
        } as unknown as Omit<ContainerRegistryRequest['config'], 'login_type'>,
      })
    ).toEqual({
      role_arn: 'arn:aws:iam::123456789012:role/my-role',
      region: 'us-east-1',
    })

    expect(
      getPayloadConfig({
        type: 'WIF',
        kind: ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY,
        config: {
          region: 'europe-west1',
          service_account_email: 'qovery@my-project.iam.gserviceaccount.com',
          workload_identity_provider_resource:
            'projects/123456789/locations/global/workloadIdentityPools/qovery/providers/qovery-provider',
        } as unknown as Omit<ContainerRegistryRequest['config'], 'login_type'>,
      })
    ).toEqual({
      gcp_credentials_type: 'workload_identity_federation',
      project_id: 'my-project',
      region: 'europe-west1',
      service_account_email: 'qovery@my-project.iam.gserviceaccount.com',
      workload_identity_provider_resource:
        'projects/123456789/locations/global/workloadIdentityPools/qovery/providers/qovery-provider',
    })

    expect(
      getPayloadConfig({
        type: 'WIF',
        kind: ContainerRegistryKindEnum.GCP_ARTIFACT_REGISTRY,
        config: {
          region: 'europe-west1',
          workload_identity_provider_resource:
            'projects/123456789/locations/global/workloadIdentityPools/qovery/providers/qovery-provider',
          project_id: 'my-project',
        } as unknown as Omit<ContainerRegistryRequest['config'], 'login_type'>,
      })
    ).toEqual({
      gcp_credentials_type: 'workload_identity_federation',
      project_id: 'my-project',
      region: 'europe-west1',
      service_account_email: undefined,
      workload_identity_provider_resource:
        'projects/123456789/locations/global/workloadIdentityPools/qovery/providers/qovery-provider',
    })

    expect(
      getPayloadConfig({
        type: 'STATIC',
        kind: ContainerRegistryKindEnum.DOCKER_HUB,
        config: {
          username: 'John.Doe',
          region: 'eu-west-1',
        } as unknown as Omit<ContainerRegistryRequest['config'], 'login_type'>,
      })
    ).toEqual({
      role_arn: undefined,
      username: 'john.doe',
      region: 'eu-west-1',
    })
  })

  it('should get GCP project ID from service account email', () => {
    expect(getGcpProjectIdFromServiceAccountEmail('qovery@my-project.iam.gserviceaccount.com')).toBe('my-project')
    expect(getGcpProjectIdFromServiceAccountEmail('invalid')).toBeUndefined()
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

    expect(useEditContainerRegistryMockSpy().mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: '0000-0000-0000',
        containerRegistryId: '1111-1111-1111',
        containerRegistryRequest: expect.objectContaining({
          kind: 'DOCR',
          name: 'my-registry-name',
          config: expect.objectContaining({
            region: undefined,
            username: undefined,
          }),
        }),
      })
    )

    expect(props.onClose).toHaveBeenCalled()
  })
})
