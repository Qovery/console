import { useParams } from '@tanstack/react-router'
import { type ReactElement, type ReactNode } from 'react'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import * as utilHooks from '@qovery/shared/util-hooks'
import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useCreateVariable } from '../hooks/use-create-variable/use-create-variable'
import { useDeleteVariable } from '../hooks/use-delete-variable/use-delete-variable'
import { useEditVariable } from '../hooks/use-edit-variable/use-edit-variable'
import { useVariablesSecretManagers } from '../hooks/use-variables-secret-managers/use-variables-secret-managers'
import { useVariables } from '../hooks/use-variables/use-variables'
import { type AddSecretModalSubmitData } from './add-secret-modal/add-secret-modal'
import { createJsonSecretPreview } from './external-secret-json-preview'
import { ExternalSecretsTab } from './external-secrets-tab'

jest.mock('./external-secret-json-preview', () => ({ createJsonSecretPreview: jest.fn(() => []) }))

jest.mock('../hooks/use-variables/use-variables', () => ({
  useVariables: jest.fn(),
}))

jest.mock('../hooks/use-create-variable/use-create-variable', () => ({
  useCreateVariable: jest.fn(),
}))

jest.mock('../hooks/use-edit-variable/use-edit-variable', () => ({
  useEditVariable: jest.fn(),
}))

jest.mock('../hooks/use-delete-variable/use-delete-variable', () => ({
  useDeleteVariable: jest.fn(),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Tooltip: ({ children }: { children: ReactNode }) => children,
  useModal: jest.fn(),
  useModalConfirmation: jest.fn(),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  Link: ({
    to,
    params,
    children,
  }: {
    to: string
    params?: { organizationId?: string; clusterId?: string }
    children: ReactNode
  }) => {
    const href = to
      .replace('$organizationId', params?.organizationId ?? '')
      .replace('$clusterId', params?.clusterId ?? '')
    return <a href={href}>{children}</a>
  },
}))

jest.mock('../hooks/use-variables-secret-managers/use-variables-secret-managers', () => ({
  useVariablesSecretManagers: jest.fn(),
}))

