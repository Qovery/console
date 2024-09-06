import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { NetworkingSetting } from './networking-setting'

jest.mock('../hooks/use-kubernetes-services/use-kubernetes-services', () => ({
  ...jest.requireActual('../hooks/use-kubernetes-services/use-kubernetes-services'),
  useKubernetesServices: () => ({
    data: [],
    isLoading: false,
  }),
}))

describe('NetworkingSetting', () => {
  it('should match snapshot in empty state', () => {
    const { baseElement } = renderWithProviders(<NetworkingSetting ports={[]} onUpdatePorts={jest.fn()} />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should match snapshot with ports', () => {
    const { baseElement } = renderWithProviders(
      <NetworkingSetting
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
  it('should add port', async () => {
    const onUpdatePorts = jest.fn()
    const { userEvent } = renderWithProviders(<NetworkingSetting ports={[]} onUpdatePorts={onUpdatePorts} />)

    await userEvent.click(screen.getByText(/add port/i))

    screen.getByText('Set port')
    await userEvent.type(screen.getByLabelText(/service name/i), 'foo')
    await userEvent.type(screen.getByLabelText(/namespace/i), 'bar')
    await userEvent.type(screen.getByLabelText(/service port/i), '1234')
    await selectEvent.select(screen.getByLabelText(/protocol/i), ['GRPC'], {
      container: document.body,
    })
    await userEvent.click(screen.getByText(/create/i))

    expect(screen.queryByText('Set port')).not.toBeInTheDocument()

    expect(onUpdatePorts).toHaveBeenCalledWith([
      {
        service_name: 'foo',
        namespace: 'bar',
        internal_port: 1234,
        external_port: 443,
        protocol: 'GRPC',
        name: 'p1234-foo',
      },
    ])
  })
  it('should edit port', async () => {
    const onUpdatePorts = jest.fn()
    const { userEvent } = renderWithProviders(
      <NetworkingSetting
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
        onUpdatePorts={onUpdatePorts}
      />
    )

    await userEvent.click(screen.getAllByTestId('edit-port')[1])

    screen.getByText('Edit port')
    const serviceNameInput = screen.getByLabelText(/service name/i)
    await userEvent.clear(serviceNameInput)
    await userEvent.type(serviceNameInput, 'foo')
    const namespaceInput = screen.getByLabelText(/namespace/i)
    await userEvent.clear(namespaceInput)
    await userEvent.type(namespaceInput, 'bar')
    const portInput = screen.getByLabelText(/service port/i)
    await userEvent.clear(portInput)
    await userEvent.type(portInput, '1234')
    await selectEvent.select(screen.getByLabelText(/protocol/i), ['GRPC'], {
      container: document.body,
    })
    await userEvent.click(screen.getByText(/confirm/i))

    expect(screen.queryByText('Edit port')).not.toBeInTheDocument()

    expect(onUpdatePorts).toHaveBeenCalledWith([
      {
        internal_port: 1234,
        external_port: 443,
        service_name: 'My service',
        namespace: 'My namespace',
        protocol: 'HTTP',
        name: 'My service-p1234',
      },
      {
        service_name: 'foo',
        namespace: 'bar',
        internal_port: 1234,
        external_port: 443,
        protocol: 'GRPC',
        name: 'p1234-foo',
      },
    ])
  })

  it('should remove port', async () => {
    const onUpdatePorts = jest.fn()
    const { userEvent } = renderWithProviders(
      <NetworkingSetting
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

    await userEvent.type(screen.getByRole('textbox'), 'delete')
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }))

    expect(onUpdatePorts).toHaveBeenCalledWith([])
  })
})
