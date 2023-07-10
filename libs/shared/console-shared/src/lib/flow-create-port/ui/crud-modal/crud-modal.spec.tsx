import { act, render, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { PortProtocolEnum } from 'qovery-typescript-axios'
import CrudModal, { CrudModalProps } from './crud-modal'

const props: CrudModalProps = {
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  port: {
    internal_port: 80,
    external_port: 433,
    publicly_accessible: false,
    protocol: PortProtocolEnum.HTTP,
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
        defaultValues: {
          internal_port: 99,
          external_port: 420,
          publicly_accessible: true,
          protocol: PortProtocolEnum.HTTP,
        },
      })
    )

    await act(jest.fn)

    await waitFor(() => {
      getByDisplayValue(99)
      getByDisplayValue('true')
    })
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { findByTestId } = render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          internal_port: 99,
          external_port: 420,
          publicly_accessible: true,
          protocol: PortProtocolEnum.HTTP,
        },
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
