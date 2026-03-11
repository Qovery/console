import { PortProtocolEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  ApplicationContainerPortSettingsList,
  type ApplicationContainerPortSettingsListProps,
} from './application-container-port-settings-list'

const ports = [
  {
    id: 'port-1',
    internal_port: 3000,
    external_port: 3000,
    publicly_accessible: false,
    protocol: PortProtocolEnum.HTTP,
    name: 'p3000',
    public_domain: null,
    namespace: null,
  },
  {
    id: 'port-2',
    internal_port: 4000,
    external_port: 443,
    publicly_accessible: true,
    protocol: PortProtocolEnum.HTTP,
    name: 'p4000',
    public_domain: null,
    namespace: null,
  },
]

const props: ApplicationContainerPortSettingsListProps = {
  onAddPort: jest.fn(),
  onEditPort: jest.fn(),
  onRemovePort: jest.fn(),
  ports,
}

const renderComponent = (componentProps: ApplicationContainerPortSettingsListProps = props) =>
  renderWithProviders(<ApplicationContainerPortSettingsList {...componentProps} />)

describe('ApplicationContainerPortSettingsList', () => {
  beforeEach(() => {
    props.onAddPort = jest.fn()
    props.onEditPort = jest.fn()
    props.onRemovePort = jest.fn()
    props.ports = ports
  })

  it('renders successfully', () => {
    const { baseElement } = renderComponent()
    expect(baseElement).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Ports' })).toBeInTheDocument()
  })

  it('shows empty state when no ports', () => {
    props.ports = []
    renderComponent()
    expect(screen.getByText('No ports are set')).toBeInTheDocument()
  })

  it('calls onAddPort when Add port is clicked', async () => {
    const { userEvent } = renderComponent()
    await userEvent.click(screen.getByTestId('add-button'))
    expect(props.onAddPort).toHaveBeenCalledTimes(1)
  })

  it('calls onEditPort when edit button is clicked', async () => {
    const { userEvent } = renderComponent()
    await userEvent.click(screen.getAllByTestId('edit-button')[0])
    expect(props.onEditPort).toHaveBeenCalledWith(ports[0])
  })

  it('calls onRemovePort with warning when port is used by healthcheck', async () => {
    const { userEvent } = renderComponent({
      ...props,
      livenessProbeType: {
        http: {
          path: '/',
          scheme: 'HTTP',
          port: 3000,
        },
      },
    })

    await userEvent.click(screen.getAllByTestId('delete-button')[0])

    expect(props.onRemovePort).toHaveBeenCalledWith(
      ports[0],
      'The health check pointing to this port will be deleted as well.'
    )
  })
})
