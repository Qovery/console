import { act, render, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import CreateModal, { type CreateModalProps } from './create-modal'

const props: CreateModalProps = {
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
}

describe('CreateModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<CreateModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<CreateModal {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
        },
      })
    )
    await act(() => {
      getByDisplayValue('hello')
      getByDisplayValue('description')
    })
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { findByTestId } = render(
      wrapWithReactHookForm(<CreateModal {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
        },
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
