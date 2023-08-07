import { act, waitFor } from '__tests__/utils/setup-jest'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import CrudModal, { CrudModalProps } from './crud-modal'

const props: CrudModalProps = {
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  route: {
    destination: '10.0.0.0/20',
    target: 'target',
    description: 'desc',
  },
}

describe('CrudModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<CrudModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: { destination: '10.0.0.0/20', target: 'target', description: 'desc' },
      })
    )

    await act(() => {
      getByDisplayValue('10.0.0.0/20')
      getByDisplayValue('target')
      getByDisplayValue('desc')
    })
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { findByTestId } = render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: { destination: '10.0.0.0/20', target: 'target', description: 'desc' },
      })
    )

    const button = await findByTestId('submit-button')

    await waitFor(() => {
      button.click()
      expect(button).not.toBeDisabled()
      expect(spy).toHaveBeenCalled()
    })
  })
})
