import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageUserGeneral, { type PageUserGeneralProps } from './page-user-general'

const mockSubmit = jest.fn().mockImplementation((e) => e.preventDefault())

describe('PageUserGeneral', () => {
  const props: PageUserGeneralProps = {
    onSubmit: mockSubmit,
    loading: false,
    accountOptions: [],
    picture: '/',
  }

  const defaultValues = {
    firstName: 'joe',
    lastName: 'doe',
    user_email: 'test@test.com',
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<PageUserGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render inputs', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<PageUserGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )

    screen.getByLabelText('First name')
    screen.getByLabelText('Last name')
    screen.getAllByLabelText('Account email')
    screen.getByLabelText('Communication email')
  })

  it('should submit the form', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageUserGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const inputEmail = screen.getByLabelText('Communication email')
    await userEvent.clear(inputEmail)
    await userEvent.type(inputEmail, 'test2@test.com')

    const submitButton = screen.getByRole('button', { name: 'Save' })
    expect(submitButton).toBeEnabled()

    await userEvent.click(submitButton)
    expect(mockSubmit).toHaveBeenCalled()
  })
})
