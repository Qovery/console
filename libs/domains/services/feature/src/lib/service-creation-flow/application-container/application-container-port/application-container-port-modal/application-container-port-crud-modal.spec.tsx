import { PortProtocolEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationContainerPortCrudModal } from './application-container-port-crud-modal'

function TestApplicationContainerPortCrudModal() {
  const methods = useForm({
    defaultValues: {
      internal_port: '8080',
      external_port: undefined,
      publicly_accessible: false,
      protocol: PortProtocolEnum.HTTP,
      name: 'p8080',
      public_path: '',
      public_path_rewrite: '',
      rewrite_public_path: false,
    },
    mode: 'onChange',
  })

  return (
    <FormProvider {...methods}>
      <ApplicationContainerPortCrudModal hidePortName={false} onClose={jest.fn()} onSubmit={jest.fn()} />
    </FormProvider>
  )
}

describe('ApplicationContainerPortCrudModal', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should tab from the publicly exposed switch to the advanced port name field', async () => {
    const { userEvent } = renderWithProviders(<TestApplicationContainerPortCrudModal />)

    const publiclyExposedSwitch = screen.getByRole('switch', { name: 'Publicly exposed' })

    for (let index = 0; index < 5 && document.activeElement !== publiclyExposedSwitch; index++) {
      await userEvent.tab()
    }

    expect(publiclyExposedSwitch).toHaveFocus()

    await userEvent.keyboard(' ')

    expect(screen.getByLabelText('Port name')).toBeInTheDocument()

    await userEvent.tab()

    expect(screen.getByLabelText('Port name')).toHaveFocus()
  })
})
