import { act, findByText, fireEvent, render, waitFor } from '__tests__/utils/setup-jest'
import { PortProtocolEnum } from 'qovery-typescript-axios'
import PageSettingsPorts, { type PageSettingsPortsProps } from './page-settings-ports'

let props: PageSettingsPortsProps

describe('PageSettingsPorts', () => {
  beforeEach(() => {
    props = {
      onAddPort: jest.fn(),
      onDelete: jest.fn(),
      onEdit: jest.fn(),
      ports: [
        {
          id: '1',
          internal_port: 80,
          external_port: 433,
          publicly_accessible: true,
          protocol: PortProtocolEnum.HTTP,
        },
      ],
    }
  })
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsPorts {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have two rows of fields', async () => {
    props.ports = [
      {
        id: '1',
        internal_port: 80,
        external_port: 433,
        publicly_accessible: true,
        protocol: PortProtocolEnum.HTTP,
      },
      {
        id: '2',
        internal_port: 81,
        external_port: 431,
        publicly_accessible: false,
        protocol: PortProtocolEnum.HTTP,
      },
    ]
    const { findAllByTestId } = render(<PageSettingsPorts {...props} />)

    await waitFor(async () => {
      const formRows = await findAllByTestId('form-row')
      expect(formRows).toHaveLength(2)
    })
  })

  it('a row should have 3 inputs 1 delete button and 1 edit', async () => {
    const { findAllByTestId } = render(<PageSettingsPorts {...props} />)

    await waitFor(async () => {
      const formRows = await findAllByTestId('form-row')
      expect(formRows[0].querySelectorAll('[data-testid="delete-button"]')).toHaveLength(1)
      expect(formRows[0].querySelectorAll('[data-testid="edit-button"]')).toHaveLength(1)
    })
  })

  it('displays the correct values in the form rows', () => {
    props.ports = [
      {
        id: '1',
        internal_port: 8080,
        external_port: 433,
        publicly_accessible: true,
        protocol: PortProtocolEnum.HTTP,
      },
    ]
    const { getByText } = render(<PageSettingsPorts {...props} />)

    getByText(`Application Port: ${props.ports[0].internal_port}`)
    getByText(`External Port: ${props.ports[0].external_port}`)
    getByText(`Public: ${props.ports[0].publicly_accessible ? 'Yes' : 'No'}`)
    getByText(`Protocol: ${props.ports[0].protocol}`)
  })

  it('should have an add button and a click handler', async () => {
    const spy = jest.fn()
    props.onAddPort = spy
    const { findByTestId } = render(<PageSettingsPorts {...props} />)

    const button = await findByTestId('add-button')

    await act(() => {
      fireEvent.click(button)
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should have an edit button and a click handler', async () => {
    const spy = jest.fn()
    props.onEdit = spy
    const { findByTestId } = render(<PageSettingsPorts {...props} />)

    const button = await findByTestId('edit-button')

    await act(() => {
      fireEvent.click(button)
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should call remove handler on click on remove', async () => {
    const spy = jest.fn()
    props.onDelete = spy
    const { findByTestId } = render(<PageSettingsPorts {...props} />)

    const deleteButton = await findByTestId('delete-button')

    await act(() => {
      fireEvent.click(deleteButton)
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should have a placeholder if no port yet', async () => {
    props.ports = []
    const { baseElement } = render(<PageSettingsPorts {...props} />)

    await findByText(baseElement, 'No port are set')
  })
})