describe('ExternalSecretsTab', () => {
  const useVariablesMock = useVariables as jest.MockedFunction<typeof useVariables>
  const useCreateVariableMock = useCreateVariable as jest.MockedFunction<typeof useCreateVariable>
  const useEditVariableMock = useEditVariable as jest.MockedFunction<typeof useEditVariable>
  const useDeleteVariableMock = useDeleteVariable as jest.MockedFunction<typeof useDeleteVariable>
  const useModalMock = useModal as jest.MockedFunction<typeof useModal>
  const useModalConfirmationMock = useModalConfirmation as jest.MockedFunction<typeof useModalConfirmation>
  const useVariablesSecretManagersMock = useVariablesSecretManagers as jest.MockedFunction<
    typeof useVariablesSecretManagers
  >
  const useParamsMock = useParams as jest.MockedFunction<typeof useParams>

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(createJsonSecretPreview).mockReturnValue([])
    useParamsMock.mockReturnValue({
      organizationId: 'organization-id',
      environmentId: 'environment-id',
      serviceId: 'service-id',
    })
    useVariablesSecretManagersMock.mockReturnValue({
      secretManagers: [],
      hasClusterSecretManagerConfigured: false,
      clusterId: 'cluster-id',
    })
    useCreateVariableMock.mockReturnValue({
      mutateAsync: jest.fn(),
    } as ReturnType<typeof useCreateVariable>)
    useEditVariableMock.mockReturnValue({
      mutateAsync: jest.fn(),
    } as ReturnType<typeof useEditVariable>)
    useDeleteVariableMock.mockReturnValue({
      mutateAsync: jest.fn(),
    } as ReturnType<typeof useDeleteVariable>)
    useModalMock.mockReturnValue({
      openModal: jest.fn(),
      closeModal: jest.fn(),
    })
    useModalConfirmationMock.mockReturnValue({
      openModalConfirmation: jest.fn(),
    })
  })

  it('should render the external secrets table layout from the worktree', () => {
    useVariablesMock.mockReturnValue({
      data: [
        {
          id: 'secret-1',
          key: 'MY_EXTERNAL_SECRET',
          value: 'prod/database/credentials',
          scope: 'APPLICATION',
          variable_type: 'EXTERNAL_SECRET',
          secret_manager_access_id: 'sm-1',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useVariables>)
    useVariablesSecretManagersMock.mockReturnValue({
      secretManagers: [
        {
          id: 'sm-1',
          name: 'Prod secret manager',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          endpoint: { mode: 'AWS_SECRET_MANAGER' },
          authentication: { mode: 'STS' },
        },
      ],
      hasClusterSecretManagerConfigured: true,
      clusterId: 'cluster-id',
    })

    renderWithProviders(<ExternalSecretsTab scope="APPLICATION" parentId="service-id" />)

    expect(screen.getByText('1 external secret')).toBeInTheDocument()
    expect(screen.getByText('MY_EXTERNAL_SECRET')).toBeInTheDocument()
    expect(screen.getByText('prod/database/credentials')).toBeInTheDocument()
    expect(screen.getByText('Scope')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('Prod secret manager')).toBeInTheDocument()
    expect(screen.queryByText('Status')).not.toBeInTheDocument()
  })

  it('should render file external secrets in the external secrets table', () => {
    useVariablesMock.mockReturnValue({
      data: [
        {
          id: 'secret-file-1',
          key: 'MY_EXTERNAL_SECRET_FILE',
          value: 'prod/database/credentials-file',
          scope: 'APPLICATION',
          variable_type: 'EXTERNAL_SECRET',
          mount_path: '/vault/secrets/credentials',
          secret_manager_access_id: 'sm-1',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useVariables>)
    useVariablesSecretManagersMock.mockReturnValue({
      secretManagers: [
        {
          id: 'sm-1',
          name: 'Prod secret manager',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          endpoint: { mode: 'AWS_SECRET_MANAGER' },
          authentication: { mode: 'STS' },
        },
      ],
      hasClusterSecretManagerConfigured: true,
      clusterId: 'cluster-id',
    })

    renderWithProviders(<ExternalSecretsTab scope="APPLICATION" parentId="service-id" />)

    expect(screen.getByText('MY_EXTERNAL_SECRET_FILE')).toBeInTheDocument()
    expect(screen.getByText('prod/database/credentials-file')).toBeInTheDocument()
  })

  it('should keep mount path when editing an external secret file', async () => {
    const editVariable = jest.fn()
    const openModal = jest.fn()
    const onEditSecret = jest.fn()
    useEditVariableMock.mockReturnValue({
      mutateAsync: editVariable,
    } as unknown as ReturnType<typeof useEditVariable>)
    useModalMock.mockReturnValue({
      openModal,
      closeModal: jest.fn(),
    })
    useVariablesMock.mockReturnValue({
      data: [
        {
          id: 'secret-file-1',
          key: 'MY_EXTERNAL_SECRET_FILE',
          value: 'prod/database/credentials-file',
          scope: 'APPLICATION',
          variable_type: 'EXTERNAL_SECRET',
          mount_path: '/vault/secrets/credentials',
          secret_manager_access_id: 'sm-1',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useVariables>)
    useVariablesSecretManagersMock.mockReturnValue({
      secretManagers: [
        {
          id: 'sm-1',
          name: 'Prod secret manager',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          endpoint: { mode: 'AWS_SECRET_MANAGER' },
          authentication: { mode: 'STS' },
        },
      ],
      hasClusterSecretManagerConfigured: true,
      clusterId: 'cluster-id',
    })

    const { userEvent } = renderWithProviders(
      <ExternalSecretsTab scope="APPLICATION" parentId="service-id" onEditSecret={onEditSecret} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

    const modalContent = openModal.mock.calls[0][0].content as ReactElement<{
      initialSecret: { filePath?: string }
      isFile?: boolean
      onSubmit: (secret: AddSecretModalSubmitData) => Promise<void>
    }>

    expect(modalContent.props.isFile).toBe(true)
    expect(modalContent.props.initialSecret.filePath).toBe('/vault/secrets/credentials')

    await modalContent.props.onSubmit({
      name: 'MY_EXTERNAL_SECRET_FILE',
      reference: 'prod/database/credentials-file',
      filePath: '/vault/secrets/updated-credentials',
      isFile: true,
      secretManagerAccessId: 'sm-1',
    })

    expect(editVariable).toHaveBeenCalledWith({
      variableId: 'secret-file-1',
      variableEditRequest: {
        key: 'MY_EXTERNAL_SECRET_FILE',
        value: 'prod/database/credentials-file',
        mount_path: '/vault/secrets/updated-credentials',
        description: null,
        secret_manager_access_id: 'sm-1',
      },
    })
    expect(onEditSecret).toHaveBeenCalled()
  })

  it('should call create callback after creating an external secret', async () => {
    const createVariable = jest.fn()
    const openModal = jest.fn()
    const onCreateSecret = jest.fn()
    useCreateVariableMock.mockReturnValue({
      mutateAsync: createVariable,
    } as unknown as ReturnType<typeof useCreateVariable>)
    useModalMock.mockReturnValue({
      openModal,
      closeModal: jest.fn(),
    })
    useVariablesMock.mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useVariables>)
    useVariablesSecretManagersMock.mockReturnValue({
      secretManagers: [
        {
          id: 'sm-1',
          name: 'Prod secret manager',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          endpoint: { mode: 'AWS_SECRET_MANAGER' },
          authentication: { mode: 'STS' },
        },
      ],
      hasClusterSecretManagerConfigured: true,
      clusterId: 'cluster-id',
    })

    const { userEvent } = renderWithProviders(
      <ExternalSecretsTab scope="APPLICATION" parentId="service-id" onCreateSecret={onCreateSecret} />
    )

    await userEvent.click(screen.getByRole('button', { name: /add secret/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Add secret as variable' }))

    const modalContent = openModal.mock.calls[0][0].content as ReactElement<{
      scope?: string
      onSubmit: (secret: AddSecretModalSubmitData) => Promise<void>
      isFile?: boolean
    }>

    expect(modalContent.props.scope).toBe('APPLICATION')
    expect(modalContent.props.isFile).toBe(false)

    await modalContent.props.onSubmit({
      name: 'MY_EXTERNAL_SECRET',
      reference: 'prod/database/credentials',
      isFile: false,
      secretManagerAccessId: 'sm-1',
    })

    expect(createVariable).toHaveBeenCalledWith({
      variableRequest: {
        key: 'MY_EXTERNAL_SECRET',
        value: 'prod/database/credentials',
        mount_path: null,
        is_secret: false,
        variable_scope: 'APPLICATION',
        variable_parent_id: 'service-id',
        description: null,
        secret_manager_access_id: 'sm-1',
      },
    })
    expect(onCreateSecret).toHaveBeenCalled()
  })

  it('should pass the scope when creating an environment-scoped external secret', async () => {
    const openModal = jest.fn()
    useModalMock.mockReturnValue({
      openModal,
      closeModal: jest.fn(),
    })
    useVariablesMock.mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useVariables>)
    useVariablesSecretManagersMock.mockReturnValue({
      secretManagers: [
        {
          id: 'sm-1',
          name: 'Prod secret manager',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          endpoint: { mode: 'AWS_SECRET_MANAGER' },
          authentication: { mode: 'STS' },
        },
      ],
      hasClusterSecretManagerConfigured: true,
      clusterId: 'cluster-id',
    })

    const { userEvent } = renderWithProviders(<ExternalSecretsTab scope="ENVIRONMENT" parentId="environment-id" />)

    await userEvent.click(screen.getByRole('button', { name: /add secret/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Add secret as variable' }))

    const modalContent = openModal.mock.calls[0][0].content as ReactElement<{
      scope?: string
      isFile?: boolean
    }>

    expect(modalContent.props.scope).toBe('ENVIRONMENT')
    expect(modalContent.props.isFile).toBe(false)
  })

  it('should open the file secret creation modal from the empty state dropdown', async () => {
    const openModal = jest.fn()
    useModalMock.mockReturnValue({
      openModal,
      closeModal: jest.fn(),
    })
    useVariablesMock.mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useVariables>)
    useVariablesSecretManagersMock.mockReturnValue({
      secretManagers: [
        {
          id: 'sm-1',
          name: 'Prod secret manager',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          endpoint: { mode: 'AWS_SECRET_MANAGER' },
          authentication: { mode: 'STS' },
        },
      ],
      hasClusterSecretManagerConfigured: true,
      clusterId: 'cluster-id',
    })

    const { userEvent } = renderWithProviders(<ExternalSecretsTab scope="APPLICATION" parentId="service-id" />)

    await userEvent.click(screen.getByRole('button', { name: /add secret/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Add secret as file' }))

    const modalContent = openModal.mock.calls[0][0].content as ReactElement<{
      isFile?: boolean
    }>

    expect(modalContent.props.isFile).toBe(true)
  })

  it('should call delete callback after deleting an external secret', async () => {
    const deleteVariable = jest.fn()
    const openModalConfirmation = jest.fn()
    const onDeleteSecret = jest.fn()
    useDeleteVariableMock.mockReturnValue({
      mutateAsync: deleteVariable,
    } as unknown as ReturnType<typeof useDeleteVariable>)
    useModalConfirmationMock.mockReturnValue({
      openModalConfirmation,
    })
    useVariablesMock.mockReturnValue({
      data: [
        {
          id: 'secret-1',
          key: 'MY_EXTERNAL_SECRET',
          value: 'prod/database/credentials',
          scope: 'APPLICATION',
          variable_type: 'EXTERNAL_SECRET',
          secret_manager_access_id: 'sm-1',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useVariables>)
    useVariablesSecretManagersMock.mockReturnValue({
      secretManagers: [
        {
          id: 'sm-1',
          name: 'Prod secret manager',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          endpoint: { mode: 'AWS_SECRET_MANAGER' },
          authentication: { mode: 'STS' },
        },
      ],
      hasClusterSecretManagerConfigured: true,
      clusterId: 'cluster-id',
    })

    const { userEvent } = renderWithProviders(
      <ExternalSecretsTab scope="APPLICATION" parentId="service-id" onDeleteSecret={onDeleteSecret} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await openModalConfirmation.mock.calls[0][0].action()

    expect(deleteVariable).toHaveBeenCalledWith({ variableId: 'secret-1' })
    expect(onDeleteSecret).toHaveBeenCalled()
  })

  it('should fetch environment-scoped external secrets when scope is ENVIRONMENT', () => {
    useVariablesMock.mockReturnValue({
      data: [
        {
          id: 'env-secret-1',
          key: 'ENV_EXTERNAL_SECRET',
          value: 'staging/shared/credentials',
          scope: 'ENVIRONMENT',
          variable_type: 'EXTERNAL_SECRET',
          secret_manager_access_id: 'sm-1',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useVariables>)
    useVariablesSecretManagersMock.mockReturnValue({
      secretManagers: [
        {
          id: 'sm-1',
          name: 'Prod secret manager',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          endpoint: { mode: 'AWS_SECRET_MANAGER' },
          authentication: { mode: 'STS' },
        },
      ],
      hasClusterSecretManagerConfigured: true,
      clusterId: 'cluster-id',
    })

    renderWithProviders(<ExternalSecretsTab scope="ENVIRONMENT" parentId="environment-id" />)

    expect(useVariablesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parentId: 'environment-id',
        scope: 'ENVIRONMENT',
      })
    )
    expect(screen.getByText('ENV_EXTERNAL_SECRET')).toBeInTheDocument()
  })

  it('should render empty state when no secret manager is configured', () => {
    useVariablesMock.mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useVariables>)

    renderWithProviders(<ExternalSecretsTab scope="APPLICATION" parentId="service-id" />)

    expect(screen.getByText('No secret manager linked on your cluster')).toBeInTheDocument()

    const clusterSettingsLink = screen.getByRole('link', { name: /cluster settings/i })
    expect(clusterSettingsLink).toHaveAttribute(
      'href',
      '/organization/organization-id/cluster/cluster-id/settings/addons'
    )
  })
  it('shows JSON keys under the reference and supports collapsing without exposing values', async () => {
    jest.mocked(createJsonSecretPreview).mockReturnValue([
      {
        id: 'local-json-example',
        name: 'Application credentials',
        reference: 'lucis/app',
        isJson: true,
        keys: ['DATABASE_URL', 'API_KEY'],
        source: 'Example manager',
        scope: 'Environment',
        previewParentId: 'environment-id',
      },
    ])
    useVariablesMock.mockReturnValue({ data: [] } as unknown as ReturnType<typeof useVariables>)
    const { userEvent } = renderWithProviders(<ExternalSecretsTab scope="ENVIRONMENT" parentId="environment-id" />)
    expect(screen.getByText('Application credentials')).toBeInTheDocument()
    expect(screen.getByText('DATABASE_URL')).toBeInTheDocument()
    expect(screen.getByText('API_KEY')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Application credentials'))
    expect(screen.queryByText('DATABASE_URL')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Expand keys for lucis/app' })).not.toBeInTheDocument()
    screen.getByRole('cell', { name: 'Expand keys for lucis/app' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByText('DATABASE_URL')).toBeInTheDocument()
    const copyKey = jest.fn()
    const copyHook = jest.spyOn(utilHooks, 'useCopyToClipboard').mockReturnValue([null, copyKey])
    await userEvent.click(screen.getByText('Application credentials'))
    await userEvent.click(screen.getByText('Application credentials'))
    await userEvent.click(screen.getByRole('button', { name: 'Copy DATABASE_URL' }))
    expect(copyKey).toHaveBeenCalledWith('DATABASE_URL')
    expect(screen.getByText('Copied')).toBeInTheDocument()
    expect(screen.getByText('API_KEY')).toBeInTheDocument()
    copyHook.mockRestore()
  })

  it('counts imported keys and searches inside collapsed JSON secrets', async () => {
    jest.mocked(createJsonSecretPreview).mockReturnValue([
      {
        id: 'json',
        name: 'Application credentials',
        reference: 'lucis/app',
        isJson: true,
        keys: ['DATABASE_URL', 'API_KEY'],
        source: 'Example manager',
        scope: 'Environment',
        previewParentId: 'environment-id',
      },
    ])
    useVariablesMock.mockReturnValue({
      data: [
        {
          id: 'regular',
          key: 'PASSWORD',
          value: 'lucis/password',
          scope: 'ENVIRONMENT',
          variable_type: 'EXTERNAL_SECRET',
        },
      ],
    } as unknown as ReturnType<typeof useVariables>)
    const { userEvent } = renderWithProviders(<ExternalSecretsTab scope="ENVIRONMENT" parentId="environment-id" />)
    expect(screen.getByText('3 external secrets')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Application credentials'))
    expect(screen.queryByText('API_KEY')).not.toBeInTheDocument()
    await userEvent.click(screen.getByPlaceholderText('Search secrets'))
    await userEvent.paste('api_key')
    expect(screen.getByText('Application credentials')).toBeInTheDocument()
    expect(screen.getByText('API_KEY')).toBeInTheDocument()
    expect(screen.queryByText('DATABASE_URL')).not.toBeInTheDocument()
    expect(screen.queryByText('PASSWORD')).not.toBeInTheDocument()
    expect(screen.getByText('1/3 external secrets')).toBeInTheDocument()
    await userEvent.clear(screen.getByPlaceholderText('Search secrets'))
    expect(screen.getByText('DATABASE_URL')).toBeInTheDocument()
    expect(screen.getByText('API_KEY')).toBeInTheDocument()
    await userEvent.click(screen.getByPlaceholderText('Search secrets'))
    await userEvent.paste('Application credentials')
    expect(screen.getByText('Application credentials')).toBeInTheDocument()
    expect(screen.getByText('No keys match your search.')).toBeInTheDocument()
    expect(screen.getByText('0/3 external secrets')).toBeInTheDocument()
    expect(screen.queryByText('DATABASE_URL')).not.toBeInTheDocument()
    expect(screen.queryByText('API_KEY')).not.toBeInTheDocument()
    await userEvent.clear(screen.getByPlaceholderText('Search secrets'))
    await userEvent.click(screen.getByPlaceholderText('Search secrets'))
    await userEvent.paste('lucis')
    expect(screen.getByText('Application credentials')).toBeInTheDocument()
    expect(screen.getByText('PASSWORD')).toBeInTheDocument()
    expect(screen.getByText('1/3 external secrets')).toBeInTheDocument()
    await userEvent.clear(screen.getByPlaceholderText('Search secrets'))
    await userEvent.click(screen.getByPlaceholderText('Search secrets'))
    await userEvent.paste('no-match')
    expect(screen.getByText('0/3 external secrets')).toBeInTheDocument()
    expect(screen.getByText('No secrets match your search or filters.')).toBeInTheDocument()
    await userEvent.clear(screen.getByPlaceholderText('Search secrets'))
    expect(screen.getByText('3 external secrets')).toBeInTheDocument()
  })

  it('creates, edits and deletes JSON previews without calling the variable API', async () => {
    const createVariable = jest.fn()
    const editVariable = jest.fn()
    const deleteVariable = jest.fn()
    const openModal = jest.fn()
    const openModalConfirmation = jest.fn()
    useCreateVariableMock.mockReturnValue({ mutateAsync: createVariable } as unknown as ReturnType<
      typeof useCreateVariable
    >)
    useEditVariableMock.mockReturnValue({ mutateAsync: editVariable } as unknown as ReturnType<typeof useEditVariable>)
    useDeleteVariableMock.mockReturnValue({ mutateAsync: deleteVariable } as unknown as ReturnType<
      typeof useDeleteVariable
    >)
    useModalMock.mockReturnValue({ openModal, closeModal: jest.fn() })
    useModalConfirmationMock.mockReturnValue({ openModalConfirmation })
    useVariablesMock.mockReturnValue({ data: [] } as unknown as ReturnType<typeof useVariables>)
    useVariablesSecretManagersMock.mockReturnValue({
      secretManagers: [],
      hasClusterSecretManagerConfigured: true,
      clusterId: 'cluster-id',
    })
    const { userEvent } = renderWithProviders(<ExternalSecretsTab scope="APPLICATION" parentId="service-id" />)
    await userEvent.click(screen.getByRole('button', { name: 'Add secret' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Add secret as JSON' }))
    const modal = openModal.mock.calls[0][0].content as ReactElement<{
      isJson: boolean
      onSubmit: (data: AddSecretModalSubmitData) => Promise<void>
    }>
    expect(modal.props.isJson).toBe(true)
    const data = {
      name: 'Application credentials',
      reference: 'lucis/app',
      isJson: true,
      isFile: false,
      secretManagerAccessId: 'manager-id',
    }
    await act(async () => modal.props.onSubmit(data))
    expect(screen.getByText('lucis/app')).toBeInTheDocument()
    expect(screen.getByText(/Keys are not available yet/)).toBeInTheDocument()
    expect(screen.getByText('0 external secrets · 1 JSON count unavailable')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const editModal = openModal.mock.calls[1][0].content as typeof modal
    expect(editModal.props.isJson).toBe(true)
    await act(async () =>
      editModal.props.onSubmit({ ...data, name: 'Updated credentials', reference: 'lucis/updated' })
    )
    expect(screen.getByText('lucis/updated')).toBeInTheDocument()
    expect(screen.getByText('Updated credentials')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await act(async () => openModalConfirmation.mock.calls[0][0].action())
    expect(screen.queryByText('lucis/updated')).not.toBeInTheDocument()
    expect(createVariable).not.toHaveBeenCalled()
    expect(editVariable).not.toHaveBeenCalled()
    expect(deleteVariable).not.toHaveBeenCalled()
  })
})
