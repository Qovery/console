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
})
