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
        description: 'description',
        kind: 'HTTPS',
        name: 'my-repository-name',
        skip_tls_verification: undefined,
        url: 'https://helm-charts.io',
      },
    })

    expect(props.onClose).toHaveBeenCalled()
  })
})
