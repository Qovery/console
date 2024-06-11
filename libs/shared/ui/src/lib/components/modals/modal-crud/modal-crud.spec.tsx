import { render, screen, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import ModalCrud, { type ModalCrudProps } from './modal-crud'

describe('ModalCrud', () => {
  let props: ModalCrudProps

  beforeEach(() => {
    props = {
      onSubmit: jest.fn().mockImplementation((e) => e.preventDefault()),
      onClose: jest.fn(),
      children: <p>hello</p>,
      title: 'My title',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ModalCrud {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form', async () => {
    render(wrapWithReactHookForm(<ModalCrud {...props} />))

    const button = screen.getByTestId('submit-button')

    await waitFor(() => {
      button.click()
      expect(button).toBeEnabled()
      expect(props.onSubmit).toHaveBeenCalled()
    })
  })

  it('should delete the form', async () => {
    props.isEdit = true
    props.onDelete = jest.fn()
    props.deleteButtonLabel = 'Delete this element'

    render(wrapWithReactHookForm(<ModalCrud {...props} />))

    const button = screen.getByTestId('delete-button')

    await waitFor(() => {
      button.click()
      expect(button).toHaveTextContent(props.deleteButtonLabel)
      expect(props.onDelete).toHaveBeenCalled()
    })
  })

  it('should cancel the form', async () => {
    const onClose = jest.fn()
    props.onClose = onClose
    render(wrapWithReactHookForm(<ModalCrud {...props} />))

    const button = screen.getByTestId('cancel-button')

    await waitFor(() => {
      button.click()
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('should disabled form confirm button', async () => {
    props.loading = true
    render(wrapWithReactHookForm(<ModalCrud {...props} />))

    const button = screen.getByTestId('submit-button')

    await waitFor(() => {
      button.click()
      expect(button).toBeEnabled()
    })
  })
})
