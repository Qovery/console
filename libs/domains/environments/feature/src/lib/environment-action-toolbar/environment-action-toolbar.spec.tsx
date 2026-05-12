import type { ReactNode } from 'react'
import { applicationFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentActionToolbar } from './environment-action-toolbar'

const mockEnvironment = environmentFactoryMock(1)[0]
const mockServices = applicationFactoryMock(3)
const mockDeployEnvironment = jest.fn()
const mockDeleteEnvironment = jest.fn()
const mockNavigate = jest.fn()
const mockOpenModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()
const mockCopyToClipboard = jest.fn()
const mockUseVariables = jest.fn()
let mockVariables = [
  {
    key: 'QOVERY_KUBERNETES_NAMESPACE_NAME',
    value: 'z1234567-env-name',
  },
]

let mockDeploymentStatus = {
  state: 'DEPLOYED',
  deployment_status: 'OUT_OF_DATE',
}

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: () => ({
    data: mockServices,
  }),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/', search: '' }),
  useRouter: () => ({ buildLocation: () => ({ href: '/' }) }),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
  }),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useCopyToClipboard: () => [undefined, mockCopyToClipboard],
}))

jest.mock('@qovery/domains/variables/feature', () => ({
  useVariables: (props: unknown) => mockUseVariables(props),
}))

jest.mock('../hooks/use-deployment-status/use-deployment-status', () => {
  return {
    ...jest.requireActual('../hooks/use-deployment-status/use-deployment-status'),
    useDeploymentStatus: () => ({
      data: mockDeploymentStatus,
    }),
  }
})

jest.mock('../hooks/use-deploy-environment/use-deploy-environment', () => ({
  useDeployEnvironment: () => ({
    mutate: mockDeployEnvironment,
  }),
}))

jest.mock('../hooks/use-delete-environment/use-delete-environment', () => ({
  useDeleteEnvironment: () => ({
    mutate: mockDeleteEnvironment,
  }),
}))

jest.mock('../hooks/use-service-count/use-service-count', () => ({
  useServiceCount: () => ({
    data: mockServices,
    isFetched: true,
  }),
}))

describe('EnvironmentActionToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDeploymentStatus = {
      state: 'DEPLOYED',
      deployment_status: 'OUT_OF_DATE',
    }
    mockVariables = [
      {
        key: 'QOVERY_KUBERNETES_NAMESPACE_NAME',
        value: 'z1234567-env-name',
      },
    ]
    mockUseVariables.mockImplementation(() => ({
      data: mockVariables,
    }))
  })

  it('should match manage deployment snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />, {
      container: document.body,
    })
    const buttonManageDeployment = screen.getByLabelText(/manage deployment/i)
    await userEvent.click(buttonManageDeployment)

    expect(baseElement).toMatchSnapshot()
  })

  it('should match other actions snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />, {
      container: document.body,
    })
    const buttonOtherActions = screen.getByLabelText(/other actions/i)
    await userEvent.click(buttonOtherActions)

    expect(baseElement).toMatchSnapshot()
  })

  it('should redeploy directly without opening a confirmation modal', async () => {
    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />, {
      container: document.body,
    })

    await userEvent.click(screen.getByLabelText(/manage deployment/i))
    await userEvent.click(screen.getByRole('menuitem', { name: /redeploy/i }))

    expect(mockDeployEnvironment).toHaveBeenCalledWith({ environmentId: mockEnvironment.id })
    expect(mockOpenModalConfirmation).not.toHaveBeenCalled()
  })

  it('should keep a confirmation modal for stop', async () => {
    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />, {
      container: document.body,
    })

    await userEvent.click(screen.getByLabelText(/manage deployment/i))
    await userEvent.click(screen.getByRole('menuitem', { name: /stop/i }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Confirm stop',
        name: mockEnvironment.name,
      })
    )
  })

  it('should keep a confirmation modal for cancel deployment', async () => {
    mockDeploymentStatus = {
      state: 'DEPLOYING',
      deployment_status: 'UP_TO_DATE',
    }

    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />, {
      container: document.body,
    })

    await userEvent.click(screen.getByLabelText(/manage deployment/i))
    await userEvent.click(screen.getByRole('menuitem', { name: /cancel deployment/i }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Confirm cancel',
        name: mockEnvironment.name,
      })
    )
  })

  it('should redirect to the project overview after deleting an environment', async () => {
    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />, {
      container: document.body,
    })

    await userEvent.click(screen.getByLabelText(/other actions/i))
    await userEvent.click(screen.getByRole('menuitem', { name: /delete/i }))

    const modalProps = mockOpenModalConfirmation.mock.calls[0][0]
    modalProps.action()
    const mutateOptions = mockDeleteEnvironment.mock.calls[0][1]
    mutateOptions.onSuccess()

    expect(mockDeleteEnvironment).toHaveBeenCalledWith(
      { environmentId: mockEnvironment.id },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    )
    expect(mockNavigate).toHaveBeenCalledWith({
      to: `/organization/${mockEnvironment.organization.id}/project/${mockEnvironment.project.id}/overview`,
    })
  })

  it('should open environment metadata without copying immediately', async () => {
    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />, {
      container: document.body,
    })

    await userEvent.click(screen.getByLabelText(/other actions/i))
    expect(screen.queryByRole('menuitem', { name: /copy identifier/i })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('menuitem', { name: /environment metadata/i }))

    expect(mockCopyToClipboard).not.toHaveBeenCalled()
    expect(screen.getByText('Cluster ID')).toBeInTheDocument()
    expect(screen.getByText('Organization ID')).toBeInTheDocument()
    expect(screen.getByText('Project ID')).toBeInTheDocument()
    expect(screen.getByText('Environment ID')).toBeInTheDocument()
    expect(screen.getByText('Namespace ID')).toBeInTheDocument()
    expect(screen.getByText('z1234567-env-name')).toBeInTheDocument()
  })

  it('should fetch environment variables when opening other actions', async () => {
    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />, {
      container: document.body,
    })

    expect(mockUseVariables).toHaveBeenLastCalledWith({
      parentId: mockEnvironment.id,
      scope: undefined,
    })

    await userEvent.click(screen.getByLabelText(/other actions/i))

    expect(mockUseVariables).toHaveBeenLastCalledWith({
      parentId: mockEnvironment.id,
      scope: 'ENVIRONMENT',
    })
  })

  it('should copy a single namespace value', async () => {
    const { userEvent, container } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />, {
      container: document.body,
    })

    await userEvent.click(screen.getByLabelText(/other actions/i))
    await userEvent.click(screen.getByRole('menuitem', { name: /environment metadata/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: /namespace id/i }))

    expect(mockCopyToClipboard).toHaveBeenCalledWith('z1234567-env-name')
    expect(screen.getByRole('menuitem', { name: /namespace id/i })).toBeInTheDocument()
    expect(container.querySelector('.fa-check')).toBeInTheDocument()
  })
})
