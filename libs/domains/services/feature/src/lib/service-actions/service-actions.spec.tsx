import type { ReactNode } from 'react'
import { databaseFactoryMock, environmentFactoryMock, helmFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceActions } from './service-actions'

let mockService = helmFactoryMock(1)[0]
const mockEnvironment = environmentFactoryMock(1)[0]
const mockNavigate = jest.fn()
const mockDeployService = jest.fn()
const mockOpenModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()

let mockDeploymentStatus = {
  state: 'READY',
  service_deployment_status: 'OUT_OF_DATE',
}

let mockRunningState = {
  state: 'RUNNING',
}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: '123', projectId: '456', environmentId: '789' }),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/', search: '' }),
  useRouter: () => ({ buildLocation: () => ({ href: '/' }) }),
  Link: ({ children, params, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <a {...props}>{children}</a>
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

jest.mock('../hooks/use-service/use-service', () => ({
  useService: () => ({
    data: mockService,
  }),
}))

jest.mock('../hooks/use-deployment-status/use-deployment-status', () => {
  return {
    ...jest.requireActual('../hooks/use-deployment-status/use-deployment-status'),
    useDeploymentStatus: () => ({
      data: mockDeploymentStatus,
    }),
  }
})

jest.mock('../hooks/use-running-status/use-running-status', () => ({
  useRunningStatus: () => ({
    data: mockRunningState,
  }),
}))

jest.mock('../hooks/use-deploy-service/use-deploy-service', () => ({
  useDeployService: () => ({
    mutate: mockDeployService,
  }),
}))

describe('ServiceActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockReset()
    mockService = helmFactoryMock(1)[0]
    mockDeploymentStatus = {
      state: 'READY',
      service_deployment_status: 'OUT_OF_DATE',
    }
    mockRunningState = {
      state: 'RUNNING',
    }
  })

  it('should match manage deployment snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(
      <ServiceActions serviceId={mockService.id} environment={mockEnvironment} />,
      {
        container: document.body,
      }
    )
    const buttonManageDeployment = screen.getByLabelText(/manage deployment/i)
    await userEvent.click(buttonManageDeployment)

    expect(baseElement).toMatchSnapshot()
  })

  it('should match other actions snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(
      <ServiceActions serviceId={mockService.id} environment={mockEnvironment} />,
      {
        container: document.body,
      }
    )
    const buttonOtherActions = screen.getByLabelText(/other actions/i)
    await userEvent.click(buttonOtherActions)

    expect(baseElement).toMatchSnapshot()
  })

  it('should display access infos in other actions for supported services', async () => {
    mockService = databaseFactoryMock(1)[0]
    const { userEvent } = renderWithProviders(
      <ServiceActions serviceId={mockService.id} environment={mockEnvironment} variant="header" />,
      {
        container: document.body,
      }
    )

    const buttonOtherActions = screen.getByLabelText(/other actions/i)
    await userEvent.click(buttonOtherActions)

    expect(screen.getByRole('menuitem', { name: /access infos/i })).toBeInTheDocument()
  })

  it('should redeploy directly without opening a modal when no changes are pending', async () => {
    mockDeploymentStatus = {
      state: 'DEPLOYED',
      service_deployment_status: 'UP_TO_DATE',
    }

    const { userEvent } = renderWithProviders(
      <ServiceActions serviceId={mockService.id} environment={mockEnvironment} />,
      {
        container: document.body,
      }
    )

    await userEvent.click(screen.getByLabelText(/manage deployment/i))
    await userEvent.click(screen.getByRole('menuitem', { name: /redeploy/i }))

    expect(mockDeployService).toHaveBeenCalledWith({
      serviceId: mockService.id,
      serviceType: mockService.serviceType,
    })
    expect(mockOpenModal).not.toHaveBeenCalled()
    expect(mockOpenModalConfirmation).not.toHaveBeenCalled()
  })

  it('should keep a confirmation modal for stop', async () => {
    mockDeploymentStatus = {
      state: 'DEPLOYED',
      service_deployment_status: 'UP_TO_DATE',
    }

    const { userEvent } = renderWithProviders(
      <ServiceActions serviceId={mockService.id} environment={mockEnvironment} />,
      {
        container: document.body,
      }
    )

    await userEvent.click(screen.getByLabelText(/manage deployment/i))
    await userEvent.click(screen.getByRole('menuitem', { name: /stop/i }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Confirm stop',
        name: mockService.name,
      })
    )
  })

  it('should keep a confirmation modal for cancel deployment', async () => {
    mockDeploymentStatus = {
      state: 'DEPLOYING',
      service_deployment_status: 'UP_TO_DATE',
    }

    const { userEvent } = renderWithProviders(
      <ServiceActions serviceId={mockService.id} environment={mockEnvironment} />,
      {
        container: document.body,
      }
    )

    await userEvent.click(screen.getByLabelText(/manage deployment/i))
    await userEvent.click(screen.getByRole('menuitem', { name: /cancel deployment/i }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Cancel deployment',
        name: mockService.name,
      })
    )
  })
})
