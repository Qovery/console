import { Dialog } from '@radix-ui/react-dialog'
import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import ModalMultiConfirmation, { type ModalMultiConfirmationProps } from './modal-multi-confirmation'

const renderComponent = (props: ModalMultiConfirmationProps) => {
  return renderWithProviders(
    <Dialog>
      <ModalMultiConfirmation {...props} />
    </Dialog>
  )
}

describe('ModalMultiConfirmation', () => {
  let props: ModalMultiConfirmationProps

  beforeEach(() => {
    props = {
      title: 'my title',
      description: 'my description',
      checks: ['one', 'two'],
      callback: jest.fn(),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderComponent(props)
    expect(baseElement).toBeTruthy()
  })

  it('should render the validation checkboxes', () => {
    renderComponent(props)

    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()
  })

  it('should not submit until checkboxes are checked', async () => {
    const { userEvent } = renderComponent(props)

    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()

    // Checking the first confirmation checkbox
    await userEvent.click(screen.getByText('one'))

    // Making sure the submit button is disabled
    expect(screen.getByText('Confirm')).toBeDisabled()
  })

  it('should submit if all checkboxes are checked', async () => {
    const { userEvent } = renderComponent(props)

    // Checking the confirmation checkboxes
    await userEvent.click(screen.getByText('one'))
    await userEvent.click(screen.getByText('two'))

    // Making sure the submit button is enabled
    expect(screen.getByText('Confirm')).toBeEnabled()
  })

  it('should match delete mode without description', () => {
    props.description = undefined
    props.isDelete = true

    const { container } = renderComponent(props)

    expect(container).toMatchSnapshot()
  })
})
