import type { ForwardedRef, ReactNode } from 'react'
import { applicationFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentActionToolbar } from './environment-action-toolbar'

const mockEnvironment = environmentFactoryMock(1)[0]
let mockServices: unknown[] = applicationFactoryMock(3)
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
  Link: jest
    .requireActual('react')
    .forwardRef(
      (
        { children, ...props }: { children?: ReactNode; [key: string]: unknown },
        ref: ForwardedRef<HTMLAnchorElement>
      ) => (
        <a {...props} ref={ref}>
          {children}
        </a>
      )
    ),
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

jest.mock('../hooks/use-environment-services/use-environment-services', () => ({
  useEnvironmentServices: () => ({
    data: mockServices,
    isLoading: false,
  }),
}))

describe('EnvironmentActionToolbar', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockDeploymentStatus = {
      state: 'DEPLOYED',
      deployment_status: 'OUT_OF_DATE',
    }
    mockServices = applicationFactoryMock(3)
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

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('should match manage deployment snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />)
    const buttonManageDeployment = screen.getByLabelText(/manage deployment/i)
    await userEvent.click(buttonManageDeployment)

    expect(baseElement).toMatchSnapshot()
  })

  it('should match other actions snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />)
    const buttonOtherActions = screen.getByLabelText(/other actions/i)
    await userEvent.click(buttonOtherActions)

    expect(baseElement).toMatchSnapshot()
  })

  it('should redeploy directly without opening a confirmation modal', async () => {
    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />)

    await userEvent.click(screen.getByLabelText(/manage deployment/i))
    await userEvent.click(screen.getByRole('menuitem', { name: /redeploy/i }))

    expect(mockDeployEnvironment).toHaveBeenCalledWith({ environmentId: mockEnvironment.id })
    expect(mockOpenModalConfirmation).not.toHaveBeenCalled()
  })

  it('should disable manage deployment when the environment has no services', async () => {
    mockServices = []

    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />)

    const manageDeploymentButton = screen.getByRole('button', { name: /manage deployment/i })
    expect(manageDeploymentButton).toBeDisabled()

    await userEvent.hover(manageDeploymentButton.parentElement as HTMLElement)
    expect(
      await screen.findByRole('tooltip', { name: 'Add at least one service to deploy this environment' })
    ).toBeInTheDocument()
  })

  it('should disable manage deployment when the environment only has ArgoCD services', async () => {
    mockServices = [
      {
        id: 'argocd-service-1',
        name: 'ArgoCD service',
        service_type: 'ARGOCD_APP',
        serviceType: 'ARGOCD_APP',
      },
    ]

    const { userEvent } = renderWithProviders(
      <EnvironmentActionToolbar environment={mockEnvironment} variant="header" />
    )

    const manageDeploymentButton = screen.getByRole('button', { name: /manage deployment/i })
    expect(manageDeploymentButton).toBeDisabled()

    await userEvent.hover(manageDeploymentButton.parentElement as HTMLElement)
    expect(
      await screen.findByRole('tooltip', { name: 'ArgoCD environments can only be deployed from ArgoCD' })
    ).toBeInTheDocument()
  })

  it('should display an ArgoCD warning on redeploy when the environment contains ArgoCD services', async () => {
    mockServices = [
      applicationFactoryMock(1)[0],
      {
        id: 'argocd-service-1',
        name: 'ArgoCD service',
        service_type: 'ARGOCD_APP',
        serviceType: 'ARGOCD_APP',
      },
    ]

    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />)

    await userEvent.click(screen.getByLabelText(/manage deployment/i))
    await userEvent.hover(screen.getByLabelText(/argocd deployment information/i))

    expect(await screen.findAllByText('Environment has changed and needs to be applied')).toHaveLength(2)
    expect(
      await screen.findAllByText('Redeploy will only target Qovery created services and not ArgoCD imported ones.')
    ).toHaveLength(2)
  })

  it('should display an ArgoCD warning on deploy when the environment contains ArgoCD services', async () => {
    mockDeploymentStatus = {
      state: 'READY',
      deployment_status: 'OUT_OF_DATE',
    }
    mockServices = [
      applicationFactoryMock(1)[0],
      {
        id: 'argocd-service-1',
        name: 'ArgoCD service',
        service_type: 'ARGOCD_APP',
        serviceType: 'ARGOCD_APP',
      },
    ]

    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />)

    await userEvent.click(screen.getByLabelText(/manage deployment/i))
    await userEvent.hover(screen.getByLabelText(/argocd deployment information/i))

    expect(await screen.findAllByText('Environment has changed and needs to be applied')).toHaveLength(2)
    expect(
      await screen.findAllByText('Redeploy will only target Qovery created services and not ArgoCD imported ones.')
    ).toHaveLength(2)
  })

  it('should keep a confirmation modal for stop', async () => {
    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />)

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

    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />)

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
    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />)

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
    const { userEvent } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />)

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

  it('should disable ArgoCD environment deletion', async () => {
    const { userEvent } = renderWithProviders(
      <EnvironmentActionToolbar environment={mockEnvironment} isArgoCdEnvironment />
    )

    await userEvent.click(screen.getByLabelText(/other actions/i))

    const deleteEnvironmentItem = screen.getByRole('menuitem', { name: /delete environment/i })
    expect(deleteEnvironmentItem).toHaveAttribute('aria-disabled', 'true')

    await userEvent.hover(screen.getByText('Delete environment'))

    expect(
      await screen.findByRole('tooltip', {
        name: 'ArgoCD environment can only be deleted by revoking the integration',
      })
    ).toBeInTheDocument()
  })

  it('should disable ArgoCD environment clone', async () => {
    const { userEvent } = renderWithProviders(
      <EnvironmentActionToolbar environment={mockEnvironment} isArgoCdEnvironment />
    )

    await userEvent.click(screen.getByLabelText(/other actions/i))

    const cloneEnvironmentItem = screen.getByRole('menuitem', { name: /^clone$/i })
    expect(cloneEnvironmentItem).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(cloneEnvironmentItem)
    expect(mockOpenModal).not.toHaveBeenCalled()

    await userEvent.hover(screen.getByText('Clone'))

    expect(
      await screen.findByRole('tooltip', {
        name: 'ArgoCD environments cannot be cloned',
      })
    ).toBeInTheDocument()
  })
})
