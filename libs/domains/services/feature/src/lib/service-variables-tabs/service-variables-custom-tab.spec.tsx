import { useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { VariableList, useVariables } from '@qovery/domains/variables/feature'
import { useModal } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useService } from '../hooks/use-service/use-service'
import { CustomTab } from './service-variables-custom-tab'
import { useServiceVariablesTab } from './use-service-variables-tab'

jest.mock('@qovery/domains/variables/feature', () => ({
  ...jest.requireActual('@qovery/domains/variables/feature'),
  useVariables: jest.fn(),
  VariableList: jest.fn(() => <div data-testid="variable-list" />),
  CreateUpdateVariableModal: () => <div />,
  ImportEnvironmentVariableModalFeature: () => <div />,
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  useModal: jest.fn(),
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

describe('CustomTab', () => {
  const useVariablesMock = useVariables as jest.MockedFunction<typeof useVariables>
  const useModalMock = useModal as jest.MockedFunction<typeof useModal>
  const variableListMock = VariableList as jest.MockedFunction<typeof VariableList>
  const useServiceVariablesTabMock = useServiceVariablesTab as jest.MockedFunction<typeof useServiceVariablesTab>
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
    useServiceVariablesTabMock.mockReturnValue({
      secretManagers: [],
      hasClusterSecretManagerConfigured: false,
      redeployServiceAction: jest.fn(),
    })
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

    renderWithProviders(<CustomTab />)

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

    renderWithProviders(<CustomTab />)

    expect(variableListMock).toHaveBeenCalled()
    expect(screen.queryByText('No custom variables added yet')).not.toBeInTheDocument()
  })

  it('should keep import from .env available when custom variables exist', () => {
    useVariablesMock.mockReturnValue({
      data: [{ id: 'var-1', scope: 'APPLICATION' }],
      isLoading: false,
    } as ReturnType<typeof useVariables>)

    renderWithProviders(<CustomTab />)

    const headerActions = variableListMock.mock.calls[0][0].headerActions

    expect(headerActions).toMatchObject({
      props: expect.objectContaining({
        importEnvFileAccess: 'dropdown',
        onImportEnvFile: expect.any(Function),
      }),
    })
  })
})
