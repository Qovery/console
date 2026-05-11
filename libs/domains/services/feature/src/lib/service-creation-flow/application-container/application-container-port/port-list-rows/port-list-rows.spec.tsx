import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PortListRows, type PortListRowsProps } from './port-list-rows'

type TestPort = {
  id: string
  applicationPort: number
  isPublic: boolean
  protocol: string
  name?: string
  externalPort?: number
  publicPath?: string
  publicPathRewrite?: string
}

const ports: TestPort[] = [
  {
    id: '1',
    applicationPort: 3000,
    isPublic: true,
    protocol: 'HTTP',
    name: 'p3000',
    externalPort: 443,
    publicPath: '/',
  },
  {
    id: '2',
    applicationPort: 5432,
    isPublic: false,
    protocol: 'TCP',
  },
]

const props: PortListRowsProps<TestPort> = {
  ports,
  hidePortName: false,
  getKey: (port) => port.id,
  hasHealthcheck: (port) => port.id === '1',
  getApplicationPort: (port) => port.applicationPort,
  getIsPublic: (port) => port.isPublic,
  getProtocol: (port) => port.protocol,
  getName: (port) => port.name,
  getExternalPort: (port) => port.externalPort,
  getPublicPath: (port) => port.publicPath,
  getPublicPathRewrite: (port) => port.publicPathRewrite,
  onEditPort: jest.fn(),
  onRemovePort: jest.fn(),
}

describe('PortListRows', () => {
  beforeEach(() => {
    props.onEditPort = jest.fn()
    props.onRemovePort = jest.fn()
  })

  it('renders rows and port details', () => {
    renderWithProviders(<PortListRows {...props} />)

    expect(screen.getAllByTestId('form-row')).toHaveLength(2)
    expect(screen.getByText('Application Port: 3000')).toBeInTheDocument()
    expect(screen.getByText('Protocol: HTTP')).toBeInTheDocument()
    expect(screen.getByText('Port Name: p3000')).toBeInTheDocument()
  })

  it('calls edit and delete callbacks', async () => {
    const { userEvent } = renderWithProviders(<PortListRows {...props} />)

    await userEvent.click(screen.getAllByTestId('edit-button')[0])
    await userEvent.click(screen.getAllByTestId('delete-button')[0])

    expect(props.onEditPort).toHaveBeenCalledWith(ports[0])
    expect(props.onRemovePort).toHaveBeenCalledWith(ports[0])
  })

  it('hides port name when hidePortName is true', () => {
    renderWithProviders(<PortListRows {...props} hidePortName />)

    expect(screen.queryByText('Port Name: p3000')).not.toBeInTheDocument()
  })
})
