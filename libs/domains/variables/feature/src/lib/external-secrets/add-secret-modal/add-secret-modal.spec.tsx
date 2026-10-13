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
  it('submits a JSON display name separately from its reference', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <AddSecretModal
        isJson
        jsonSecrets={[
          {
            reference: 'lucis/production/application',
            secretManagerAccessId: 'secret-manager-access-id',
          },
        ]}
        secretSources={secretSources}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />
    )
    expect(screen.getByText('Add secret as JSON')).toBeInTheDocument()
    expect(screen.getByText('For identification only. Not used in your code.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Path')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Reference'), 'lucis/production/application')
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Display name'), 'Application credentials')
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Application credentials',
          reference: 'lucis/production/application',
          isJson: true,
          isFile: false,
          filePath: undefined,
        })
      )
    )
  })

  it('keeps the JSON edit form open if saving fails', async () => {
    const onClose = jest.fn()
    const onSubmit = jest.fn().mockRejectedValue(new Error('Could not save'))
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const { userEvent } = renderWithProviders(
      <AddSecretModal
        isJson
        jsonSecrets={[{ reference: 'lucis/app-updated', secretManagerAccessId: 'secret-manager-access-id' }]}
        mode="edit"
        initialSecret={{ name: 'lucis/app', reference: 'lucis/app' }}
        secretSources={secretSources}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    )
    await userEvent.type(screen.getByLabelText('Reference'), '-updated')
    await userEvent.click(screen.getByRole('button', { name: 'Edit secret' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onClose).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
  it('accepts a JSON reference without fetching its keys', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <AddSecretModal isJson secretSources={secretSources} onClose={jest.fn()} onSubmit={onSubmit} />
    )
    expect(screen.queryByText('Variables to import')).not.toBeInTheDocument()
    expect(screen.queryByText('No JSON detected')).not.toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Display name'))
    await userEvent.paste('My credentials')
    await userEvent.click(screen.getByLabelText('Reference'))
    await userEvent.paste('new/json/reference')
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My credentials',
          reference: 'new/json/reference',
          isJson: true,
        })
      )
    )
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('keys')
  })
  it.each(['', 'APP_'])('submits a JSON reference with optional prefix "%s"', async (prefix) => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <AddSecretModal isJson secretSources={secretSources} onClose={jest.fn()} onSubmit={onSubmit} />
    )
    expect(screen.getByLabelText('Key prefix (optional)')).toHaveValue('')
    await userEvent.click(screen.getByLabelText('Display name'))
    await userEvent.paste('Application credentials')
    await userEvent.click(screen.getByLabelText('Reference'))
    await userEvent.paste('lucis/app')
    await userEvent.click(screen.getByLabelText('Key prefix (optional)'))
    await userEvent.paste(prefix)
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          isJson: true,
          keyPrefix: prefix || undefined,
        })
      )
    )
  })

  it('restores and clears the JSON prefix when editing', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <AddSecretModal
        isJson
        mode="edit"
        initialSecret={{ name: 'Credentials', reference: 'lucis/app', keyPrefix: 'APP_' }}
        secretSources={secretSources}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />
    )
    expect(screen.getByLabelText('Key prefix (optional)')).toHaveValue('APP_')
    await userEvent.clear(screen.getByLabelText('Key prefix (optional)'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit secret' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ keyPrefix: undefined })))
  })
})
