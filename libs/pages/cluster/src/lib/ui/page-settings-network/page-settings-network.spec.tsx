import { act, fireEvent, render, waitFor } from '@testing-library/react'
import PageSettingsNetwork, { PageSettingsNetworkProps } from './page-settings-network'

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
      loading: 'loaded',
    }
  })
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsNetwork {...props} />)
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

    const { findAllByTestId } = render(<PageSettingsNetwork {...props} />)

    await waitFor(async () => {
      const formRows = await findAllByTestId('form-row')
      expect(formRows).toHaveLength(2)
    })
  })

  it('should have a row should have two information, 1 delete button and 1 edit', async () => {
    const { findAllByTestId } = render(<PageSettingsNetwork {...props} />)

    await waitFor(async () => {
      const formRows = await findAllByTestId('form-row')
      expect(formRows[0].querySelectorAll('[data-testid="form-row-target"]')).toHaveLength(1)
      expect(formRows[0].querySelectorAll('[data-testid="form-row-destination"]')).toHaveLength(1)
      expect(formRows[0].querySelectorAll('[data-testid="delete-button"]')).toHaveLength(1)
      expect(formRows[0].querySelectorAll('[data-testid="edit-button"]')).toHaveLength(1)
    })
  })

  it('should have a row that initialize with good values', async () => {
    const { getByTestId } = render(<PageSettingsNetwork {...props} />)

    expect(getByTestId('form-row-target').textContent).toBe(`Target: ${props.routes && props.routes[0].target}`)
    expect(getByTestId('form-row-destination').textContent).toBe(
      `Destination: ${props.routes && props.routes[0].destination}`
    )
  })

  it('should have an help section', async () => {
    const { findByTestId } = render(<PageSettingsNetwork {...props} />)

    await findByTestId('help-section')
  })

  it('should have an add button and a click handler', async () => {
    const spy = jest.fn()
    props.onAddRoute = spy
    const { findByTestId } = render(<PageSettingsNetwork {...props} />)

    const button = await findByTestId('add-button')

    await act(() => {
      fireEvent.click(button)
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should have an edit button and a click handler', async () => {
    const spy = jest.fn()
    props.onEdit = spy
    const { findByTestId } = render(<PageSettingsNetwork {...props} />)

    const button = await findByTestId('edit-button')

    await act(() => {
      fireEvent.click(button)
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should call remove handler on click on remove', async () => {
    const spy = jest.fn()
    props.onDelete = spy
    const { findByTestId } = render(<PageSettingsNetwork {...props} />)

    const deleteButton = await findByTestId('delete-button')

    await act(() => {
      fireEvent.click(deleteButton)
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should have a placeholder if no route yet', async () => {
    props.routes = []
    const { getByTestId } = render(<PageSettingsNetwork {...props} />)
    expect(getByTestId('placeholder-settings'))
  })
})
