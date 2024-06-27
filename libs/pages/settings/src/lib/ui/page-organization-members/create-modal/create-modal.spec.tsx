import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import selectEvent from 'react-select-event'
import { act, fireEvent, renderWithProviders, screen } from '@qovery/shared/util-tests'
import CreateModal, { type CreateModalProps } from './create-modal'

const props: CreateModalProps = {
  availableRoles: [
    {
      id: '1111-1111-1111-1111',
      name: 'ADMIN',
    },
    {
      id: '2222-2222-2222-2222',
      name: 'VIEWER',
    },
  ],
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
}

describe('CreateModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<CreateModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<CreateModal {...props} />, {
        defaultValues: {
          email: 'test@qovery.com',
          role_id: '1111-1111-1111-1111',
        },
      })
    )

    screen.getByDisplayValue('test@qovery.com')
    screen.getAllByDisplayValue('1111-1111-1111-1111')
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<CreateModal {...props} />, {
        defaultValues: {
          email: 'test@qovery.com',
          role_id: '1111-1111-1111-1111',
        },
      })
    )

    await act(() => {
      const inputEmail = screen.getByTestId('input-email')
      fireEvent.input(inputEmail, { target: { value: 'test-2@qovery.com' } })
      selectEvent.select(screen.getByTestId('input-role'), '2222-2222-2222-2222', { container: document.body })
    })

    const button = await screen.findByTestId('submit-button')
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    await userEvent.click(button)

    expect(spy).toHaveBeenCalled()
  })
})
