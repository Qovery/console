import { fireEvent, render } from '__tests__/utils/setup-jest'
import { act, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
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
    props.confirmationMethod = 'action'
    props.confirmationAction = 'delete'

    const { container } = render(<ModalConfirmation {...props} />)

    expect(container).toMatchSnapshot()
  })

  it('should match delete mode with description', () => {
    props.confirmationMethod = 'action'
    props.confirmationAction = 'delete'
    props.description = 'my description'
    const { container } = render(<ModalConfirmation {...props} />)

    expect(container).toMatchSnapshot()
  })

  it('should match confirm mode with description', () => {
    const { container } = render(<ModalConfirmation {...props} />)

    expect(container).toMatchSnapshot()
  })

  it('should disable submit while async callback is pending', async () => {
    let resolvePending!: () => void
    const callback = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePending = resolve
        })
    )
    const { userEvent } = renderWithProviders(
      <ModalConfirmation {...props} callback={callback} confirmationMethod="action" confirmationAction="delete" />
    )

    await userEvent.type(screen.getByPlaceholderText('Enter "delete"'), 'delete')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(callback).toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
    })

    await act(async () => {
      resolvePending()
    })
  })
})
