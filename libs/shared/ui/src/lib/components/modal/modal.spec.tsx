import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import Modal, { type ModalProps } from './modal'

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
    expect(modal).toBeTruthy()
  })

  it('should have accurate class name', () => {
    props.className = 'some-class-name'

    render(<Modal {...props} />)

    const trigger = screen.getAllByRole('button')[0]

    fireEvent.click(trigger)

    const modal = screen.getByRole('dialog')

    expect(modal.classList.contains('some-class-name')).toBeTruthy()
  })

  it('should be default open', () => {
    props.defaultOpen = true

    render(<Modal {...props} />)

    const modal = screen.getByRole('dialog')

    expect(modal).toBeTruthy()
  })
})
