import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CreateProjectModal, { type CreateProjectModalProps } from './create-project-modal'

describe('CreateProjectModal', () => {
  const props: CreateProjectModalProps = {
    onSubmit: jest.fn(),
    closeModal: jest.fn(),
    loading: false,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<CreateProjectModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy

    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<CreateProjectModal {...props} />))

    const inputName = screen.getByTestId('input-name')
    const inputDescription = screen.getByTestId('input-description')
    const button = await screen.findByTestId('submit-button')

    expect(button).toBeDisabled()

    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'hello world')
    await userEvent.clear(inputDescription)
    await userEvent.type(inputDescription, 'hello')

    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    await userEvent.click(button)
    expect(spy).toHaveBeenCalled()
  })
})
