import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CustomDomainStatusEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import CrudModal, { type CrudModalProps } from './crud-modal'

const props: CrudModalProps = {
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  customDomain: {
    id: 'ae20a043-12d3-4e46-89f3-a665f3e486fe',
    created_at: '2022-08-10T14:55:21.382761Z',
    updated_at: '2022-08-10T14:55:21.382762Z',
    domain: 'test.qovery.com',
    validation_domain: 'test.qovery.com.zc531a994.rustrocks.cloud',
    status: CustomDomainStatusEnum.VALIDATION_PENDING,
    generate_certificate: false,
  },
}

describe('CrudModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<CrudModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<CrudModal {...props} />))

    const input = screen.getByRole('textbox', { name: /domain/i })
    await userEvent.type(input, 'test.qovery.com')

    const certificateToggle = screen.getAllByRole('checkbox')[0]
    await userEvent.click(certificateToggle)

    screen.getByDisplayValue('test.qovery.com')
    screen.getByDisplayValue('true')
  })

  it('renders a section with CNAME value', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<CrudModal {...props} />))

    const input = screen.getByRole('textbox', { name: /domain/i })
    await userEvent.type(input, 'test2.qovery.com')

    screen.getByText('test2.qovery.com CNAME')
    screen.getByText('*.test2.qovery.com CNAME')
  })

  it('renders a section with one CNAME value', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<CrudModal {...props} />))

    const input = screen.getByRole('textbox', { name: /domain/i })
    await userEvent.type(input, '*.qovery.com')

    screen.getByText('*.qovery.com CNAME')
  })

  it('should turn off generate_certificate when enabling use_cdn', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: { domain: 'test.qovery.com', generate_certificate: true, use_cdn: false },
      })
    )

    const [cdnToggle, certificateToggle] = screen.getAllByRole('checkbox')

    expect(cdnToggle).not.toBeChecked()
    expect(certificateToggle).toBeChecked()

    await userEvent.click(cdnToggle)

    expect(cdnToggle).toBeChecked()
    waitFor(() => expect(certificateToggle).not.toBeChecked())

    const btn = screen.getByRole('button', { name: /create/i })
    await userEvent.click(btn)

    expect(btn).toBeEnabled()
    expect(spy).toHaveBeenCalled()
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: { domain: 'test.qovery.com', generate_certificate: false },
      })
    )

    const btn = screen.getByRole('button', { name: /create/i })
    await userEvent.click(btn)

    expect(btn).toBeEnabled()
    expect(spy).toHaveBeenCalled()
  })
})
