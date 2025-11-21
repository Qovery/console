import selectEvent from 'react-select-event'
import { helmRepositoriesMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAvailableHelmRepositories from '../hooks/use-available-helm-repositories/use-available-helm-repositories'
import * as useCreateHelmRepository from '../hooks/use-create-helm-repository/use-create-helm-repository'
import * as useEditHelmRepository from '../hooks/use-edit-helm-repository/use-edit-helm-repository'
import HelmRepositoryCreateEditModal, {
  type HelmRepositoryCreateEditModalProps,
} from './helm-repository-create-edit-modal'

const useCreateHelmRepositoryMockSpy = jest.spyOn(useCreateHelmRepository, 'useCreateHelmRepository') as jest.Mock
const useEditHelmRepositoryMockSpy = jest.spyOn(useEditHelmRepository, 'useEditHelmRepository') as jest.Mock
const useAvailableHelmRepositoriesMockSpy = jest.spyOn(
  useAvailableHelmRepositories,
  'useAvailableHelmRepositories'
) as jest.Mock

const props: HelmRepositoryCreateEditModalProps = {
  organizationId: '0000-0000-0000',
  onClose: jest.fn(),
}

const mockHelmRepositories = helmRepositoriesMock(2)

describe('HelmRepositoryCreateEditModal', () => {
  beforeEach(() => {
    useCreateHelmRepositoryMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useEditHelmRepositoryMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useAvailableHelmRepositoriesMockSpy.mockReturnValue({
      data: [
        {
          kind: 'HTTPS',
          required_config: ['username', 'password'],
          is_mandatory: false,
        },
        {
          kind: 'OCI_ECR',
          required_config: ['region', 'access_key_id', 'secret_access_key'],
          is_mandatory: true,
        },
        {
          kind: 'OCI_SCALEWAY_CR',
          required_config: ['region', 'scaleway_project_id', 'scaleway_access_key', 'scaleway_secret_key'],
          is_mandatory: true,
        },
        {
          kind: 'OCI_DOCKER_HUB',
          required_config: ['username', 'password'],
          is_mandatory: false,
        },
        {
          kind: 'OCI_PUBLIC_ECR',
          required_config: [],
          is_mandatory: false,
        },
        {
          kind: 'OCI_GENERIC_CR',
          required_config: ['username', 'password'],
          is_mandatory: false,
        },
        {
          kind: 'OCI_GITHUB_CR',
          required_config: ['username', 'password'],
          is_mandatory: false,
        },
        {
          kind: 'OCI_GITLAB_CR',
          required_config: ['username', 'password'],
          is_mandatory: false,
        },
      ],
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<HelmRepositoryCreateEditModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with HTTPS', async () => {
    renderWithProviders(
      <HelmRepositoryCreateEditModal
        repository={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',
          name: 'hello',
          description: 'description',
          url: 'https://helm-charts.io',
          kind: 'HTTPS',
        }}
        {...props}
      />
    )

    const submitButton = await screen.findByRole('button', { name: /Create/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(submitButton).toBeInTheDocument()

    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://helm-charts.io')
    screen.getByLabelText('Login type')
  })

  it('should create helm repository if form is submitted', async () => {
    props.repository = undefined

    const { userEvent } = renderWithProviders(<HelmRepositoryCreateEditModal {...props} />)

    const inputName = screen.getByTestId('input-name')
    await userEvent.type(inputName, 'my-repository')

    const selectType = screen.getByLabelText('Kind')
    await selectEvent.select(selectType, 'HTTPS', { container: document.body })

    const selectLoginType = screen.getByLabelText('Login type')
    await selectEvent.select(selectLoginType, 'Account', { container: document.body })

    const inputUsername = screen.getByTestId('input-username')
    await userEvent.type(inputUsername, 'hello')

    const inputPassword = screen.getByTestId('input-password')
    await userEvent.type(inputPassword, 'password')

    const inputUrl = screen.getByTestId('input-url')
    await userEvent.type(inputUrl, 'https://helm-charts.io')

    const button = await screen.findByRole('button', { name: /Create/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    const mockHelmRepositoriesConfig = mockHelmRepositories[0]

    expect(useCreateHelmRepositoryMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      helmRepositoryRequest: {
        name: 'my-repository',
        kind: mockHelmRepositoriesConfig.kind,
        description: undefined,
        url: 'https://helm-charts.io',
        config: {
          access_key_id: undefined,
          region: undefined,
          scaleway_access_key: undefined,
          scaleway_secret_key: undefined,
          secret_access_key: undefined,
          username: 'hello',
          password: 'password',
        },
      },
    })
  })

  it('should submit the form to edit a repository', async () => {
    const { userEvent } = renderWithProviders(
      <HelmRepositoryCreateEditModal
        {...props}
        isEdit
        repository={{
          id: '1111-1111-1111',
          created_at: '',
          updated_at: '',
          name: 'hello',
          description: 'description',
          url: 'https://helm-charts.io',
          kind: 'HTTPS',
        }}
      />
    )

    const inputName = screen.getByLabelText('Repository name')
    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'my-repository-name')

    const btn = screen.getByRole('button', { name: 'Confirm' })
    expect(btn).toBeEnabled()

    await userEvent.click(btn)

    expect(useEditHelmRepositoryMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      helmRepositoryId: '1111-1111-1111',
      helmRepositoryRequest: {
        config: {
          access_key_id: undefined,
          password: undefined,
          region: undefined,
          scaleway_access_key: undefined,
          scaleway_secret_key: undefined,
          secret_access_key: undefined,
          username: undefined,
        },
        id: '1111-1111-1111',
        description: 'description',
        kind: 'HTTPS',
        name: 'my-repository-name',
        skip_tls_verification: undefined,
        url: 'https://helm-charts.io',
      },
    })

    expect(props.onClose).toHaveBeenCalled()
  })

  it('should create helm repository with OCI_ECR STATIC credentials', async () => {
    props.repository = undefined

    const { userEvent } = renderWithProviders(<HelmRepositoryCreateEditModal {...props} />)

    const inputName = screen.getByTestId('input-name')
    await userEvent.type(inputName, 'my-ecr-repo')

    const selectType = screen.getByLabelText('Kind')
    await selectEvent.select(selectType, 'OCI_ECR', { container: document.body })

    const selectAuthType = screen.getByLabelText('Authentication method')
    await selectEvent.select(selectAuthType, 'Static credentials', { container: document.body })

    const inputRegion = screen.getByTestId('input-region')
    await userEvent.type(inputRegion, 'us-east-1')

    const inputAccessKey = screen.getByTestId('input-access_key_id')
    await userEvent.type(inputAccessKey, 'AKIAIOSFODNN7EXAMPLE')

    const inputSecretKey = screen.getByTestId('input-secret_access_key')
    await userEvent.type(inputSecretKey, 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY')

    const inputUrl = screen.getByTestId('input-url')
    await userEvent.type(inputUrl, 'oci://123456789012.dkr.ecr.us-east-1.amazonaws.com')

    const button = await screen.findByRole('button', { name: /Create/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    expect(useCreateHelmRepositoryMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      helmRepositoryRequest: {
        name: 'my-ecr-repo',
        kind: 'OCI_ECR',
        description: undefined,
        url: 'oci://123456789012.dkr.ecr.us-east-1.amazonaws.com',
        config: {
          region: 'us-east-1',
          access_key_id: 'AKIAIOSFODNN7EXAMPLE',
          secret_access_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
          username: undefined,
          password: undefined,
          scaleway_access_key: undefined,
          scaleway_secret_key: undefined,
        },
      },
    })
  })

  it('should create helm repository with OCI_ECR STS role', async () => {
    props.repository = undefined

    const { userEvent } = renderWithProviders(<HelmRepositoryCreateEditModal {...props} />)

    const inputName = screen.getByTestId('input-name')
    await userEvent.type(inputName, 'my-ecr-repo-sts')

    const selectType = screen.getByLabelText('Kind')
    await selectEvent.select(selectType, 'OCI_ECR', { container: document.body })

    const selectAuthType = screen.getByLabelText('Authentication method')
    await selectEvent.select(selectAuthType, 'Assume role via STS (preferred)', { container: document.body })

    const inputRegion = screen.getByTestId('input-region')
    await userEvent.type(inputRegion, 'us-east-1')

    const inputRoleArn = screen.getByTestId('input-role_arn')
    await userEvent.type(inputRoleArn, 'arn:aws:iam::123456789012:role/MyRole')

    const inputUrl = screen.getByTestId('input-url')
    await userEvent.type(inputUrl, 'oci://123456789012.dkr.ecr.us-east-1.amazonaws.com')

    const button = await screen.findByRole('button', { name: /Create/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    expect(useCreateHelmRepositoryMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      helmRepositoryRequest: {
        name: 'my-ecr-repo-sts',
        kind: 'OCI_ECR',
        description: undefined,
        url: 'oci://123456789012.dkr.ecr.us-east-1.amazonaws.com',
        config: {
          region: 'us-east-1',
          role_arn: 'arn:aws:iam::123456789012:role/MyRole',
          username: undefined,
          password: undefined,
          scaleway_access_key: undefined,
          scaleway_secret_key: undefined,
        },
      },
    })
  })

  it('should switch between STATIC and STS authentication methods', async () => {
    props.repository = undefined

    const { userEvent } = renderWithProviders(<HelmRepositoryCreateEditModal {...props} />)

    const selectType = screen.getByLabelText('Kind')
    await selectEvent.select(selectType, 'OCI_ECR', { container: document.body })

    // Initially select STATIC
    const selectAuthType = await screen.findByLabelText('Authentication method')
    await selectEvent.select(selectAuthType, 'Static credentials', { container: document.body })

    // Should show access key and secret key fields
    await screen.findByLabelText('Access key')
    expect(screen.getByLabelText('Access key')).toBeInTheDocument()
    expect(screen.getByLabelText('Secret key')).toBeInTheDocument()
    expect(screen.queryByLabelText('Role ARN')).not.toBeInTheDocument()

    // Switch to STS
    await selectEvent.select(selectAuthType, 'Assume role via STS (preferred)', { container: document.body })

    // Should show role ARN field
    await screen.findByLabelText('Role ARN')
    expect(screen.getByLabelText('Role ARN')).toBeInTheDocument()
    expect(screen.queryByLabelText('Access key')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Secret key')).not.toBeInTheDocument()
  })
})
