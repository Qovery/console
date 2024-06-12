import { render, screen } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum, PortProtocolEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { renderWithProviders } from '@qovery/shared/util-tests'
import CrudModal, { type CrudModalProps } from './crud-modal'

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

  it('should render the form for AWS provider with correct options', () => {
    render(wrapWithReactHookForm(<CrudModal {...props} />))

    const protocolSelect = screen.getByRole('combobox', {
      name: /protocol/i,
    })
    selectEvent.openMenu(protocolSelect)

    screen.getByLabelText('HTTP')
    screen.getByLabelText('UDP')
    screen.getByLabelText('TCP')
    screen.getByLabelText('GRPC')
  })

  it('should render the form for SCW provider with correct options', () => {
    props.cloudProvider = CloudProviderEnum.SCW
    render(wrapWithReactHookForm(<CrudModal {...props} />))

    const protocolSelect = screen.getByRole('combobox', {
      name: /protocol/i,
    })
    selectEvent.openMenu(protocolSelect)

    expect(screen.queryByLabelText('UDP')).not.toBeInTheDocument()
    screen.getByLabelText('HTTP')
    screen.getByLabelText('TCP')
    screen.getByLabelText('GRPC')
  })

  it('should render the form', async () => {
    render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          internal_port: 99,
          external_port: 420,
          publicly_accessible: true,
          protocol: PortProtocolEnum.HTTP,
        },
      })
    )

    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(await screen.findByRole('button', { name: /create/i })).toBeInTheDocument()
    screen.getByDisplayValue(99)
    screen.getByDisplayValue('true')
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          internal_port: 99,
          external_port: 420,
          publicly_accessible: true,
          protocol: PortProtocolEnum.HTTP,
        },
      })
    )

    const button = await screen.findByTestId('submit-button')

    await userEvent.click(button)
    expect(button).toBeEnabled()
    expect(spy).toHaveBeenCalled()
  })

  it('should warn when port is used as healthcheck', async () => {
    render(
      wrapWithReactHookForm(
        <CrudModal {...props} currentProtocol={PortProtocolEnum.HTTP} isMatchingHealthCheck={true} />,
        {
          defaultValues: {
            internal_port: 99,
            external_port: 420,
            publicly_accessible: true,
            protocol: PortProtocolEnum.HTTP,
          },
        }
      )
    )
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(await screen.findByRole('button', { name: /create/i })).toBeInTheDocument()
    screen.getByText('The health check will be updated to use the new port value.')
  })

  it('should warn when port is used as healthcheck and protocol change', async () => {
    render(
      wrapWithReactHookForm(
        <CrudModal {...props} currentProtocol={PortProtocolEnum.HTTP} isMatchingHealthCheck={true} />,
        {
          defaultValues: {
            internal_port: 99,
            external_port: 420,
            publicly_accessible: true,
            protocol: PortProtocolEnum.HTTP,
          },
        }
      )
    )

    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(await screen.findByRole('button', { name: /create/i })).toBeInTheDocument()

    const protocolSelect = screen.getByRole('combobox', {
      name: /protocol/i,
    })
    await selectEvent.select(protocolSelect, 'TCP', {
      container: document.body,
    })

    screen.getByText('Please verify the health check configuration.')
  })
})
