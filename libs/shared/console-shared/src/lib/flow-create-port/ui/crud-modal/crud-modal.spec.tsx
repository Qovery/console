import { act, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import CrudModal, { CrudModalProps } from './crud-modal'

const props: CrudModalProps = {
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  port: {
    internal_port: 80,
    external_port: 433,
    publicly_accessible: false,
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
        defaultValues: { internal_port: 99, external_port: 420, publicly_accessible: true },
      })
    )

    await act(jest.fn)

    await waitFor(() => {
      getByDisplayValue(99)
      //getByDisplayValue(420)
      getByDisplayValue('true')
    })
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { findByTestId } = render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: { internal_port: 99, external_port: 420, publicly_accessible: true },
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
