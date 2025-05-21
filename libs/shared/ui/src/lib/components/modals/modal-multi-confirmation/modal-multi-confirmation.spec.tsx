import { act, fireEvent, renderWithProviders, screen } from '@qovery/shared/util-tests'
import ModalMultiConfirmation, { type ModalMultiConfirmationProps } from './modal-multi-confirmation'

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
    const { baseElement } = renderWithProviders(<ModalMultiConfirmation {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the validation checkboxes', () => {
    renderWithProviders(<ModalMultiConfirmation {...props} />)

    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()
  })

  it('should not submit until checkboxes are checked', async () => {
    renderWithProviders(<ModalMultiConfirmation {...props} />)

    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()

    // Checking the first confirmation checkbox
    await act(() => {
      fireEvent.click(screen.getByText('one'))
    })

    // Making sure the submit button is disabled
    fireEvent.click(screen.getByText('Confirm'))
    expect(screen.getByText('Confirm')).toBeDisabled()
  })

  it('should submit if all checkboxes are checked', async () => {
    renderWithProviders(<ModalMultiConfirmation {...props} />)

    // Checking the confirmation checkboxes
    await act(() => {
      fireEvent.click(screen.getByText('one'))
      fireEvent.click(screen.getByText('two'))
    })

    fireEvent.click(screen.getByText('Confirm'))

    // Making sure the submit button is enabled
    expect(screen.getByText('Confirm')).toBeEnabled()
  })

  it('should match delete mode without description', () => {
    props.description = undefined
    props.isDelete = true

    const { container } = renderWithProviders(<ModalMultiConfirmation {...props} />)

    expect(container).toMatchSnapshot()
  })
})
