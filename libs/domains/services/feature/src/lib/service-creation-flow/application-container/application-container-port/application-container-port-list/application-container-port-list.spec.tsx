import { PortProtocolEnum } from 'qovery-typescript-axios'
import { type FormEvent } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationContainerPortList, type ApplicationContainerPortListProps } from './application-container-port-list'

const ports = [
  {
    application_port: 3000,
    external_port: 3000,
    is_public: false,
    protocol: PortProtocolEnum.HTTP,
    name: 'p3000',
  },
  {
    application_port: 4000,
    external_port: 4000,
    is_public: true,
    protocol: PortProtocolEnum.HTTP,
    name: 'p4000',
  },
]

const props: ApplicationContainerPortListProps = {
  onSubmit: jest.fn(),
  onBack: jest.fn(),
  onAddPort: jest.fn(),
  onRemovePort: jest.fn(),
  onEditPort: jest.fn(),
  ports,
}

describe('ApplicationContainerPortList', () => {
  beforeEach(() => {
    props.onSubmit = jest.fn()
    props.onBack = jest.fn()
    props.onAddPort = jest.fn()
    props.onRemovePort = jest.fn()
    props.onEditPort = jest.fn()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ApplicationContainerPortList {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('calls onAddPort when "Add port" button is clicked', async () => {
    const { userEvent } = renderWithProviders(<ApplicationContainerPortList {...props} />)
    await userEvent.click(screen.getByTestId('add-button'))
    expect(props.onAddPort).toHaveBeenCalledTimes(1)
  })

  it('calls onRemovePort when delete button is clicked', async () => {
    const { userEvent } = renderWithProviders(<ApplicationContainerPortList {...props} />)
    const deleteButtons = screen.getAllByTestId('delete-button')
    await userEvent.click(deleteButtons[0])
    expect(props.onRemovePort).toHaveBeenCalledWith(ports[0])
  })

  it('calls onEditPort when edit button is clicked', async () => {
    const { userEvent } = renderWithProviders(<ApplicationContainerPortList {...props} />)
    const editButtons = screen.getAllByTestId('edit-button')
    await userEvent.click(editButtons[0])
    expect(props.onEditPort).toHaveBeenCalledWith(ports[0])
  })

  it('does not submit parent form when edit button is clicked', async () => {
    const handleFormSubmit = jest.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault())
    const { userEvent } = renderWithProviders(
      <form onSubmit={handleFormSubmit}>
        <ApplicationContainerPortList {...props} />
      </form>
    )

    await userEvent.click(screen.getAllByTestId('edit-button')[0])

    expect(props.onEditPort).toHaveBeenCalledWith(ports[0])
    expect(handleFormSubmit).not.toHaveBeenCalled()
  })

  it('calls onBack when Back button is clicked', async () => {
    const { userEvent } = renderWithProviders(<ApplicationContainerPortList {...props} />)
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(props.onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit when Continue button is clicked', async () => {
    const { userEvent } = renderWithProviders(<ApplicationContainerPortList {...props} />)
    await userEvent.click(screen.getByTestId('button-submit'))
    expect(props.onSubmit).toHaveBeenCalledTimes(1)
  })
})
