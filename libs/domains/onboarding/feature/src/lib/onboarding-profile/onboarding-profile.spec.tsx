import { useNavigate } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { PlanEnum } from 'qovery-typescript-axios'
import { createContext, useContext, useState } from 'react'
import { useCreateOrganization } from '@qovery/domains/organizations/feature'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { toast } from '@qovery/shared/ui'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { OnboardingProvider } from '../container/container'
import { OnboardingProfile } from './onboarding-profile'

jest.mock('@qovery/shared/ui', () => ({ ...jest.requireActual('@qovery/shared/ui'), toast: jest.fn() }))
jest.mock('@qovery/domains/projects/feature', () => ({ useCreateProject: jest.fn() }))

jest.mock('@qovery/domains/organizations/feature', () => ({ useCreateOrganization: jest.fn() }))

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

const createProject = jest.fn()
const createOrganization = jest.fn()
const refreshToken = jest.fn()
const createUserSignUp = jest.fn()
const navigate = jest.fn()
const refetchUserSignUp = jest.fn()
const SignupFixtureContext = createContext<ReturnType<typeof useUserSignUp>['data']>(undefined)

function renderProfile() {
  return renderWithProviders(
    <OnboardingProvider>
      <OnboardingProfile />
    </OnboardingProvider>
  )
}

async function renderFilledProfile(values: Record<string, string> = {}) {
  const result = renderProfile()
  const fields = {
    'Full name': values.full_name ?? 'John Doe',
    'Work email': values.user_email ?? 'john@acme.com',
    'Company name': values.company_name ?? 'Acme Corp',
    'Organization name (optional)': values.organization_name ?? 'Acme workspace',
  }
  for (const [label, value] of Object.entries(fields)) {
    await result.userEvent.clear(screen.getByLabelText(label))
    await result.userEvent.type(screen.getByLabelText(label), value)
  }
  return result
}

async function fillProfile() {
  const result = renderProfile()
  await result.userEvent.type(screen.getByLabelText('Company name'), ' Acme Corp ')
  await result.userEvent.type(screen.getByLabelText('Organization name (optional)'), ' Acme Workspace ')
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
  return result
}

