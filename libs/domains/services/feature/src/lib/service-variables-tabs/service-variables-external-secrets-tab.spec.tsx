import { type ReactNode } from 'react'
import { useDeleteVariable, useVariables } from '@qovery/domains/variables/feature'
import { useModalConfirmation } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ExternalSecretsTab } from './service-variables-external-secrets-tab'

jest.mock('@qovery/domains/variables/feature', () => ({
  ...jest.requireActual('@qovery/domains/variables/feature'),
  useVariables: jest.fn(),
  useDeleteVariable: jest.fn(),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  useModalConfirmation: jest.fn(),
}))

describe('ExternalSecretsTab', () => {
  const useVariablesMock = useVariables as jest.MockedFunction<typeof useVariables>
  const useDeleteVariableMock = useDeleteVariable as jest.MockedFunction<typeof useDeleteVariable>
  const useModalConfirmationMock = useModalConfirmation as jest.MockedFunction<typeof useModalConfirmation>

  beforeEach(() => {
    jest.clearAllMocks()
    useDeleteVariableMock.mockReturnValue({
      mutateAsync: jest.fn(),
    } as ReturnType<typeof useDeleteVariable>)
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

    renderWithProviders(
      <ExternalSecretsTab
        scope="APPLICATION"
        serviceId="service-id"
        secretManagers={[
          {
            id: 'sm-1',
            name: 'Prod secret manager',
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
            endpoint: { mode: 'AWS_SECRETS_MANAGER' },
            authentication: { mode: 'STS' },
          },
        ]}
        hasClusterSecretManagerConfigured
      />
    )

    expect(screen.getByText('1 external secret')).toBeInTheDocument()
    expect(screen.getByText('MY_EXTERNAL_SECRET')).toBeInTheDocument()
    expect(screen.getByText('prod/database/credentials')).toBeInTheDocument()
    expect(screen.getByText('Scope')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('Valid')).toBeInTheDocument()
    expect(screen.getByText('Prod secret manager')).toBeInTheDocument()
  })

  it('should render empty state when no secret manager is configured', () => {
    useVariablesMock.mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useVariables>)

    renderWithProviders(
      <ExternalSecretsTab scope="APPLICATION" serviceId="service-id" hasClusterSecretManagerConfigured={false} />
    )

    expect(screen.getByText('No secret manager linked on your cluster')).toBeInTheDocument()
  })
})
