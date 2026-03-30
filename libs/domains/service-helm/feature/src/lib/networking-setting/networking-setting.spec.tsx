import { type ReactElement } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { NetworkingSetting } from './networking-setting'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()
const mockOpenModalMultiConfirmation = jest.fn()

jest.mock('@qovery/domains/custom-domains/feature', () => ({
  ...jest.requireActual('@qovery/domains/custom-domains/feature'),
  useCustomDomains: () => ({
    data: [],
  }),
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

jest.mock('../hooks/use-kubernetes-services/use-kubernetes-services', () => ({
  ...jest.requireActual('../hooks/use-kubernetes-services/use-kubernetes-services'),
  useKubernetesServices: () => ({
    data: [],
    isLoading: false,
  }),
}))

describe('NetworkingSetting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should match snapshot in empty state', () => {
    const { baseElement } = renderWithProviders(
      <NetworkingSetting helmId="helm-1" ports={[]} onUpdatePorts={jest.fn()} />
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot with ports', () => {
    const { baseElement } = renderWithProviders(
      <NetworkingSetting
        helmId="helm-1"
        ports={[
          {
            internal_port: 1234,
            external_port: 443,
            service_name: 'My service',
            namespace: 'My namespace',
            protocol: 'HTTP',
            name: 'My service-p1234',
          },
          {
            internal_port: 4321,
            external_port: 443,
            service_name: 'My service 2',
            namespace: '',
            protocol: 'GRPC',
            name: 'My service 2-p4321',
          },
        ]}
        onUpdatePorts={jest.fn()}
      />
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('opens the add port modal', async () => {
    const { userEvent } = renderWithProviders(
      <NetworkingSetting helmId="helm-1" ports={[]} onUpdatePorts={jest.fn()} />
    )

    await userEvent.click(screen.getByText(/add port/i))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
    const content = mockOpenModal.mock.calls[0][0].content as ReactElement<{ helmId: string; port?: unknown }>

    expect(content.props.helmId).toBe('helm-1')
    expect(content.props.port).toBeUndefined()
  })

  it('opens the edit port modal with the selected port', async () => {
    const editedPort = {
      internal_port: 4321,
      external_port: 443,
      service_name: 'My service 2',
      namespace: '',
      protocol: 'GRPC',
      name: 'My service 2-p4321',
    }
    const { userEvent } = renderWithProviders(
      <NetworkingSetting
        helmId="helm-1"
        ports={[
          {
            internal_port: 1234,
            external_port: 443,
            service_name: 'My service',
            namespace: 'My namespace',
            protocol: 'HTTP',
            name: 'My service-p1234',
          },
          editedPort,
        ]}
        onUpdatePorts={jest.fn()}
      />
    )

    await userEvent.click(screen.getAllByTestId('edit-port')[1])

    expect(mockOpenModal).toHaveBeenCalledTimes(1)
    const content = mockOpenModal.mock.calls[0][0].content as ReactElement<{ helmId: string; port: unknown }>

    expect(content.props.helmId).toBe('helm-1')
    expect(content.props.port).toEqual(editedPort)
  })

  it('removes a port through confirmation', async () => {
    const onUpdatePorts = jest.fn()
    const { userEvent } = renderWithProviders(
      <NetworkingSetting
        helmId="helm-1"
        ports={[
          {
            internal_port: 1234,
            external_port: 443,
            service_name: 'My service',
            namespace: 'My namespace',
            protocol: 'HTTP',
            name: 'My service-p1234',
          },
        ]}
        onUpdatePorts={onUpdatePorts}
      />
    )

    await userEvent.click(screen.getAllByTestId('remove-port')[0])

    expect(mockOpenModalConfirmation).toHaveBeenCalledTimes(1)
    const { action } = mockOpenModalConfirmation.mock.calls[0][0]
    action()

    expect(onUpdatePorts).toHaveBeenCalledWith([])
  })
})
