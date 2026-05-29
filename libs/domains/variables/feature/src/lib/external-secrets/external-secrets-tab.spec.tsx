import { useParams } from '@tanstack/react-router'
import { type ReactElement, type ReactNode } from 'react'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type AddSecretModalSubmitData } from './add-secret-modal/add-secret-modal'
import { useCreateVariable } from '../hooks/use-create-variable/use-create-variable'
import { useDeleteVariable } from '../hooks/use-delete-variable/use-delete-variable'
import { useEditVariable } from '../hooks/use-edit-variable/use-edit-variable'
import { useVariables } from '../hooks/use-variables/use-variables'
import { ExternalSecretsTab } from './external-secrets-tab'
import { useVariablesSecretManagers } from './use-variables-secret-managers'

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

jest.mock('./use-variables-secret-managers', () => ({
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

    const { userEvent } = renderWithProviders(<ExternalSecretsTab scope="APPLICATION" parentId="service-id" />)

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
})
