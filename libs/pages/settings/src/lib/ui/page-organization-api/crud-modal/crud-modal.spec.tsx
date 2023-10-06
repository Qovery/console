import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CrudModal, { type CrudModalProps } from './crud-modal'

const props: CrudModalProps = {
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  availableRoles: [
    {
      id: 'ADMIN',
      name: 'Admin',
    },
    {
      id: 'USER',
      name: 'User',
    },
  ],
}

describe('CrudModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<CrudModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<CrudModal {...props} onSubmit={spy} />))

    const inputName = screen.getByRole('textbox', { name: /token name/i })
    await userEvent.type(inputName, 'test')

    const inputDescription = screen.getByRole('textbox', { name: /description/i })
    await userEvent.type(inputDescription, 'description')

    screen.getByDisplayValue('test')
    screen.getByDisplayValue('description')
    screen.getAllByDisplayValue('ADMIN')

    const submitButton = screen.getByRole('button', { name: /create/i })
    await userEvent.click(submitButton)

    expect(spy).toHaveBeenCalled()
  })
})
