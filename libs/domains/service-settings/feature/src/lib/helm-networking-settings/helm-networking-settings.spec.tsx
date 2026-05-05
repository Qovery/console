import { type ReactElement } from 'react'
import { helmFactoryMock } from '@qovery/shared/factories'
import * as utilServices from '@qovery/shared/util-services'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HelmNetworkingSettings } from './helm-networking-settings'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()
const mockOpenModalMultiConfirmation = jest.fn()
const mockEditService = jest.fn()

const mockIsTryingToRemoveLastPublicPort = jest.fn()

let mockService = helmFactoryMock(1)[0]

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'project-1',
    environmentId: 'env-1',
    serviceId: 'service-1',
  }),
}))

jest.mock('@qovery/domains/custom-domains/feature', () => ({
  useCustomDomains: () => ({
    data: [],
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useService: () => ({
    data: mockService,
  }),
  useEditService: () => ({
    mutateAsync: mockEditService,
  }),
}))

jest.mock('@qovery/domains/service-helm/feature', () => ({
  NetworkingPortSettingModal: ({ port }: { port?: { name?: string } }) => (
    <div data-testid="networking-port-setting-modal">{port?.name ?? 'new-port'}</div>
  ),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
  useModalMultiConfirmation: () => ({
    openModalMultiConfirmation: mockOpenModalMultiConfirmation,
  }),
}))

jest.mock('@qovery/shared/util-services', () => ({
  ...jest.requireActual('@qovery/shared/util-services'),
  isTryingToRemoveLastPublicPort: (...args: unknown[]) => mockIsTryingToRemoveLastPublicPort(...args),
}))

const buildService = () => {
  const service = helmFactoryMock(1)[0]
  service.id = 'service-1'
  service.ports = []
  return service
}

describe('HelmNetworkingSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockService = buildService()
    mockIsTryingToRemoveLastPublicPort.mockReturnValue(false)
  })

  it('renders empty state when no ports are configured', () => {
    renderWithProviders(<HelmNetworkingSettings />)

    expect(screen.getByText('No ports are set.')).toBeInTheDocument()
  })

  it('renders ports sorted by service name and port name', () => {
    mockService.ports = [
      { name: 'zeta', service_name: 'api', internal_port: 3002, protocol: 'HTTP' },
      { name: 'alpha', service_name: 'api', internal_port: 3001, protocol: 'HTTP' },
      { name: 'aaa', service_name: 'worker', internal_port: 3003, protocol: 'HTTP' },
    ]

    renderWithProviders(<HelmNetworkingSettings />)

    expect(screen.getAllByText(/Service port:/).map((element) => element.textContent)).toEqual([
      'Service port: 3001',
      'Service port: 3002',
      'Service port: 3003',
    ])
  })

  it('opens add port modal when clicking add port', async () => {
    const { userEvent } = renderWithProviders(<HelmNetworkingSettings />)

    await userEvent.click(screen.getByRole('button', { name: /add port/i }))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
    const [{ content }] = mockOpenModal.mock.calls[0] as [{ content: ReactElement }]
    expect(content.props.helmId).toBe('service-1')
    expect(content.props.port).toBeUndefined()
  })

  it('opens edit port modal for the selected port', async () => {
    mockService.ports = [{ name: 'alpha', service_name: 'api', internal_port: 3001, protocol: 'HTTP' }]
    const { userEvent } = renderWithProviders(<HelmNetworkingSettings />)

    await userEvent.click(screen.getByTestId('edit-port'))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
    const [{ content }] = mockOpenModal.mock.calls[0] as [{ content: ReactElement }]
    expect(content.props.port).toEqual(mockService.ports?.[0])
  })

  it('opens action confirmation for regular delete flow and removes the port', async () => {
    const firstPort = { name: 'alpha', service_name: 'api', internal_port: 3001, protocol: 'HTTP' }
    const secondPort = { name: 'beta', service_name: 'api', internal_port: 3002, protocol: 'HTTP' }
    mockService.ports = [firstPort, secondPort]

    const { userEvent } = renderWithProviders(<HelmNetworkingSettings />)
    await userEvent.click(screen.getAllByTestId('remove-port')[0])

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delete Port',
        confirmationMethod: 'action',
      })
    )
    expect(mockOpenModalMultiConfirmation).not.toHaveBeenCalled()

    await mockOpenModalConfirmation.mock.calls[0][0].action()

    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: 'service-1',
      payload: utilServices.buildEditServicePayload({
        service: mockService,
        request: {
          ports: [secondPort],
        },
      }),
    })
  })

  it('opens multi confirmation for last public port delete flow and removes the port', async () => {
    const onlyPort = { name: 'alpha', service_name: 'api', internal_port: 3001, protocol: 'HTTP' }
    mockService.ports = [onlyPort]
    mockIsTryingToRemoveLastPublicPort.mockReturnValue(true)

    const { userEvent } = renderWithProviders(<HelmNetworkingSettings />)
    await userEvent.click(screen.getByTestId('remove-port'))

    expect(mockOpenModalMultiConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delete port',
        isDelete: true,
      })
    )
    expect(mockOpenModalConfirmation).not.toHaveBeenCalled()

    await mockOpenModalMultiConfirmation.mock.calls[0][0].action()

    expect(mockEditService).toHaveBeenCalledWith({
      serviceId: 'service-1',
      payload: utilServices.buildEditServicePayload({
        service: mockService,
        request: {
          ports: [],
        },
      }),
    })
  })
})
