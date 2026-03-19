import { type ReactNode } from 'react'
import {
  useVariables,
  VariableList,
} from '@qovery/domains/variables/feature'
import { useModal } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CustomTab } from './service-variables-custom-tab'

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

describe('CustomTab', () => {
  const useVariablesMock = useVariables as jest.MockedFunction<typeof useVariables>
  const useModalMock = useModal as jest.MockedFunction<typeof useModal>
  const variableListMock = VariableList as jest.MockedFunction<typeof VariableList>

  const defaultProps = {
    scope: 'APPLICATION' as const,
    organizationId: 'org-id',
    projectId: 'project-id',
    environmentId: 'environment-id',
    serviceId: 'service-id',
    toasterCallback: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
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

    renderWithProviders(<CustomTab {...defaultProps} />)

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

    renderWithProviders(<CustomTab {...defaultProps} />)

    expect(variableListMock).toHaveBeenCalled()
    expect(screen.queryByText('No custom variables added yet')).not.toBeInTheDocument()
  })
})