describe('OnboardingProfile', () => {
  it('shows the five profile fields without additional onboarding steps', async () => {
    await renderFilledProfile()

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
    const { userEvent } = await renderFilledProfile({ [field]: '   ' })
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()

    await userEvent.clear(screen.getByLabelText(label))
    await userEvent.type(screen.getByLabelText(label), validValue)

    await waitFor(() => expect(continueButton).toBeEnabled())
  })

  it('rejects an invalid work email', async () => {
    const { userEvent } = await renderFilledProfile({ user_email: 'invalid' })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.clear(screen.getByLabelText('Work email'))
    await userEvent.type(screen.getByLabelText('Work email'), 'john@acme.com')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
  })

  it('requires both parts of the name for the signup API', async () => {
    const { userEvent } = await renderFilledProfile({ full_name: 'John' })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Full name'), ' van Doe')

    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
  })

  it('keeps phone optional but validates a supplied number', async () => {
    const { userEvent } = await renderFilledProfile()
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    await waitFor(() => expect(continueButton).toBeEnabled())

    await userEvent.type(screen.getByLabelText('Phone number (optional)'), 'invalid')
    expect(await screen.findByText('Please enter a valid phone number.')).toBeInTheDocument()
    expect(continueButton).toBeDisabled()

    await userEvent.clear(screen.getByLabelText('Phone number (optional)'))
    await waitFor(() => expect(continueButton).toBeEnabled())
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })
  beforeEach(() => {
    jest.useFakeTimers()
    delete window.dataLayer
    sessionStorage.clear()
    refreshToken.mockResolvedValue('refreshed-token')
    createOrganization.mockResolvedValue({ id: 'created-org' })
    createProject.mockResolvedValue({ id: 'created-project' })
    jest
      .mocked(useCreateProject)
      .mockReturnValue({ mutateAsync: createProject } as unknown as ReturnType<typeof useCreateProject>)
    jest
      .mocked(useCreateOrganization)
      .mockReturnValue({ mutateAsync: createOrganization } as unknown as ReturnType<typeof useCreateOrganization>)
    jest.mocked(useAuth).mockReturnValue({
      getAccessTokenSilently: refreshToken,
      user: { sub: 'user-1', name: 'John van Doe', email: 'john@acme.com' },
    } as ReturnType<typeof useAuth>)
    jest.mocked(useNavigate).mockReturnValue(navigate)
    jest
      .mocked(useUserSignUp)
      .mockReturnValue({ data: undefined, refetch: refetchUserSignUp } as unknown as ReturnType<typeof useUserSignUp>)
    refetchUserSignUp.mockResolvedValue({})
    jest
      .mocked(useCreateUserSignUp)
      .mockReturnValue({ mutateAsync: createUserSignUp } as unknown as ReturnType<typeof useCreateUserSignUp>)
    createUserSignUp.mockResolvedValue({})
  })

  it.each(['', '   '])('falls back to the saved name when the token name is %j', (name) => {
    jest.mocked(useAuth).mockReturnValue({
      getAccessTokenSilently: refreshToken,
      user: { sub: 'user-1', name, email: 'john@acme.com' },
    } as ReturnType<typeof useAuth>)
    jest.mocked(useUserSignUp).mockReturnValue({
      data: { first_name: 'Saved', last_name: 'Name' },
      refetch: refetchUserSignUp,
    } as unknown as ReturnType<typeof useUserSignUp>)
    renderProfile()
    expect(screen.getByLabelText('Full name')).toHaveValue('Saved Name')
  })

  it.each(['', '   '])('uses the company name when the organization name is %j', async (organizationName) => {
    const { userEvent } = renderProfile()
    await userEvent.type(screen.getByLabelText('Company name'), ' Acme Corp ')
    if (organizationName) {
      await userEvent.type(screen.getByLabelText('Organization name (optional)'), organizationName)
    }
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(navigate).toHaveBeenCalled())
    expect(createOrganization).toHaveBeenCalledWith({
      organizationRequest: { name: 'Acme Corp', plan: PlanEnum.BUSINESS_2025, admin_emails: ['john@acme.com'] },
    })
  })

  it('uses the entered work email and organization name independently of the company name', async () => {
    jest.mocked(useAuth).mockReturnValue({
      getAccessTokenSilently: refreshToken,
      user: { sub: 'user-1', name: 'John Doe' },
    } as ReturnType<typeof useAuth>)
    const { userEvent } = renderProfile()
    expect(screen.getByLabelText('Work email')).toHaveValue('')
    await userEvent.type(screen.getByLabelText('Company name'), 'Acme Corp')
    await userEvent.type(screen.getByLabelText('Organization name (optional)'), 'My workspace')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Work email'), 'edited@acme.com')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(navigate).toHaveBeenCalled())
    expect(createUserSignUp).toHaveBeenCalledWith(
      expect.objectContaining({ user_email: 'edited@acme.com', company_name: 'Acme Corp' })
    )
    expect(createOrganization).toHaveBeenCalledWith({
      organizationRequest: { name: 'My workspace', plan: PlanEnum.BUSINESS_2025, admin_emails: ['edited@acme.com'] },
    })
  })

  it('resumes after a reload without creating another organization or losing edited profile values', async () => {
    refreshToken.mockRejectedValueOnce(new Error('Token refresh failed'))
    const first = await fillProfile()
    await first.userEvent.clear(screen.getByLabelText('Full name'))
    await first.userEvent.type(screen.getByLabelText('Full name'), 'Edited Name')
    await first.userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(createOrganization).toHaveBeenCalledTimes(1)
    first.unmount()

    const second = renderProfile()
    expect(screen.getByLabelText('Full name')).toHaveValue('Edited Name')
    expect(screen.getByLabelText('Company name')).toHaveValue(' Acme Corp ')
    expect(screen.getByLabelText('Company name')).toHaveAttribute('readonly')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    await second.userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(navigate).toHaveBeenCalled())
    expect(createOrganization).toHaveBeenCalledTimes(1)
    expect(createUserSignUp).toHaveBeenCalledTimes(1)
    expect(createProject).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem('onboarding-pending:user-1')).toBeNull()
  })

  it('reports completion once across navigation retries and a reload', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    navigate
      .mockRejectedValueOnce(new Error('Navigation failed'))
      .mockRejectedValueOnce(new Error('Navigation failed again'))
      .mockResolvedValue(undefined)
    const first = await fillProfile()
    await first.userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(consoleError).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    await first.userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(consoleError).toHaveBeenCalledTimes(2))
    first.unmount()
    const second = renderProfile()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    await second.userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(3))
    expect(posthog.capture).toHaveBeenCalledTimes(2)
    expect(jest.mocked(posthog.capture).mock.calls.map(([event]) => event)).toEqual([
      'onboarding-tailor-experience-completed',
      'onboarding-organization-created',
    ])
    expect(window.dataLayer).toEqual([{ event: 'onboarding-organization-created', plan: PlanEnum.BUSINESS_2025 }])
    expect(createProject).toHaveBeenCalledTimes(1)
    expect(createOrganization).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(sessionStorage.getItem('onboarding-pending:user-1')).toBeNull())
  })

  it('preserves all submitted fields while retrying organization setup', async () => {
    const profile = {
      full_name: 'Saved Name',
      user_email: 'saved@acme.com',
      company_name: 'Saved company',
      organization_name: 'Saved workspace',
      phone: '+33123456789',
    }
    sessionStorage.setItem('onboarding-pending:user-1', JSON.stringify({ organizationId: 'existing-org', profile }))
    const { userEvent } = renderProfile()
    for (const [label, value] of [
      ['Full name', profile.full_name],
      ['Work email', profile.user_email],
      ['Company name', profile.company_name],
      ['Organization name (optional)', profile.organization_name],
      ['Phone number (optional)', profile.phone],
    ]) {
      const input = screen.getByLabelText(label)
      await userEvent.click(input)
      await userEvent.keyboard('{Control>}a{/Control}{Backspace}')
      await userEvent.type(input, 'Changed')
      expect(input).toHaveValue(value)
    }
  })

  it('resumes the previous profile format without creating another organization', async () => {
    sessionStorage.setItem(
      'onboarding-pending:user-1',
      JSON.stringify({
        organizationId: 'existing-org',
        projectId: 'existing-project',
        completionTracked: true,
        profile: { full_name: 'Saved Name', company_name: 'Saved company', phone: '' },
      })
    )
    const { userEvent } = renderProfile()
    expect(screen.getByLabelText('Work email')).toHaveValue('john@acme.com')
    expect(screen.getByLabelText('Organization name (optional)')).toHaveValue('Saved company')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/organization/$organizationId/overview',
        params: { organizationId: 'existing-org' },
      })
    )
    expect(createOrganization).not.toHaveBeenCalled()
    expect(createProject).not.toHaveBeenCalled()
  })

  it('does not restore another account’s pending organization', async () => {
    sessionStorage.setItem(
      'onboarding-pending:other-user',
      JSON.stringify({
        organizationId: 'other-org',
        profile: { full_name: 'Other User', company_name: 'Other company', phone: '' },
      })
    )
    const { userEvent } = await fillProfile()
    expect(screen.getByLabelText('Company name')).not.toHaveAttribute('readonly')
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(createOrganization).toHaveBeenCalledTimes(1))
    expect(createProject).toHaveBeenCalledWith({ organizationId: 'created-org', projectRequest: { name: 'main' } })
  })

  it('creates the organization and its main project before showing a success toast', async () => {
    const { userEvent } = await fillProfile()
    expect(screen.getByLabelText('Full name')).toHaveValue('John van Doe')

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/organization/$organizationId/overview',
        params: { organizationId: 'created-org' },
      })
    )
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
    expect(createOrganization).toHaveBeenCalledWith({
      organizationRequest: { name: 'Acme Workspace', plan: PlanEnum.BUSINESS_2025, admin_emails: ['john@acme.com'] },
    })
    expect(refreshToken).toHaveBeenCalledWith({ cacheMode: 'off' })
    expect(useCreateProject).toHaveBeenCalledWith({ silently: true })
    expect(createProject).toHaveBeenCalledWith({ organizationId: 'created-org', projectRequest: { name: 'main' } })
    expect(toast).toHaveBeenCalledWith('success', 'Your organization has been created')
    expect(createUserSignUp).toHaveBeenCalledWith(expect.objectContaining({ current_step: 'project' }))
    expect(posthog.capture).toHaveBeenCalledWith(
      'onboarding-organization-created',
      expect.objectContaining({ company_name: 'Acme Corp', plan: PlanEnum.BUSINESS_2025 })
    )
    expect(window.dataLayer).toContainEqual({ event: 'onboarding-organization-created', plan: PlanEnum.BUSINESS_2025 })
  })

  it.each(['gmail.com', 'gmail.co', 'proton.me'])(
    'uses the token email for personal accounts (%s) as the initial work email',
    async (domain) => {
      const email = `john@${domain}`
      jest
        .mocked(useAuth)
        .mockReturnValue({ getAccessTokenSilently: refreshToken, user: { name: 'John Doe', email } } as ReturnType<
          typeof useAuth
        >)
      const { userEvent } = await fillProfile()
      expect(screen.getAllByRole('textbox')).toHaveLength(5)

      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => expect(createUserSignUp).toHaveBeenCalledWith(expect.objectContaining({ user_email: email })))
      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith({
          to: '/organization/$organizationId/overview',
          params: { organizationId: 'created-org' },
        })
      )
    }
  )

  it.each(['saved@gmail.com', 'saved@old-company.com'])(
    'prioritizes the token identity over saved signup details (%s)',
    async (savedEmail) => {
      jest.mocked(useUserSignUp).mockReturnValue({
        data: { first_name: 'Saved', last_name: 'Name', user_email: savedEmail },
        refetch: refetchUserSignUp,
      } as unknown as ReturnType<typeof useUserSignUp>)
      const { userEvent } = await fillProfile()
      expect(screen.getByLabelText('Full name')).toHaveValue('John van Doe')

      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() =>
        expect(createUserSignUp).toHaveBeenCalledWith(
          expect.objectContaining({ first_name: 'John', last_name: 'van Doe', user_email: 'john@acme.com' })
        )
      )
    }
  )

  it('uses the saved email only when the token does not provide one', async () => {
    jest
      .mocked(useAuth)
      .mockReturnValue({ getAccessTokenSilently: refreshToken, user: { name: 'John Doe' } } as ReturnType<
        typeof useAuth
      >)
    jest
      .mocked(useUserSignUp)
      .mockReturnValue({ data: { user_email: 'john@acme.com' }, refetch: refetchUserSignUp } as unknown as ReturnType<
        typeof useUserSignUp
      >)
    const { userEvent } = await fillProfile()

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() =>
      expect(createUserSignUp).toHaveBeenCalledWith(expect.objectContaining({ user_email: 'john@acme.com' }))
    )
  })

  it('retains edits when signup details arrive without subscribing to dirtyFields', async () => {
    jest.mocked(useUserSignUp).mockImplementation(function useSignupFixture() {
      return { data: useContext(SignupFixtureContext), refetch: refetchUserSignUp } as unknown as ReturnType<
        typeof useUserSignUp
      >
    })
    function DelayedSignup() {
      const [signup, setSignup] = useState<ReturnType<typeof useUserSignUp>['data']>()
      return (
        <SignupFixtureContext.Provider value={signup}>
          <OnboardingProvider>
            <OnboardingProfile />
          </OnboardingProvider>
          <button
            onClick={() =>
              setSignup({
                first_name: 'Saved',
                last_name: 'Name',
                user_email: 'saved@acme.com',
                company_name: 'Saved company',
              } as ReturnType<typeof useUserSignUp>['data'])
            }
          >
            Load signup
          </button>
        </SignupFixtureContext.Provider>
      )
    }
    const { userEvent } = renderWithProviders(<DelayedSignup />)
    await userEvent.clear(screen.getByLabelText('Full name'))
    await userEvent.type(screen.getByLabelText('Full name'), 'Edited Name')
    await userEvent.type(screen.getByLabelText('Company name'), 'Edited company')
    await userEvent.clear(screen.getByLabelText('Work email'))
    await userEvent.type(screen.getByLabelText('Work email'), 'edited@acme.com')
    await userEvent.type(screen.getByLabelText('Organization name (optional)'), 'Edited workspace')
    await userEvent.type(screen.getByLabelText('Phone number (optional)'), '+33123456789')

    await userEvent.click(screen.getByRole('button', { name: 'Load signup' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(screen.getByLabelText('Full name')).toHaveValue('Edited Name')
    expect(screen.getByLabelText('Company name')).toHaveValue('Edited company')
    expect(screen.getByLabelText('Work email')).toHaveValue('edited@acme.com')
    expect(screen.getByLabelText('Organization name (optional)')).toHaveValue('Edited workspace')
    expect(screen.getByLabelText('Phone number (optional)')).toHaveValue('+33123456789')
  })

  it('keeps Continue loading through signup updates, resource creation and navigation', async () => {
    let finishOrganization: (value: unknown) => void = () => undefined
    let finishAccess: (value: unknown) => void = () => undefined
    let finishProject: (value: unknown) => void = () => undefined
    let finishNavigation: (value: unknown) => void = () => undefined
    createOrganization.mockReturnValue(
      new Promise((resolve) => {
        finishOrganization = resolve
      })
    )
    refreshToken.mockReturnValue(
      new Promise((resolve) => {
        finishAccess = resolve
      })
    )
    createProject.mockReturnValue(
      new Promise((resolve) => {
        finishProject = resolve
      })
    )
    navigate.mockReturnValue(
      new Promise((resolve) => {
        finishNavigation = resolve
      })
    )
    jest.mocked(useUserSignUp).mockImplementation(function useSignupFixture() {
      return { data: useContext(SignupFixtureContext), refetch: refetchUserSignUp } as unknown as ReturnType<
        typeof useUserSignUp
      >
    })
    function ProfileWithSignupRefresh() {
      const [signup, setSignup] = useState<ReturnType<typeof useUserSignUp>['data']>()
      return (
        <SignupFixtureContext.Provider value={signup}>
          <OnboardingProvider>
            <OnboardingProfile />
          </OnboardingProvider>
          <button
            onClick={() =>
              setSignup({
                first_name: 'John',
                last_name: 'van Doe',
                company_name: 'Acme Corp',
                user_email: 'john@acme.com',
              } as ReturnType<typeof useUserSignUp>['data'])
            }
          >
            Refresh signup
          </button>
        </SignupFixtureContext.Provider>
      )
    }
    const { userEvent } = renderWithProviders(<ProfileWithSignupRefresh />)
    await userEvent.type(screen.getByLabelText('Company name'), 'Acme Corp')
    await userEvent.type(screen.getByLabelText('Organization name (optional)'), 'Acme Workspace')
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    await waitFor(() => expect(continueButton).toBeEnabled())
    await userEvent.click(continueButton)
    await waitFor(() => expect(createOrganization).toHaveBeenCalledTimes(1))
    await userEvent.click(screen.getByRole('button', { name: 'Refresh signup' }))
    expect(continueButton).toBeDisabled()
    expect(within(continueButton).getByTestId('spinner')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Company name'), '{Enter}')
    expect(createUserSignUp).toHaveBeenCalledTimes(1)
    expect(createOrganization).toHaveBeenCalledTimes(1)

    finishOrganization({ id: 'created-org' })
    await waitFor(() => expect(refreshToken).toHaveBeenCalledTimes(1))
    expect(within(continueButton).getByTestId('spinner')).toBeInTheDocument()
    expect(continueButton).toBeDisabled()
    finishAccess('token')
    await waitFor(() => expect(createProject).toHaveBeenCalledTimes(1))
    expect(within(continueButton).getByTestId('spinner')).toBeInTheDocument()
    expect(continueButton).toBeDisabled()
    finishProject({ id: 'created-project' })
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
    expect(within(continueButton).getByTestId('spinner')).toBeInTheDocument()
    expect(continueButton).toBeDisabled()
    finishNavigation(undefined)
    await waitFor(() => expect(within(continueButton).queryByTestId('spinner')).not.toBeInTheDocument())
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

  it('waits for refreshed signup details before creating the organization', async () => {
    let finishRefetch: (value: unknown) => void = () => undefined
    refetchUserSignUp.mockReturnValue(
      new Promise((resolve) => {
        finishRefetch = resolve
      })
    )
    const { userEvent } = await fillProfile()

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(refetchUserSignUp).toHaveBeenCalledWith({ throwOnError: true, cancelRefetch: false }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    expect(navigate).not.toHaveBeenCalled()
    expect(createOrganization).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(createUserSignUp).toHaveBeenCalledTimes(1)

    finishRefetch({})
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/organization/$organizationId/overview',
        params: { organizationId: 'created-org' },
      })
    )
  })

  it('does not advance or report completion when the signup refresh fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    refetchUserSignUp.mockRejectedValue(new Error('Refresh failed'))
    const { userEvent } = await fillProfile()

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(refetchUserSignUp).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(navigate).not.toHaveBeenCalled()
    expect(toast).not.toHaveBeenCalled()
    expect(posthog.capture).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Company name')).toHaveValue(' Acme Corp ')
  })

  it('waits for organization creation before refreshing access and navigating', async () => {
    let finishCreation: (value: unknown) => void = () => undefined
    createOrganization.mockReturnValue(
      new Promise((resolve) => {
        finishCreation = resolve
      })
    )
    const { userEvent } = await fillProfile()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(createOrganization).toHaveBeenCalledTimes(1))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    expect(refreshToken).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()

    finishCreation({ id: 'created-org' })
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/organization/$organizationId/overview',
        params: { organizationId: 'created-org' },
      })
    )
  })

  it('keeps the profile editable when organization creation fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    createOrganization.mockRejectedValue(new Error('Creation failed'))
    const { userEvent } = await fillProfile()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(createOrganization).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(screen.getByLabelText('Company name')).not.toHaveAttribute('readonly')
    expect(navigate).not.toHaveBeenCalled()
    expect(refreshToken).not.toHaveBeenCalled()
    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it('retries access refresh without creating a second organization', async () => {
    refreshToken.mockRejectedValueOnce(new Error('Token refresh failed')).mockResolvedValue('refreshed-token')
    const { userEvent } = await fillProfile()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(refreshToken).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(screen.getByLabelText('Company name')).toHaveAttribute('readonly')
    expect(navigate).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/organization/$organizationId/overview',
        params: { organizationId: 'created-org' },
      })
    )
    expect(createOrganization).toHaveBeenCalledTimes(1)
    expect(createUserSignUp).toHaveBeenCalledTimes(1)
    expect(refreshToken).toHaveBeenCalledTimes(2)
  })

  it('waits for the main project before opening the platform', async () => {
    let finishProject: (value: unknown) => void = () => undefined
    createProject.mockReturnValue(
      new Promise((resolve) => {
        finishProject = resolve
      })
    )
    const { userEvent } = await fillProfile()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(createProject).toHaveBeenCalledTimes(1))
    expect(navigate).not.toHaveBeenCalled()
    expect(toast).not.toHaveBeenCalled()
    expect(posthog.capture).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    finishProject({ id: 'created-project' })
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/organization/$organizationId/overview',
        params: { organizationId: 'created-org' },
      })
    )
    expect(toast).toHaveBeenCalledWith('success', 'Your organization has been created')
  })

  it('retries project creation in the same organization after a failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    createProject
      .mockRejectedValueOnce(new Error('Project creation failed'))
      .mockResolvedValue({ id: 'created-project' })
    const { userEvent } = await fillProfile()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(createProject).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(navigate).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(navigate).toHaveBeenCalled())
    expect(createOrganization).toHaveBeenCalledTimes(1)
    expect(createUserSignUp).toHaveBeenCalledTimes(1)
    expect(createProject).toHaveBeenCalledTimes(2)
    expect(createProject).toHaveBeenLastCalledWith({ organizationId: 'created-org', projectRequest: { name: 'main' } })
    expect(toast).toHaveBeenCalledWith('success', 'Your organization has been created')
  })

  it('keeps the form editable and does not advance when saving fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    createUserSignUp.mockRejectedValue(new Error('Saving failed'))
    const { userEvent } = await fillProfile()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Company name')).toHaveValue(' Acme Corp ')
    expect(createOrganization).not.toHaveBeenCalled()
  })
})
