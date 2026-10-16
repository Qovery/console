import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import StepPersonalize, { type ProfileFormValues } from './step-personalize'

const defaultValues: ProfileFormValues = {
  full_name: 'John Doe',
  user_email: 'john.doe@acme.com',
  company_name: 'Acme Corp',
  organization_name: 'Acme',
  phone: '',
}

function renderProfile(values: Partial<ProfileFormValues> = {}, needsProfessionalEmail = false) {
  return renderWithProviders(
    wrapWithReactHookForm(<StepPersonalize onSubmit={jest.fn()} needsProfessionalEmail={needsProfessionalEmail} />, {
      defaultValues: { ...defaultValues, ...values },
    })
  )
}

describe('StepPersonalize', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())
  it('shows the four profile fields and the first step of the progress indicator', async () => {
    renderProfile()

    expect(screen.getByRole('heading', { name: 'Create your profile' })).toBeInTheDocument()
    expect(screen.getAllByRole('textbox')).toHaveLength(4)
    expect(screen.queryByLabelText('Professional email address')).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveValue(1)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
  })

  it.each([
    ['Full name', 'full_name', 'John Doe'],
    ['Company name', 'company_name', 'Acme'],
    ['Organization name', 'organization_name', 'Acme'],
  ])('requires a non-blank %s', async (label, field, validValue) => {
    const { userEvent } = renderProfile({ [field]: '   ' })
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()

    await userEvent.clear(screen.getByLabelText(label))
    await userEvent.type(screen.getByLabelText(label), validValue)

    await waitFor(() => expect(continueButton).toBeEnabled())
  })

  it('requires both parts of the name for the signup API', async () => {
    const { userEvent } = renderProfile({ full_name: 'John' })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Full name'), ' van Doe')

    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
  })

  it('keeps phone optional but validates a supplied number', async () => {
    const { userEvent } = renderProfile()
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    await waitFor(() => expect(continueButton).toBeEnabled())

    await userEvent.type(screen.getByLabelText('Phone number (optional)'), 'invalid')
    expect(await screen.findByText('Please enter a valid phone number.')).toBeInTheDocument()
    expect(continueButton).toBeDisabled()

    await userEvent.clear(screen.getByLabelText('Phone number (optional)'))
    await waitFor(() => expect(continueButton).toBeEnabled())
  })

  it.each(['gmail.com', 'gmail.co', 'proton.me'])(
    'rejects personal email addresses from %s when requesting a professional email',
    async (domain) => {
      const { userEvent } = renderProfile({ user_email: '' }, true)
      const emailInput = screen.getByLabelText('Professional email address')

      await userEvent.type(emailInput, `john.doe@${domain}`)
      await userEvent.tab()

      expect(await screen.findByText('Please enter your professional email address.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

      await userEvent.clear(emailInput)
      await userEvent.type(emailInput, 'john.doe@acme.com')

      await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    }
  )
})
