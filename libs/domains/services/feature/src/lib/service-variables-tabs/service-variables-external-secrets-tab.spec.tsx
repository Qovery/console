import { useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { useCreateVariable, useDeleteVariable, useEditVariable, useVariables } from '@qovery/domains/variables/feature'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useService } from '../hooks/use-service/use-service'
import { ExternalSecretsTab } from './service-variables-external-secrets-tab'
import { useServiceVariablesTab } from './use-service-variables-tab'

jest.mock('@qovery/domains/variables/feature', () => ({
  ...jest.requireActual('@qovery/domains/variables/feature'),
  useVariables: jest.fn(),
  useCreateVariable: jest.fn(),
  useEditVariable: jest.fn(),
  useDeleteVariable: jest.fn(),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  useModal: jest.fn(),
  useModalConfirmation: jest.fn(),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
}))

jest.mock('../hooks/use-service/use-service', () => ({
  useService: jest.fn(),
}))

jest.mock('./use-service-variables-tab', () => ({
  useServiceVariablesTab: jest.fn(),
}))

describe('ExternalSecretsTab', () => {
  const useVariablesMock = useVariables as jest.MockedFunction<typeof useVariables>
  const useCreateVariableMock = useCreateVariable as jest.MockedFunction<typeof useCreateVariable>
  const useEditVariableMock = useEditVariable as jest.MockedFunction<typeof useEditVariable>
  const useDeleteVariableMock = useDeleteVariable as jest.MockedFunction<typeof useDeleteVariable>
  const useModalMock = useModal as jest.MockedFunction<typeof useModal>
  const useModalConfirmationMock = useModalConfirmation as jest.MockedFunction<typeof useModalConfirmation>
  const useServiceVariablesTabMock = useServiceVariablesTab as jest.MockedFunction<typeof useServiceVariablesTab>
  const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
  const useServiceMock = useService as jest.MockedFunction<typeof useService>

  beforeEach(() => {
    jest.clearAllMocks()
    useParamsMock.mockReturnValue({
      environmentId: 'environment-id',
      serviceId: 'service-id',
    })
    useServiceMock.mockReturnValue({
      data: { serviceType: 'APPLICATION' },
    } as ReturnType<typeof useService>)
    useServiceVariablesTabMock.mockReturnValue({
      secretManagers: [],
      hasClusterSecretManagerConfigured: false,
      redeployServiceAction: jest.fn(),
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
    useServiceVariablesTabMock.mockReturnValue({
      secretManagers: [
        {
          id: 'sm-1',
          name: 'Prod secret manager',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          endpoint: { mode: 'AWS_SECRETS_MANAGER' },
          authentication: { mode: 'STS' },
        },
      ],
      hasClusterSecretManagerConfigured: true,
      redeployServiceAction: jest.fn(),
    })

    renderWithProviders(<ExternalSecretsTab />)

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

    renderWithProviders(<ExternalSecretsTab />)

    expect(screen.getByText('No secret manager linked on your cluster')).toBeInTheDocument()
  })
})
