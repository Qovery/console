import { useNavigate } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { useContext } from 'react'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ContextOnboarding, OnboardingProvider } from '../container/container'
import { OnboardingPersonalize } from './onboarding-personalize'

jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@qovery/shared/auth'),
  useAuth: jest.fn(),
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: jest.fn(),
}))
jest.mock('posthog-js', () => ({ capture: jest.fn() }))
jest.mock('@qovery/domains/users-sign-up/feature', () => ({
  useUserSignUp: jest.fn(),
  useCreateUserSignUp: jest.fn(),
}))

const createUserSignUp = jest.fn()
const navigate = jest.fn()

function DraftOrganization() {
  const { organization_name } = useContext(ContextOnboarding)
  return <output data-testid="organization-draft">{organization_name}</output>
}

function renderProfile() {
  return renderWithProviders(
    <OnboardingProvider>
      <OnboardingPersonalize />
      <DraftOrganization />
    </OnboardingProvider>
  )
}

async function fillProfile() {
  const result = renderProfile()
  await result.userEvent.type(screen.getByLabelText('Company name'), ' Acme Corp ')
  await result.userEvent.type(screen.getByLabelText('Organization name'), ' Acme ')
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
  return result
}

describe('OnboardingPersonalize', () => {
  afterEach(() => jest.useRealTimers())
  beforeEach(() => {
    jest.useFakeTimers()
    jest
      .mocked(useAuth)
      .mockReturnValue({ isAuthenticated: true, user: { name: 'John van Doe', email: 'john@acme.com' } } as ReturnType<
        typeof useAuth
      >)
    jest.mocked(useNavigate).mockReturnValue(navigate)
    jest.mocked(useUserSignUp).mockReturnValue({ data: undefined } as ReturnType<typeof useUserSignUp>)
    jest
      .mocked(useCreateUserSignUp)
      .mockReturnValue({ mutateAsync: createUserSignUp } as unknown as ReturnType<typeof useCreateUserSignUp>)
    createUserSignUp.mockResolvedValue({})
  })

  it('prefills the full account name and sends the existing API and analytics fields', async () => {
    const { userEvent } = await fillProfile()
    expect(screen.getByLabelText('Full name')).toHaveValue('John van Doe')
    expect(screen.queryByLabelText('Professional email address')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/onboarding/use-cases' }))
    expect(createUserSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'John',
        last_name: 'van Doe',
        user_email: 'john@acme.com',
        company_name: 'Acme Corp',
        phone: '',
      })
    )
    expect(posthog.capture).toHaveBeenCalledWith(
      'onboarding-tailor-experience-completed',
      expect.objectContaining({ first_name: 'John', last_name: 'van Doe', company_name: 'Acme Corp' })
    )
    expect(screen.getByTestId('organization-draft')).toHaveTextContent('Acme')
  })

  it('requests a professional email for personal accounts', async () => {
    jest
      .mocked(useAuth)
      .mockReturnValue({ isAuthenticated: true, user: { name: 'John Doe', email: 'john@gmail.com' } } as ReturnType<
        typeof useAuth
      >)
    const { userEvent } = await renderProfile()
    expect(screen.getByLabelText('Professional email address')).toHaveValue('')
    await userEvent.type(screen.getByLabelText('Professional email address'), 'john@acme.com')
    await userEvent.type(screen.getByLabelText('Company name'), 'Acme')
    await userEvent.type(screen.getByLabelText('Organization name'), 'Acme')
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() =>
      expect(createUserSignUp).toHaveBeenCalledWith(expect.objectContaining({ user_email: 'john@acme.com' }))
    )
  })

  it('prevents duplicate submissions while saving', async () => {
    let finishSaving: (value: unknown) => void = () => undefined
    createUserSignUp.mockReturnValue(
      new Promise((resolve) => {
        finishSaving = resolve
      })
    )
    const { userEvent } = await fillProfile()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(createUserSignUp).toHaveBeenCalledTimes(1)
    finishSaving({})
    await waitFor(() => expect(navigate).toHaveBeenCalled())
  })

  it('keeps the form editable and does not advance when saving fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    createUserSignUp.mockRejectedValue(new Error('Saving failed'))
    const { userEvent } = await fillProfile()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Organization name')).toHaveValue(' Acme ')
    expect(screen.getByTestId('organization-draft')).toBeEmptyDOMElement()
    consoleError.mockRestore()
  })
})
