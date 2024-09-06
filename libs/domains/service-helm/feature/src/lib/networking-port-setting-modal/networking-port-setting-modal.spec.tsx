import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { NetworkingPortSettingModal } from './networking-port-setting-modal'

jest.mock('../hooks/use-kubernetes-services/use-kubernetes-services', () => ({
  ...jest.requireActual('../hooks/use-kubernetes-services/use-kubernetes-services'),
  useKubernetesServices: () => ({
    data: [],
    isLoading: false,
  }),
}))

describe('NetworkingPortSettingModal', () => {
  it('should match snapshot in create state', () => {
    const { baseElement } = renderWithProviders(<NetworkingPortSettingModal onSubmit={jest.fn()} onClose={jest.fn()} />)
    screen.getByText(/create/i)
    expect(baseElement).toMatchSnapshot()
  })
  it('should match snapshot in edit state', () => {
    const { baseElement } = renderWithProviders(
      <NetworkingPortSettingModal
        port={{
          internal_port: 1234,

          external_port: 443,
          service_name: 'My service',
          namespace: 'My namespace',
          protocol: 'HTTP',
          name: 'My service-p1234',
        }}
        onSubmit={jest.fn()}
        onClose={jest.fn()}
      />
    )
    screen.getByText(/edit/i)
    expect(baseElement).toMatchSnapshot()
  })
  it('should close on cancel', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(<NetworkingPortSettingModal onSubmit={jest.fn()} onClose={onClose} />)
    await userEvent.click(screen.getByText(/cancel/i))
    expect(onClose).toHaveBeenCalled()
  })
  it('should submit port', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(<NetworkingPortSettingModal onSubmit={onSubmit} onClose={jest.fn()} />)
    await userEvent.click(screen.getByText(/cancel/i))

    await userEvent.type(screen.getByLabelText(/service name/i), 'foo')
    await userEvent.type(screen.getByLabelText(/namespace/i), 'bar')
    await userEvent.type(screen.getByLabelText(/service port/i), '1234')
    await selectEvent.select(screen.getByLabelText(/protocol/i), ['GRPC'], {
      container: document.body,
    })
    await userEvent.click(screen.getByText(/create/i))

    expect(onSubmit).toHaveBeenCalledWith({
      service_name: 'foo',
      namespace: 'bar',
      internal_port: 1234,
      external_port: 443,
      protocol: 'GRPC',
      name: 'p1234-foo',
    })
  })
})
