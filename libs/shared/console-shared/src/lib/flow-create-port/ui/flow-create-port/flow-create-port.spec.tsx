import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import FlowCreatePort, { FlowCreatePortProps } from './flow-create-port'

const props: FlowCreatePortProps = {
  onSubmit: jest.fn(),
  onBack: jest.fn(),
  onAddPort: jest.fn(),
  onRemovePort: jest.fn(),
  ports: [
    {
      application_port: 3000,
      external_port: 3000,
      is_public: false,
    },
    {
      application_port: 4000,
      external_port: 3000,
      is_public: true,
    },
  ],
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
    expect(props.onRemovePort).toHaveBeenCalledWith(props.ports[0])
  })

  it('calls the onEdit function when the "Edit" button is clicked', () => {
    props.onEdit = jest.fn()

    const { getAllByTestId } = render(<FlowCreatePort {...props} />)
    const editButtons = getAllByTestId('edit-button')
    fireEvent.click(editButtons[0])
    expect(props.onEdit).toHaveBeenCalledWith(props.ports[0])
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

    await act(jest.fn())

    const button = getAllByTestId('button-submit')[0]
    expect(button).not.toBeDisabled()

    await act(() => {
      button.click()
    })

    expect(props.onSubmit).toHaveBeenCalled()
  })
})
