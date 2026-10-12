import { type ComponentProps } from 'react'
import { useSecretManagerProviderSecrets } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { AddSecretModal, type SecretSourceOption } from './add-secret-modal'

jest.mock('@qovery/domains/clusters/feature', () => ({
  ...jest.requireActual('@qovery/domains/clusters/feature'),
  useSecretManagerProviderSecrets: jest.fn(),
}))

describe('AddSecretModal', () => {
  const useSecretManagerProviderSecretsMock = jest.mocked(useSecretManagerProviderSecrets)
  const secretSources: SecretSourceOption[] = [
    {
      value: 'secret-manager-access-id',
      label: 'Prod secret manager',
      tableLabel: 'Prod secret manager',
      icon: 'aws',
    },
  ]

  function renderModal(props: Partial<ComponentProps<typeof AddSecretModal>> = {}) {
    return renderWithProviders(
      <AddSecretModal secretSources={secretSources} onClose={jest.fn()} onSubmit={jest.fn()} {...props} />
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useSecretManagerProviderSecretsMock.mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: false,
    } as ReturnType<typeof useSecretManagerProviderSecrets>)
  })

  it('does not retry provider secret requests', () => {
    renderModal()
    expect(useSecretManagerProviderSecretsMock).toHaveBeenCalledWith(expect.objectContaining({ retry: false }))
  })

  it('imports the whole secret by default when provider listing fails', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderModal({ onSubmit })
    expect(screen.getByRole('checkbox', { name: 'JSON source' })).not.toBeChecked()
    expect(screen.queryByLabelText('JSON property path')).not.toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Reference'), 'custom/path/db-password')
    await userEvent.type(screen.getByLabelText('Secret name'), 'DATABASE_PASSWORD')
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'DATABASE_PASSWORD',
        description: undefined,
        filePath: undefined,
        isFile: false,
        reference: 'custom/path/db-password',
        secretManagerAccessId: 'secret-manager-access-id',
      })
    )
  })

  it('requires acknowledgement for environment-level external secrets', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderModal({ scope: 'ENVIRONMENT', onSubmit })
    await userEvent.type(screen.getByLabelText('Reference'), 'production/config')
    await userEvent.type(screen.getByLabelText('Secret name'), 'APP_PASSWORD')
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox', { name: /I understand the secret can be fetched/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'APP_PASSWORD' })))
  })

  it('does not show validation errors on untouched fields when toggling JSON source', async () => {
    const { userEvent } = renderModal()
    const jsonSource = screen.getByRole('checkbox', { name: 'JSON source' })

    await userEvent.click(jsonSource)
    expect(screen.getByLabelText('JSON property path')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled())
    expect(screen.queryByText('Please enter a secret name.')).not.toBeInTheDocument()
    expect(screen.queryByText('Please enter a JSON property path.')).not.toBeInTheDocument()

    await userEvent.click(jsonSource)
    await userEvent.click(jsonSource)
    expect(screen.queryByText('Please enter a secret name.')).not.toBeInTheDocument()
    expect(screen.queryByText('Please enter a JSON property path.')).not.toBeInTheDocument()
  })

  it('revalidates a populated secret name when toggling JSON source', async () => {
    const { userEvent } = renderModal()
    await userEvent.type(screen.getByLabelText('Reference'), 'production/config')
    await userEvent.type(screen.getByLabelText('Secret name'), 'APP-PASSWORD')
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeEnabled()

    await userEvent.click(screen.getByRole('checkbox', { name: 'JSON source' }))
    expect(
      screen.getByText(
        'Variable name must start with a letter or underscore, and contain only letters, numbers, and underscores.'
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled()

    await userEvent.click(screen.getByRole('checkbox', { name: 'JSON source' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add secret' })).toBeEnabled())
    expect(
      screen.queryByText(
        'Variable name must start with a letter or underscore, and contain only letters, numbers, and underscores.'
      )
    ).not.toBeInTheDocument()
  })

  it('reveals the JSON selector in the standard secret form and requires it when checked', async () => {
    const { userEvent } = renderModal()
    await userEvent.type(screen.getByLabelText('Reference'), 'production/config')
    await userEvent.type(screen.getByLabelText('Secret name'), 'APP_PASSWORD')
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeEnabled()
    await userEvent.click(screen.getByRole('checkbox', { name: 'JSON source' }))
    expect(screen.getByLabelText('JSON property path')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled())
    await userEvent.type(screen.getByLabelText('JSON property path'), 'accounts.0.password')
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeEnabled()
    expect(screen.getByLabelText('Secret name')).toHaveValue('APP_PASSWORD')
  })

  it.each([
    ['accounts.0.password', 'accounts_0_password'],
    [String.raw`database\.password`, 'database__password'],
    ['0.password', '_0_password'],
  ])('suggests a valid name for %s and preserves the selector', async (keyName, name) => {
    const onSubmit = jest.fn()
    const { userEvent } = renderModal({ onSubmit })
    await userEvent.type(screen.getByLabelText('Reference'), 'production/config')
    await userEvent.click(screen.getByRole('checkbox', { name: 'JSON source' }))
    await userEvent.type(screen.getByLabelText('JSON property path'), keyName)
    expect(screen.getByLabelText('Secret name')).toHaveValue(name)
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name, keyName, isJson: true })))
  })

  it('preserves a custom name entered before enabling JSON selection', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderModal({ onSubmit })
    await userEvent.type(screen.getByLabelText('Reference'), 'production/config')
    await userEvent.type(screen.getByLabelText('Secret name'), 'APP_PASSWORD')
    await userEvent.click(screen.getByRole('checkbox', { name: 'JSON source' }))
    await userEvent.type(screen.getByLabelText('JSON property path'), 'accounts.0.password')
    expect(screen.getByLabelText('Secret name')).toHaveValue('APP_PASSWORD')
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'APP_PASSWORD',
          keyName: 'accounts.0.password',
          isJson: true,
        })
      )
    )
  })

  it.each(['accounts.0.password', 'APP-PASSWORD', 'APP PASSWORD', '0PASSWORD'])(
    'rejects the invalid custom JSON variable name %s',
    async (name) => {
      const onSubmit = jest.fn()
      const { userEvent } = renderModal({ onSubmit })
      await userEvent.type(screen.getByLabelText('Reference'), 'production/config')
      await userEvent.click(screen.getByRole('checkbox', { name: 'JSON source' }))
      await userEvent.type(screen.getByLabelText('JSON property path'), 'password')
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

  it.each(['JSON property path', 'Secret name'])('requires a nonblank %s in JSON mode', async (label) => {
    const onSubmit = jest.fn()
    const { userEvent } = renderModal({ onSubmit })
    await userEvent.type(screen.getByLabelText('Reference'), 'production/config')
    await userEvent.click(screen.getByRole('checkbox', { name: 'JSON source' }))
    await userEvent.type(screen.getByLabelText('JSON property path'), 'password')
    await userEvent.clear(screen.getByLabelText(label))
    await userEvent.type(screen.getByLabelText(label), '   ')
    expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('allows whole-secret submission after disabling JSON with an empty selector', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderModal({ onSubmit })
    await userEvent.type(screen.getByLabelText('Reference'), 'production/config')
    await userEvent.type(screen.getByLabelText('Secret name'), 'APP_PASSWORD')
    await userEvent.click(screen.getByRole('checkbox', { name: 'JSON source' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled())
    await userEvent.click(screen.getByRole('checkbox', { name: 'JSON source' }))
    expect(screen.queryByLabelText('JSON property path')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add secret' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('keyName')
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('isJson')
  })

  it('restores the saved selector and clears it when JSON source is unchecked', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderModal({
      mode: 'edit',
      onSubmit,
      initialSecret: { name: 'APP_PASSWORD', keyName: 'accounts.0.password', reference: 'production/config' },
    })
    expect(screen.getByRole('checkbox', { name: 'JSON source' })).toBeChecked()
    expect(screen.getByLabelText('JSON property path')).toHaveValue('accounts.0.password')
    await userEvent.click(screen.getByRole('checkbox', { name: 'JSON source' }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit secret' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'APP_PASSWORD' })))
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('keyName')
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('isJson')
  })

  it('keeps JSON selection unavailable for mounted files', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderModal({
      isFile: true,
      onSubmit,
      initialSecret: {
        name: 'APP_CONFIG',
        reference: 'production/config',
        filePath: '/vault/config',
        keyName: 'password',
      },
    })
    expect(screen.queryByRole('checkbox', { name: 'JSON source' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('JSON property path')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add secret' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ isFile: true, filePath: '/vault/config' }))
    )
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('isJson')
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('keyName')
  })

  it('preserves the saved name when editing a selector and allows retry after a local failure', async () => {
    const onClose = jest.fn()
    const onSubmit = jest.fn().mockRejectedValueOnce(new Error('Could not save'))
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      const { userEvent } = renderModal({
        mode: 'edit',
        onClose,
        onSubmit,
        initialSecret: { name: 'APP_PASSWORD', keyName: 'password', reference: 'production/config' },
      })
      await userEvent.type(screen.getByLabelText('JSON property path'), '_new')
      expect(screen.getByLabelText('Secret name')).toHaveValue('APP_PASSWORD')
      await userEvent.click(screen.getByRole('button', { name: 'Edit secret' }))
      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not save'))
      expect(onClose).not.toHaveBeenCalled()
      onSubmit.mockResolvedValueOnce(undefined)
      await userEvent.click(screen.getByRole('button', { name: 'Edit secret' }))
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
      expect(onSubmit).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: 'APP_PASSWORD', keyName: 'password_new' })
      )
    } finally {
      consoleError.mockRestore()
    }
  })

  it('shows the selector documentation when JSON source is checked', async () => {
    const { userEvent } = renderModal()
    expect(screen.queryByRole('link', { name: 'JSON selection syntax' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('checkbox', { name: 'JSON source' }))
    expect(screen.getByRole('link', { name: 'JSON selection syntax' })).toHaveAttribute(
      'href',
      'https://www.qovery.com/docs/configuration/integrations/secret-managers/secret-manager-access#selecting-a-value-from-a-json-secret'
    )
  })

  it('does not infer the JSON selector from a selected remote reference', async () => {
    useSecretManagerProviderSecretsMock.mockReturnValue({
      data: { results: ['production/app'] },
      isError: false,
      isFetching: false,
    } as ReturnType<typeof useSecretManagerProviderSecrets>)
    const { userEvent } = renderModal()
    await userEvent.click(screen.getByLabelText('Reference'))
    await userEvent.click(screen.getByText('production/app'))
    await userEvent.click(screen.getByRole('checkbox', { name: 'JSON source' }))
    expect(screen.getByLabelText('JSON property path')).toHaveValue('')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add secret' })).toBeDisabled())
  })
})
