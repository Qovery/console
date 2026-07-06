import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import StepPersonalize, { type StepPersonalizeProps } from './step-personalize'

describe('StepPersonalize', () => {
  let props: StepPersonalizeProps

  beforeEach(() => {
    props = {
      onSubmit: jest.fn(),
      authLogout: jest.fn(),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<StepPersonalize {...props} />, {
        defaultValues: {
          first_name: '',
          last_name: '',
          user_email: '',
          company_name: '',
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should require company name before continuing', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepPersonalize {...props} />, {
        defaultValues: {
          first_name: 'John',
          last_name: 'Doe',
          user_email: 'john.doe@example.com',
          company_name: '',
        },
      })
    )

    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Company name'), 'Acme Corp')

    await waitFor(() => expect(continueButton).toBeEnabled())
  })

  it('should reject personal email addresses', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepPersonalize {...props} />, {
        defaultValues: {
          first_name: 'John',
          last_name: 'Doe',
          user_email: '',
          company_name: 'Acme Corp',
        },
      })
    )

    const continueButton = screen.getByRole('button', { name: 'Continue' })
    const emailInput = screen.getByLabelText('Professional email address')

    await userEvent.type(emailInput, 'john.doe@gmail.com')
    await userEvent.tab()

    expect(await screen.findByText('Please enter your professional email address.')).toBeInTheDocument()
    expect(continueButton).toBeDisabled()

    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'john.doe@acme.com')

    await waitFor(() => expect(continueButton).toBeEnabled())
  })
})
