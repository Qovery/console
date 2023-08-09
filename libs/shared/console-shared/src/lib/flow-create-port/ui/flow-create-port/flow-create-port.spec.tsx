import { fireEvent, render, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { PortProtocolEnum, type ServicePort } from 'qovery-typescript-axios'
import FlowCreatePort, { FlowCreatePortProps } from './flow-create-port'

const ports: ServicePort[] = [
  {
    internal_port: 3000,
    external_port: 3000,
    publicly_accessible: false,
    protocol: PortProtocolEnum.HTTP,
  },
  {
    internal_port: 4000,
    external_port: 3000,
    publicly_accessible: false,
    protocol: PortProtocolEnum.HTTP,
  },
]
const props: FlowCreatePortProps = {
  onSubmit: jest.fn(),
  onBack: jest.fn(),
  onAddPort: jest.fn(),
  onRemovePort: jest.fn(),
  ports,
}

describe('PageApplicationCreatePort', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<FlowCreatePort {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('calls the onAddPort function when the "Add Port" button is clicked', () => {
    props.onAddPort = jest.fn()
    const { getByTestId } = render(<FlowCreatePort {...props} isSetting />)
    const addButton = getByTestId('add-button')
    fireEvent.click(addButton)
    expect(props.onAddPort).toHaveBeenCalled()
  })

  it('calls the onRemovePort function when the "Delete" button is clicked', () => {
    props.onRemovePort = jest.fn()
    const { getAllByTestId } = render(<FlowCreatePort {...props} />)
    const deleteButtons = getAllByTestId('delete-button')
    fireEvent.click(deleteButtons[0])

    waitFor(() => {
      expect(props.onRemovePort).toHaveBeenCalledTimes(1)
      expect(props.onRemovePort).toHaveBeenCalledWith(ports[0])
    })
  })

  it('calls the onEdit function when the "Edit" button is clicked', () => {
    props.onEdit = jest.fn()

    const { getAllByTestId } = render(<FlowCreatePort {...props} />)
    const editButtons = getAllByTestId('edit-button')
    fireEvent.click(editButtons[0])
    expect(props.onEdit).toHaveBeenCalledWith(ports[0])
  })

  it('calls the onBack function when the "Back" button is clicked', () => {
    props.onBack = jest.fn()
    const { getByText } = render(<FlowCreatePort {...props} />)
    const backButton = getByText('Back')
    fireEvent.click(backButton)
    expect(props.onBack).toHaveBeenCalled()
  })

  it('calls the onSubmit function when the "Continue" button is clicked', () => {
    props.onSubmit = jest.fn()
    const { getByTestId } = render(<FlowCreatePort {...props} />)
    const continueButton = getByTestId('button-submit')
    fireEvent.click(continueButton)
    expect(props.onSubmit).toHaveBeenCalled()
  })

  it('should submit the form', async () => {
    const { getAllByTestId } = render(
      wrapWithReactHookForm(<FlowCreatePort {...props} />, { defaultValues: { ports: props.ports } })
    )

    const button = getAllByTestId('button-submit')[0]
    expect(button).not.toBeDisabled()

    button.click()

    expect(props.onSubmit).toHaveBeenCalled()
  })
})
