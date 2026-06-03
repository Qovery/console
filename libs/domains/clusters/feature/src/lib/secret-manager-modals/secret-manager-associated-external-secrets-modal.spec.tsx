import { APIVariableScopeEnum, type ExternalSecretAssociatedServiceResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useSecretManagerAssociatedServices from '../hooks/use-secret-manager-associated-services/use-secret-manager-associated-services'
import SecretManagerAssociatedExternalSecretsModal, {
  type SecretManagerAssociatedExternalSecretsModalProps,
  groupExternalSecretsByProjectEnvironment,
} from './secret-manager-associated-external-secrets-modal'

const useSecretManagerAssociatedServicesMockSpy = jest.spyOn(
  useSecretManagerAssociatedServices,
  'useSecretManagerAssociatedServices'
) as jest.Mock

const props: SecretManagerAssociatedExternalSecretsModalProps = {
  organizationId: '0000-0000-0000',
  secretManagerAccessId: 'secret-manager-access-id',
  onClose: jest.fn(),
}

const data: ExternalSecretAssociatedServiceResponse[] = [
  {
    project_id: 'project-1',
    project_name: 'Project 1',
    environment_id: 'environment-1',
    environment_name: 'Development',
    variable_name: 'ENV_EXT_DATABASE',
    external_secret_name: 'staging/application/database',
  },
  {
    project_id: 'project-1',
    project_name: 'Project 1',
    environment_id: 'environment-1',
    environment_name: 'Development',
    service_id: 'service-1',
    service_name: 'Backend API',
    service_type: APIVariableScopeEnum.APPLICATION,
    variable_name: 'CREDENTIALS',
    external_secret_name: 'staging/database/credentials',
  },
  {
    project_id: 'project-1',
    project_name: 'Project 1',
    environment_id: 'environment-1',
    environment_name: 'Development',
    service_id: 'service-1',
    service_name: 'Backend API',
    service_type: APIVariableScopeEnum.APPLICATION,
    variable_name: 'DATABASE',
    external_secret_name: 'staging/application/database',
  },
]

describe('SecretManagerAssociatedExternalSecretsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useSecretManagerAssociatedServicesMockSpy.mockReturnValue({
      data,
      isLoading: false,
    })
  })

  it('should group external secrets by project, environment, and service', () => {
    const result = groupExternalSecretsByProjectEnvironment(data)

    expect(result).toHaveLength(1)
    expect(result[0].environments[0].externalSecrets).toHaveLength(1)
    expect(result[0].environments[0].services).toHaveLength(1)
    expect(result[0].environments[0].services[0]).toMatchObject({
      service_id: 'service-1',
      service_name: 'Backend API',
      externalSecrets: [
        {
          variable_name: 'CREDENTIALS',
          external_secret_name: 'staging/database/credentials',
        },
        {
          variable_name: 'DATABASE',
          external_secret_name: 'staging/application/database',
        },
      ],
    })
  })

  it('should render environment and service sections with service depth', async () => {
    const { userEvent } = renderWithProviders(<SecretManagerAssociatedExternalSecretsModal {...props} />)

    expect(screen.getByRole('heading', { name: 'Associated external secrets' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Environment external secret' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Service external secrets' })).toBeInTheDocument()

    await userEvent.click(screen.getAllByRole('button')[0])
    await userEvent.click(screen.getAllByRole('button')[1])

    expect(screen.getByText('ENV_EXT_DATABASE')).toBeInTheDocument()
    expect(screen.getByText('staging/application/database')).toBeInTheDocument()

    await userEvent.click(screen.getAllByRole('button')[2])
    await userEvent.click(screen.getAllByRole('button')[3])
    await userEvent.click(screen.getAllByRole('button')[4])

    expect(screen.getByText('Backend API')).toBeInTheDocument()
    expect(screen.getByText('CREDENTIALS')).toBeInTheDocument()
    expect(screen.getByText('DATABASE')).toBeInTheDocument()
  })

  it('should search by service name', () => {
    const result = groupExternalSecretsByProjectEnvironment(data, 'backend')

    expect(result).toHaveLength(1)
    expect(result[0].environments[0].externalSecrets).toHaveLength(0)
    expect(result[0].environments[0].services[0]).toMatchObject({
      service_name: 'Backend API',
      externalSecrets: [
        {
          variable_name: 'CREDENTIALS',
        },
        {
          variable_name: 'DATABASE',
        },
      ],
    })
  })

  it('should show loading spinner when loading', () => {
    useSecretManagerAssociatedServicesMockSpy.mockReturnValue({
      data: [],
      isLoading: true,
    })

    renderWithProviders(<SecretManagerAssociatedExternalSecretsModal {...props} />)

    expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument()
  })
})
