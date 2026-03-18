import type { ReactNode } from 'react'
import { databaseFactoryMock, environmentFactoryMock, helmFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceActions } from './service-actions'

let mockService = helmFactoryMock(1)[0]
const mockEnvironment = environmentFactoryMock(1)[0]
const mockNavigate = jest.fn()

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

jest.mock('../hooks/use-service/use-service', () => ({
  useService: () => ({
    data: mockService,
  }),
}))

jest.mock('../hooks/use-deployment-status/use-deployment-status', () => {
  return {
    ...jest.requireActual('../hooks/use-deployment-status/use-deployment-status'),
    useDeploymentStatus: () => ({
      data: {
        state: 'READY',
      },
    }),
  }
})

describe('ServiceActions', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockService = helmFactoryMock(1)[0]
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

  it('should render cloud shell in header other actions and navigate to the service overview', async () => {
    const { userEvent } = renderWithProviders(
      <ServiceActions serviceId={mockService.id} environment={mockEnvironment} variant="header" />,
      {
        container: document.body,
      }
    )

    await userEvent.click(screen.getByLabelText(/other actions/i))
    await userEvent.click(screen.getByText(/cloud shell/i))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
      params: {
        organizationId: mockEnvironment.organization.id,
        projectId: mockEnvironment.project.id,
        environmentId: mockEnvironment.id,
        serviceId: mockService.id,
      },
      search: {
        hasShell: true,
      },
    })
  })

  it('should call shellAction override when cloud shell is clicked in header other actions', async () => {
    const shellAction = jest.fn()
    const { userEvent } = renderWithProviders(
      <ServiceActions
        serviceId={mockService.id}
        environment={mockEnvironment}
        shellAction={shellAction}
        variant="header"
      />,
      {
        container: document.body,
      }
    )

    await userEvent.click(screen.getByLabelText(/other actions/i))
    await userEvent.click(screen.getByText(/cloud shell/i))

    expect(shellAction).toHaveBeenCalledTimes(1)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should not render cloud shell for databases by default', async () => {
    mockService = databaseFactoryMock(1)[0]

    const { userEvent } = renderWithProviders(
      <ServiceActions serviceId={mockService.id} environment={mockEnvironment} variant="header" />,
      {
        container: document.body,
      }
    )

    expect(screen.queryByLabelText(/cloud shell/i)).not.toBeInTheDocument()

    await userEvent.click(screen.getByLabelText(/other actions/i))

    expect(screen.queryByText(/cloud shell/i)).not.toBeInTheDocument()
  })

  it('should not render cloud shell for databases even with shellAction override', async () => {
    mockService = databaseFactoryMock(1)[0]
    const shellAction = jest.fn()

    const { userEvent } = renderWithProviders(
      <ServiceActions
        serviceId={mockService.id}
        environment={mockEnvironment}
        shellAction={shellAction}
        variant="header"
      />,
      {
        container: document.body,
      }
    )

    expect(screen.queryByLabelText(/cloud shell/i)).not.toBeInTheDocument()

    await userEvent.click(screen.getByLabelText(/other actions/i))

    expect(screen.queryByText(/cloud shell/i)).not.toBeInTheDocument()
    expect(shellAction).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should not display logs entry in header other actions', async () => {
    const { userEvent } = renderWithProviders(
      <ServiceActions serviceId={mockService.id} environment={mockEnvironment} variant="header" />,
      {
        container: document.body,
      }
    )

    await userEvent.click(screen.getByLabelText(/other actions/i))

    expect(screen.queryByRole('menuitem', { name: /^logs$/i })).not.toBeInTheDocument()
  })
})
