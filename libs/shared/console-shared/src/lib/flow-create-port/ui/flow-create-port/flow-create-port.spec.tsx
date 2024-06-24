import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { PortProtocolEnum, type ServicePort } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import FlowCreatePort, { type FlowCreatePortProps } from './flow-create-port'

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
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<FlowCreatePort {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('calls the onAddPort function when the "Add Port" button is clicked', async () => {
    props.onAddPort = jest.fn()
    const { userEvent } = renderWithProviders(<FlowCreatePort {...props} isSetting />)
    const addButton = screen.getByTestId('add-button')
    await userEvent.click(addButton)
    expect(props.onAddPort).toHaveBeenCalled()
  })

  it('calls the onRemovePort function when the "Delete" button is clicked', async () => {
    props.onRemovePort = jest.fn()
    const { userEvent } = renderWithProviders(<FlowCreatePort {...props} />)
    const deleteButtons = screen.getAllByTestId('delete-button')
    await userEvent.click(deleteButtons[0])

    expect(props.onRemovePort).toHaveBeenCalledTimes(1)
    expect(props.onRemovePort).toHaveBeenCalledWith(ports[0], undefined)
  })

  it('calls the onEdit function when the "Edit" button is clicked', async () => {
    props.onEdit = jest.fn()

    const { userEvent } = renderWithProviders(<FlowCreatePort {...props} />)
    const editButtons = screen.getAllByTestId('edit-button')
    await userEvent.click(editButtons[0])
    expect(props.onEdit).toHaveBeenCalledWith(ports[0])
  })

  it('calls the onBack function when the "Back" button is clicked', async () => {
    props.onBack = jest.fn()
    const { userEvent } = renderWithProviders(<FlowCreatePort {...props} />)
    const backButton = screen.getByText('Back')
    await userEvent.click(backButton)
    expect(props.onBack).toHaveBeenCalled()
  })

  it('calls the onSubmit function when the "Continue" button is clicked', async () => {
    props.onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(<FlowCreatePort {...props} />)
    const continueButton = screen.getByTestId('button-submit')
    await userEvent.click(continueButton)
    expect(props.onSubmit).toHaveBeenCalled()
  })

  it('should submit the form', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<FlowCreatePort {...props} />, { defaultValues: { ports: props.ports } })
    )

    const button = screen.getAllByTestId('button-submit')[0]
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    await userEvent.click(button)

    expect(props.onSubmit).toHaveBeenCalled()
  })
})
