import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import StepPersonalize, { type ProfileFormValues } from './step-personalize'

const defaultValues: ProfileFormValues = {
  full_name: 'John Doe',
  user_email: 'john@acme.com',
  organization_name: 'Acme workspace',
  company_name: 'Acme Corp',
  phone: '',
}

function renderProfile(values: Partial<ProfileFormValues> = {}) {
  return renderWithProviders(
    wrapWithReactHookForm(<StepPersonalize onSubmit={jest.fn()} />, {
      defaultValues: { ...defaultValues, ...values },
    })
  )
}

describe('StepPersonalize', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())
  it('shows the five profile fields without additional onboarding steps', async () => {
    renderProfile()

    expect(screen.getByRole('heading', { name: 'Create your profile' })).toBeInTheDocument()
    expect(screen.getAllByRole('textbox')).toHaveLength(5)
    expect(screen.queryByLabelText('Professional email address')).not.toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.getAllByRole('textbox').map((input) => input.getAttribute('name'))).toEqual([
      'full_name',
      'user_email',
      'company_name',
      'phone',
      'organization_name',
    ])
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
  })

  it.each([
    ['Full name', 'full_name', 'John Doe'],
    ['Company name', 'company_name', 'Acme'],
    ['Work email', 'user_email', 'john@acme.com'],
  ])('requires a non-blank %s', async (label, field, validValue) => {
    const { userEvent } = renderProfile({ [field]: '   ' })
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()

    await userEvent.clear(screen.getByLabelText(label))
    await userEvent.type(screen.getByLabelText(label), validValue)

    await waitFor(() => expect(continueButton).toBeEnabled())
  })

  it('rejects an invalid work email', async () => {
    const { userEvent } = renderProfile({ user_email: 'invalid' })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.clear(screen.getByLabelText('Work email'))
    await userEvent.type(screen.getByLabelText('Work email'), 'john@acme.com')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
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

  it('preserves the submitted profile while retrying organization setup', async () => {
    const phone = '+33123456789'
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepPersonalize onSubmit={jest.fn()} readOnly />, {
        defaultValues: { ...defaultValues, phone },
      })
    )

    for (const [label, value] of [
      ['Full name', defaultValues.full_name],
      ['Company name', defaultValues.company_name],
      ['Work email', defaultValues.user_email],
      ['Organization name (optional)', defaultValues.organization_name],
      ['Phone number (optional)', phone],
    ]) {
      const input = screen.getByLabelText(label)

      await userEvent.click(input)
      await userEvent.keyboard('{Control>}a{/Control}{Backspace}')
      await userEvent.type(input, 'Changed')

      expect(input).toHaveValue(value)
    }
  })
})
