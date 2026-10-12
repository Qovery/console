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
  it('imports a JSON key and follows its name until the secret name is overridden', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <AddSecretModal isJson secretSources={secretSources} onClose={jest.fn()} onSubmit={onSubmit} />
    )
    expect(screen.queryByLabelText('Display name')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Key prefix (optional)')).not.toBeInTheDocument()
    expect(screen.queryByText('Variables to import')).not.toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Reference'), 'production/database')
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Key name'), 'DATABASE_URL')
    expect(screen.getByLabelText('Secret name')).toHaveValue('DATABASE_URL')
    await userEvent.clear(screen.getByLabelText('Key name'))
    await userEvent.type(screen.getByLabelText('Key name'), 'DATABASE_PASSWORD')
    expect(screen.getByLabelText('Secret name')).toHaveValue('DATABASE_PASSWORD')
    await userEvent.clear(screen.getByLabelText('Secret name'))
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Secret name'), 'APP_PASSWORD')
    await userEvent.clear(screen.getByLabelText('Key name'))
    await userEvent.type(screen.getByLabelText('Key name'), 'password')
    expect(screen.getByLabelText('Secret name')).toHaveValue('APP_PASSWORD')
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'APP_PASSWORD',
          keyName: 'password',
          reference: 'production/database',
          isJson: true,
        })
      )
    )
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('keyPrefix')
  })

  it.each([
    ['accounts.0.password', 'accounts_0_password'],
    [String.raw`database\.password`, 'database__password'],
    ['0.password', '_0_password'],
  ])('suggests a valid variable name for %s without changing the selector', async (keyName, name) => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <AddSecretModal isJson secretSources={secretSources} onClose={jest.fn()} onSubmit={onSubmit} />
    )
    await userEvent.type(screen.getByLabelText('Reference'), 'production/config')
    await userEvent.type(screen.getByLabelText('Key name'), keyName)
    expect(screen.getByLabelText('Secret name')).toHaveValue(name)
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name, keyName })))
  })

  it.each(['accounts.0.password', 'APP-PASSWORD', 'APP PASSWORD', '0PASSWORD'])(
    'rejects the invalid custom JSON environment variable name %s',
    async (name) => {
      const onSubmit = jest.fn()
      const { userEvent } = renderWithProviders(
        <AddSecretModal isJson secretSources={secretSources} onClose={jest.fn()} onSubmit={onSubmit} />
      )
      await userEvent.type(screen.getByLabelText('Reference'), 'production/config')
      await userEvent.type(screen.getByLabelText('Key name'), 'password')
      await userEvent.clear(screen.getByLabelText('Secret name'))
      await userEvent.type(screen.getByLabelText('Secret name'), name)
      expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled()
      expect(
        screen.getByText(
          'Variable name must start with a letter or underscore, and contain only letters, numbers, and underscores.'
        )
      ).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    }
  )

  it.each(['Key name', 'Secret name'])('requires a nonblank %s for JSON secrets', async (label) => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <AddSecretModal isJson secretSources={secretSources} onClose={jest.fn()} onSubmit={onSubmit} />
    )
    await userEvent.type(screen.getByLabelText('Reference'), 'production/database')
    await userEvent.type(screen.getByLabelText('Key name'), 'password')
    await userEvent.clear(screen.getByLabelText(label))
    await userEvent.type(screen.getByLabelText(label), '   ')
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('keeps names unlinked after an override even when they match again', async () => {
    const { userEvent } = renderWithProviders(
      <AddSecretModal isJson secretSources={secretSources} onClose={jest.fn()} onSubmit={jest.fn()} />
    )
    await userEvent.type(screen.getByLabelText('Key name'), 'password')
    await userEvent.clear(screen.getByLabelText('Secret name'))
    await userEvent.type(screen.getByLabelText('Secret name'), 'password')
    await userEvent.type(screen.getByLabelText('Key name'), '_new')
    expect(screen.getByLabelText('Secret name')).toHaveValue('password')
  })

  it('submits the auto-filled secret name without adding an underscore', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <AddSecretModal isJson secretSources={secretSources} onClose={jest.fn()} onSubmit={onSubmit} />
    )
    await userEvent.type(screen.getByLabelText('Reference'), 'production/database')
    await userEvent.type(screen.getByLabelText('Key name'), 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'password', keyName: 'password' }))
    )
  })

  it('preserves the saved secret name when editing a JSON key and supports retry after failure', async () => {
    const onClose = jest.fn()
    const onSubmit = jest.fn().mockRejectedValue(new Error('Could not save'))
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const { userEvent } = renderWithProviders(
      <AddSecretModal
        isJson
        mode="edit"
        initialSecret={{ name: 'APP_PASSWORD', keyName: 'password', reference: 'production/database' }}
        secretSources={secretSources}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    )
    expect(screen.getByLabelText('Secret name')).toHaveValue('APP_PASSWORD')
    expect(screen.getByLabelText('Key name')).toHaveValue('password')
    await userEvent.type(screen.getByLabelText('Key name'), '_new')
    expect(screen.getByLabelText('Secret name')).toHaveValue('APP_PASSWORD')
    await userEvent.click(screen.getByRole('button', { name: 'Edit secret' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'APP_PASSWORD', keyName: 'password_new' }))
    )
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save')
    onSubmit.mockResolvedValueOnce(undefined)
    await userEvent.click(screen.getByRole('button', { name: 'Edit secret' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    consoleError.mockRestore()
  })

  it('does not infer JSON keys from the reference name', async () => {
    useSecretManagerProviderSecretsMock.mockReturnValue({
      data: { results: ['production/app'] },
      isError: false,
      isFetching: false,
    } as ReturnType<typeof useSecretManagerProviderSecrets>)
    const { userEvent } = renderWithProviders(
      <AddSecretModal isJson secretSources={secretSources} onClose={jest.fn()} onSubmit={jest.fn()} />
    )
    await userEvent.click(screen.getByLabelText('Reference'))
    await userEvent.click(screen.getByText('production/app'))
    expect(screen.getByLabelText('Key name')).toHaveValue('')
    expect(screen.getByLabelText('Secret name')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled()
  })
})
