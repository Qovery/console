import { render, screen, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum, PortProtocolEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import CrudModal, { CrudModalProps } from './crud-modal'

const props: CrudModalProps = {
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  cloudProvider: CloudProviderEnum.AWS,
  isEdit: false,
}

describe('CrudModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<CrudModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  // it('should render the form for AWS provider with correct options', () => {
  //   render(wrapWithReactHookForm(<CrudModal {...props} />))

  //   const protocolSelect = screen.getByRole('combobox', {
  //     name: /protocol/i,
  //   })
  //   selectEvent.openMenu(protocolSelect)

  //   waitFor(() => {
  //     screen.getByLabelText('HTTP')
  //     screen.getByLabelText('UDP')
  //     screen.getByLabelText('TCP')
  //     screen.getByLabelText('GRPC')
  //   })
  // })

  // it('should render the form for SCW provider with correct options', () => {
  //   props.cloudProvider = CloudProviderEnum.SCW
  //   render(wrapWithReactHookForm(<CrudModal {...props} />))

  //   const protocolSelect = screen.getByRole('combobox', {
  //     name: /protocol/i,
  //   })
  //   selectEvent.openMenu(protocolSelect)

  //   waitFor(() => {
  //     expect(screen.queryByLabelText('UDP')).toBe(null)
  //     screen.getByLabelText('HTTP')
  //     screen.getByLabelText('TCP')
  //     screen.getByLabelText('GRPC')
  //   })
  // })

  // it('should render the form', async () => {
  //   const { getByDisplayValue } = render(
  //     wrapWithReactHookForm(<CrudModal {...props} />, {
  //       defaultValues: {
  //         internal_port: 99,
  //         external_port: 420,
  //         publicly_accessible: true,
  //         protocol: PortProtocolEnum.HTTP,
  //       },
  //     })
  //   )

  //   await waitFor(() => {
  //     getByDisplayValue(99)
  //     getByDisplayValue('true')
  //   })
  // })

  // it('should submit the form', async () => {
  //   const spy = jest.fn().mockImplementation((e) => e.preventDefault())
  //   props.onSubmit = spy
  //   const { findByTestId } = render(
  //     wrapWithReactHookForm(<CrudModal {...props} />, {
  //       defaultValues: {
  //         internal_port: 99,
  //         external_port: 420,
  //         publicly_accessible: true,
  //         protocol: PortProtocolEnum.HTTP,
  //       },
  //     })
  //   )

  //   const button = await findByTestId('submit-button')

  //   await waitFor(() => {
  //     button.click()
  //     expect(button).not.toBeDisabled()
  //     expect(spy).toHaveBeenCalled()
  //   })
  // })
})
