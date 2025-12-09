import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsNetwork, { type PageSettingsNetworkProps } from './page-settings-network'

let props: PageSettingsNetworkProps

const [mockCluster] = clusterFactoryMock(1)
mockCluster.cloud_provider = 'AWS'
mockCluster.kubernetes = 'MANAGED'

describe('PageSettingsNetwork', () => {
  beforeEach(() => {
    props = {
      onAddRoute: jest.fn(),
      onDelete: jest.fn(),
      onEdit: jest.fn(),
      routes: [
        {
          destination: '10.0.0.0/10',
          target: 'target',
          description: 'desc',
        },
      ],
      isLoading: false,
      cluster: mockCluster,
    }
  })
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsNetwork {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have two rows of fields', async () => {
    props.routes = [
      {
        destination: '10.0.0.0/10',
        target: 'target',
        description: 'desc',
      },
      {
        destination: '10.0.0.0/20',
        target: 'target2',
        description: 'desc2',
      },
    ]

    renderWithProviders(<PageSettingsNetwork {...props} />)

    const formRows = await screen.findAllByTestId('form-row')
    expect(formRows).toHaveLength(2)
  })

  it('should have a row should have two information, 1 delete button and 1 edit', async () => {
    renderWithProviders(<PageSettingsNetwork {...props} />)

    const formRows = await screen.findAllByTestId('form-row')
    expect(formRows[0].querySelectorAll('[data-testid="form-row-target"]')).toHaveLength(1)
    expect(formRows[0].querySelectorAll('[data-testid="form-row-destination"]')).toHaveLength(1)
    expect(formRows[0].querySelectorAll('[data-testid="delete-button"]')).toHaveLength(1)
    expect(formRows[0].querySelectorAll('[data-testid="edit-button"]')).toHaveLength(1)
  })

  it('should have a row that initialize with good values', async () => {
    renderWithProviders(<PageSettingsNetwork {...props} />)

    expect(screen.getByTestId('form-row-target')).toHaveTextContent(`Target: ${props.routes && props.routes[0].target}`)
    expect(screen.getByTestId('form-row-destination')).toHaveTextContent(
      `Destination: ${props.routes && props.routes[0].destination}`
    )
  })

  it('should have an add button and a click handler', async () => {
    const spy = jest.fn()
    props.onAddRoute = spy
    const { userEvent } = renderWithProviders(<PageSettingsNetwork {...props} />)

    const button = await screen.findByTestId('add-button')

    await userEvent.click(button)

    expect(spy).toHaveBeenCalled()
  })

  it('should have an edit button and a click handler', async () => {
    const spy = jest.fn()
    props.onEdit = spy
    const { userEvent } = renderWithProviders(<PageSettingsNetwork {...props} />)

    const button = await screen.findByTestId('edit-button')

    await userEvent.click(button)

    expect(spy).toHaveBeenCalled()
  })

  it('should call remove handler on click on remove', async () => {
    const spy = jest.fn()
    props.onDelete = spy
    const { userEvent } = renderWithProviders(<PageSettingsNetwork {...props} />)

    const deleteButton = await screen.findByTestId('delete-button')

    await userEvent.click(deleteButton)

    expect(spy).toHaveBeenCalled()
  })

  it('should render Scaleway static IP component for Scaleway clusters', () => {
    const scwCluster = { ...mockCluster }
    scwCluster.cloud_provider = 'SCW'
    scwCluster.features = [
      {
        id: 'STATIC_IP',
        value: true,
        value_object: { value: true },
      },
      {
        id: 'NAT_GATEWAY',
        value: true,
        value_object: {
          value: {
            nat_gateway_type: {
              provider: 'scaleway',
              type: 'VPC-GW-M',
            },
          },
        },
      },
    ]
    props.cluster = scwCluster
    props.routes = undefined

    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsNetwork {...props} />, {
        defaultValues: {
          features: {
            STATIC_IP: { value: true },
            NAT_GATEWAY: { value: true, extendedValue: 'VPC-GW-M' },
          },
        },
      })
    )

    expect(screen.getAllByText('Static IP / Nat Gateways').length).toBeGreaterThan(0)
  })

  it('should render submit button for Scaleway production clusters', () => {
    const scwCluster = { ...mockCluster }
    scwCluster.cloud_provider = 'SCW'
    scwCluster.production = true
    scwCluster.features = [
      {
        id: 'STATIC_IP',
        value: true,
        value_object: { value: true },
      },
    ]
    props.cluster = scwCluster
    props.routes = undefined
    props.isEditClusterLoading = false

    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsNetwork {...props} />, {
        defaultValues: {
          features: {
            STATIC_IP: { value: true },
          },
        },
      })
    )

    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('should render Scaleway static IP for non-production clusters with production=false', () => {
    const scwCluster = { ...mockCluster }
    scwCluster.cloud_provider = 'SCW'
    scwCluster.production = false
    scwCluster.features = [
      {
        id: 'STATIC_IP',
        value: false,
        value_object: { value: false },
      },
    ]
    props.cluster = scwCluster
    props.routes = undefined

    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsNetwork {...props} />, {
        defaultValues: {
          features: {
            STATIC_IP: { value: false },
          },
        },
      })
    )

    expect(screen.getAllByText('Static IP / Nat Gateways').length).toBeGreaterThan(0)
  })
})
