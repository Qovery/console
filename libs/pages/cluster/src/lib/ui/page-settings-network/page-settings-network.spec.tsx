import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsNetwork, { type PageSettingsNetworkProps } from './page-settings-network'

let props: PageSettingsNetworkProps

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
      loading: false,
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

  it('should have a placeholder if no route yet', async () => {
    props.routes = []
    renderWithProviders(<PageSettingsNetwork {...props} />)
    screen.getByText('No network are set')
  })
})
