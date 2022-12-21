import { act, fireEvent, render, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import CreateProjectModal, { CreateProjectModalProps } from './create-project-modal'

describe('CreateProjectModal', () => {
  const props: CreateProjectModalProps = {
    onSubmit: jest.fn(),
    closeModal: jest.fn(),
    loading: false,
  }

  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<CreateProjectModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy

    const { getByTestId } = render(wrapWithReactHookForm(<CreateProjectModal {...props} />))

    const inputName = getByTestId('input-name')
    const inputDescription = getByTestId('input-description')
    const button = getByTestId('submit-button')

    expect(button).toBeDisabled()

    await act(() => {
      fireEvent.input(inputName, { target: { value: 'hello world' } })
      fireEvent.input(inputDescription, { target: { value: 'hello' } })
    })

    await waitFor(() => {
      button.click()
      expect(button).not.toBeDisabled()
      expect(spy).toHaveBeenCalled()
    })
  })
})
