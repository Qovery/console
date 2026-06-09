import { useSecretManagerProviderSecrets } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { AddSecretModal, type SecretSourceOption } from './add-secret-modal'

jest.mock('@qovery/domains/clusters/feature', () => ({
  ...jest.requireActual('@qovery/domains/clusters/feature'),
  useSecretManagerProviderSecrets: jest.fn(),
}))

describe('AddSecretModal', () => {
  const useSecretManagerProviderSecretsMock = useSecretManagerProviderSecrets as jest.MockedFunction<
    typeof useSecretManagerProviderSecrets
  >

  const secretSources: SecretSourceOption[] = [
    {
      value: 'secret-manager-access-id',
      label: 'Prod secret manager',
      tableLabel: 'Prod secret manager',
      icon: 'aws',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    useSecretManagerProviderSecretsMock.mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: false,
    } as ReturnType<typeof useSecretManagerProviderSecrets>)
  })

  it('should not retry provider secret requests', () => {
    renderWithProviders(<AddSecretModal secretSources={secretSources} onClose={jest.fn()} onSubmit={jest.fn()} />)

    expect(useSecretManagerProviderSecretsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        retry: false,
      })
    )
  })

  it('should render reference as a text input when provider secrets fail to load', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <AddSecretModal secretSources={secretSources} onClose={jest.fn()} onSubmit={onSubmit} />
    )

    await userEvent.type(screen.getByLabelText('Reference'), 'custom/path/db-password')
    await userEvent.type(screen.getByLabelText('Secret name'), 'DATABASE_PASSWORD')
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'DATABASE_PASSWORD',
        description: undefined,
        filePath: undefined,
        isFile: false,
        reference: 'custom/path/db-password',
        secretManagerAccessId: 'secret-manager-access-id',
      })
    })
  })

  it('should require acknowledgement before creating an environment-level external secret', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <AddSecretModal secretSources={secretSources} scope="ENVIRONMENT" onClose={jest.fn()} onSubmit={onSubmit} />
    )

    expect(screen.getByText('Be careful when defining an external secret at environment level:')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Reference'), 'custom/path/db-password')
    await userEvent.type(screen.getByLabelText('Secret name'), 'DATABASE_PASSWORD')

    expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled()

    await userEvent.click(screen.getByRole('checkbox', { name: /I understand the secret can be fetched/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'DATABASE_PASSWORD',
          reference: 'custom/path/db-password',
          secretManagerAccessId: 'secret-manager-access-id',
        })
      )
    })
  })
})
