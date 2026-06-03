import { useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ReactNode } from 'react'
import { VariableList, useVariables, useVariablesSecretManagers } from '@qovery/domains/variables/feature'
import { useModal } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useRedeployServiceAction } from '../hooks/use-redeploy-service-action/use-redeploy-service-action'
import { useService } from '../hooks/use-service/use-service'
import { ServiceVariablesCustomTab } from './service-variables-custom-tab'

jest.mock('@qovery/domains/variables/feature', () => ({
  ...jest.requireActual('@qovery/domains/variables/feature'),
  useVariables: jest.fn(),
  useVariablesSecretManagers: jest.fn(),
  VariableList: jest.fn(() => <div data-testid="variable-list" />),
  CreateUpdateVariableModal: () => <div />,
  ImportEnvironmentVariableModalFeature: () => <div />,
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Tooltip: ({ children }: { children: ReactNode }) => children,
  useModal: jest.fn(),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
}))

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(),
}))

jest.mock('../hooks/use-service/use-service', () => ({
  useService: jest.fn(),
}))

jest.mock('../hooks/use-redeploy-service-action/use-redeploy-service-action', () => ({
  useRedeployServiceAction: jest.fn(),
}))

describe('ServiceVariablesCustomTab', () => {
  const useVariablesMock = useVariables as jest.MockedFunction<typeof useVariables>
  const useVariablesSecretManagersMock = useVariablesSecretManagers as jest.MockedFunction<
    typeof useVariablesSecretManagers
  >
  const useModalMock = useModal as jest.MockedFunction<typeof useModal>
  const variableListMock = VariableList as jest.MockedFunction<typeof VariableList>
  const useRedeployServiceActionMock = useRedeployServiceAction as jest.MockedFunction<typeof useRedeployServiceAction>
  const useFeatureFlagEnabledMock = useFeatureFlagEnabled as jest.MockedFunction<typeof useFeatureFlagEnabled>
  const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
  const useServiceMock = useService as jest.MockedFunction<typeof useService>

  beforeEach(() => {
    jest.clearAllMocks()
    useParamsMock.mockReturnValue({
      organizationId: 'org-id',
      projectId: 'project-id',
      environmentId: 'environment-id',
      serviceId: 'service-id',
    })
    useServiceMock.mockReturnValue({
      data: { serviceType: 'APPLICATION' },
    } as ReturnType<typeof useService>)
    useFeatureFlagEnabledMock.mockReturnValue(false)
    useVariablesSecretManagersMock.mockReturnValue({
      secretManagers: [],
      hasClusterSecretManagerConfigured: false,
      clusterId: '',
    } as ReturnType<typeof useVariablesSecretManagers>)
    useRedeployServiceActionMock.mockReturnValue(jest.fn())
    useModalMock.mockReturnValue({
      openModal: jest.fn(),
      closeModal: jest.fn(),
    })
  })

  it('should render custom empty state when there are no custom variables', () => {
    useVariablesMock.mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useVariables>)

    renderWithProviders(<ServiceVariablesCustomTab />)

    expect(screen.getByText('No custom variables added yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add variable/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import variables/i })).toBeInTheDocument()
    expect(variableListMock).not.toHaveBeenCalled()
  })

  it('should render variable list when at least one custom variable exists', () => {
    useVariablesMock.mockReturnValue({
      data: [{ id: 'var-1', scope: 'APPLICATION' }],
      isLoading: false,
    } as ReturnType<typeof useVariables>)

    renderWithProviders(<ServiceVariablesCustomTab />)

    expect(variableListMock).toHaveBeenCalled()
    expect(screen.queryByText('No custom variables added yet')).not.toBeInTheDocument()
  })

  it('should keep import from .env available when custom variables exist', () => {
    useVariablesMock.mockReturnValue({
      data: [{ id: 'var-1', scope: 'APPLICATION' }],
      isLoading: false,
    } as ReturnType<typeof useVariables>)

    renderWithProviders(<ServiceVariablesCustomTab />)

    const headerActions = variableListMock.mock.calls[0][0].headerActions

    expect(headerActions).toMatchObject({
      props: expect.objectContaining({
        importEnvFileAccess: 'dropdown',
        onImportEnvFile: expect.any(Function),
      }),
    })
  })
})
