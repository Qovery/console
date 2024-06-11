import { render, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import StageModal, { type StageModalProps } from './stage-modal'

const props: StageModalProps = {
  onClose: jest.fn(),
  loading: false,
  onSubmit: jest.fn((e) => e.preventDefault()),
  isEdit: false,
}

describe('StageModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<StageModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    const { findByLabelText } = render(
      wrapWithReactHookForm(<StageModal {...props} />, {
        defaultValues: { name: 'name', description: 'description' },
      })
    )

    const inputName = await findByLabelText('Name')
    const inputDescription = await findByLabelText('Description (optional)')

    expect(inputName).toHaveValue('name')
    expect(inputDescription).toHaveValue('description')
  })

  it('should submit the form', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy
    const { findByTestId } = render(
      wrapWithReactHookForm(<StageModal {...props} />, {
        defaultValues: { name: 'name', description: 'description' },
      })
    )

    const button = await findByTestId('submit-button')

    await waitFor(() => {
      button.click()
      expect(button).toBeEnabled()
      expect(spy).toHaveBeenCalled()
    })
  })
})
