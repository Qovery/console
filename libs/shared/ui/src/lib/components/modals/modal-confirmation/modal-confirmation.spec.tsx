import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import ModalConfirmation, { type ModalConfirmationProps } from './modal-confirmation'

describe('ModalConfirmation', () => {
  let props: ModalConfirmationProps

  beforeEach(() => {
    props = {
      title: 'my title',
      description: 'my description',
      name: 'staging',
      callback: jest.fn(),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<ModalConfirmation {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an action to copy the name', () => {
    props.name = 'production'

    render(<ModalConfirmation {...props} />)

    Object.assign(window.navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    })

    const copy = screen.queryByTestId('copy-cta') as HTMLSpanElement
    fireEvent.click(copy)

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('production')
  })

  it('should match delete mode without description', () => {
    props.description = undefined
    props.isDelete = true

    const { container } = render(<ModalConfirmation {...props} />)

    expect(container).toMatchSnapshot()
  })

  it('should match delete mode with description', () => {
    props.isDelete = true

    const { container } = render(<ModalConfirmation {...props} />)

    expect(container).toMatchSnapshot()
  })

  it('should match confirm mode with description', () => {
    const { container } = render(<ModalConfirmation {...props} />)

    expect(container).toMatchSnapshot()
  })

  it('should disable submit while async callback is pending', async () => {
    const callback = jest.fn(() => new Promise<void>(() => {}))
    const { userEvent } = render(
      <ModalConfirmation {...props} callback={callback} confirmationMethod="action" confirmationAction="delete" />
    )

    await userEvent.type(screen.getByPlaceholderText('Enter "delete"'), 'delete')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(callback).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })
})
