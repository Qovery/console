import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import { renderWithProviders } from '@qovery/shared/util-tests'
import Modal, { type ModalContentProps, type ModalProps } from './modal'

function ControlledContent({ setOpen, setCloseDisabled }: ModalContentProps) {
  return (
    <>
      <button type="button" onClick={() => setOpen?.(false)}>
        Custom close
      </button>
      <button type="button" onClick={() => setCloseDisabled?.(true)}>
        Custom lock
      </button>
    </>
  )
}

describe('Modal', () => {
  let props: ModalProps

  beforeEach(() => {
    props = {
      trigger: <button data-testid="trigger-btn">Trigger</button>,
      children: <p>contenu</p>,
    }
  })
  it('should render successfully', () => {
    const { baseElement } = render(<Modal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should trigger the modal', () => {
    render(<Modal {...props} />)
    const trigger = screen.getAllByRole('button')[0]

    fireEvent.click(trigger)

    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()
  })

  it('should have accurate class name', () => {
    props.className = 'some-class-name'

    render(<Modal {...props} />)

    const trigger = screen.getAllByRole('button')[0]

    fireEvent.click(trigger)

    const modal = screen.getByRole('dialog')

    expect(modal).toHaveClass('some-class-name')
  })

  it('should be default open', () => {
    props.defaultOpen = true

    render(<Modal {...props} />)

    const modal = screen.getByRole('dialog')

    expect(modal).toBeInTheDocument()
  })

  it('preserves explicitly supplied content controls', async () => {
    const setOpen = jest.fn()
    const setCloseDisabled = jest.fn()

    const { userEvent } = renderWithProviders(
      <Modal defaultOpen>
        <ControlledContent setOpen={setOpen} setCloseDisabled={setCloseDisabled} />
      </Modal>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Custom close' }))
    await userEvent.click(screen.getByRole('button', { name: 'Custom lock' }))

    expect(setOpen).toHaveBeenCalledWith(false)
    expect(setCloseDisabled).toHaveBeenCalledWith(true)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not inject content controls into native elements', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation()

    render(
      <Modal defaultOpen>
        <div>Native content</div>
      </Modal>
    )

    const errors = consoleError.mock.calls.flat().join(' ')
    expect(errors).not.toContain('setOpen')
    expect(errors).not.toContain('setCloseDisabled')
    consoleError.mockRestore()
  })
})
