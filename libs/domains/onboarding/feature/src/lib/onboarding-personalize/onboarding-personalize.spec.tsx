import { useNavigate } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { PlanEnum } from 'qovery-typescript-axios'
import { createContext, useContext, useState } from 'react'
import { useCreateOrganization } from '@qovery/domains/organizations/feature'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { toast } from '@qovery/shared/ui'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { OnboardingProvider } from '../container/container'
import { OnboardingPersonalize } from './onboarding-personalize'

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
const authLogin = jest.fn()
const createUserSignUp = jest.fn()
const navigate = jest.fn()
const refetchUserSignUp = jest.fn()
const SignupFixtureContext = createContext<ReturnType<typeof useUserSignUp>['data']>(undefined)

function renderProfile() {
  return renderWithProviders(
    <OnboardingProvider>
      <OnboardingPersonalize />
    </OnboardingProvider>
  )
}

async function fillProfile() {
  const result = renderProfile()
  await result.userEvent.type(screen.getByLabelText('Company name'), ' Acme Corp ')
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
  return result
}

describe('OnboardingPersonalize', () => {
  afterEach(() => jest.useRealTimers())
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
      authLogin,
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

  it('blocks creation and offers sign in when neither source has an email', async () => {
    jest.mocked(useAuth).mockReturnValue({
      authLogin,
      getAccessTokenSilently: refreshToken,
      user: { sub: 'user-1', name: 'John Doe', email: '   ' },
    } as ReturnType<typeof useAuth>)
    const { userEvent } = renderProfile()
    await userEvent.type(screen.getByLabelText('Company name'), 'Acme Corp')
    expect(screen.getByRole('alert')).toHaveTextContent('Please sign in again to continue.')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Company name'), '{Enter}')
    expect(createUserSignUp).not.toHaveBeenCalled()
    expect(createOrganization).not.toHaveBeenCalled()
    expect(createProject).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Sign in again' }))
    expect(authLogin).toHaveBeenCalledWith(undefined, '/onboarding/personalize')
  })

  it('waits for signup data before showing a missing email error', () => {
    jest.mocked(useAuth).mockReturnValue({
      authLogin,
      user: { name: 'John Doe' },
      getAccessTokenSilently: refreshToken,
    } as ReturnType<typeof useAuth>)
    jest.mocked(useUserSignUp).mockReturnValue({
      isLoading: true,
      refetch: refetchUserSignUp,
    } as unknown as ReturnType<typeof useUserSignUp>)
    renderProfile()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
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

  it('resumes an already-created project after navigation fails and the page reloads', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    navigate.mockRejectedValueOnce(new Error('Navigation failed')).mockResolvedValue(undefined)
    const first = await fillProfile()
    await first.userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(consoleError).toHaveBeenCalled())
    first.unmount()
    const second = renderProfile()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    await second.userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(2))
    expect(createProject).toHaveBeenCalledTimes(1)
    expect(createOrganization).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(sessionStorage.getItem('onboarding-pending:user-1')).toBeNull())
    consoleError.mockRestore()
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

  it('silently creates the organization and its main project before opening the platform', async () => {
    const { userEvent } = await fillProfile()
    expect(screen.getByLabelText('Full name')).toHaveValue('John van Doe')
    expect(screen.queryByLabelText('Professional email address')).not.toBeInTheDocument()

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
      organizationRequest: { name: 'Acme Corp', plan: PlanEnum.BUSINESS_2025, admin_emails: ['john@acme.com'] },
    })
    expect(refreshToken).toHaveBeenCalledWith({ cacheMode: 'off' })
    expect(useCreateProject).toHaveBeenCalledWith({ silently: true })
    expect(createProject).toHaveBeenCalledWith({ organizationId: 'created-org', projectRequest: { name: 'main' } })
    expect(toast).not.toHaveBeenCalled()
    expect(createUserSignUp).toHaveBeenCalledWith(expect.objectContaining({ current_step: 'project' }))
    expect(posthog.capture).toHaveBeenCalledWith(
      'onboarding-organization-created',
      expect.objectContaining({ company_name: 'Acme Corp', plan: PlanEnum.BUSINESS_2025 })
    )
    expect(window.dataLayer).toContainEqual({ event: 'onboarding-organization-created', plan: PlanEnum.BUSINESS_2025 })
  })

  it.each(['gmail.com', 'gmail.co', 'proton.me'])(
    'uses the token email for personal accounts (%s) without requesting another email',
    async (domain) => {
      const email = `john@${domain}`
      jest
        .mocked(useAuth)
        .mockReturnValue({ getAccessTokenSilently: refreshToken, user: { name: 'John Doe', email } } as ReturnType<
          typeof useAuth
        >)
      const { userEvent } = await fillProfile()
      expect(screen.queryByLabelText('Professional email address')).not.toBeInTheDocument()
      expect(screen.getAllByRole('textbox')).toHaveLength(3)

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
      expect(screen.queryByLabelText('Professional email address')).not.toBeInTheDocument()

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
    expect(screen.queryByLabelText('Professional email address')).not.toBeInTheDocument()

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
            <OnboardingPersonalize />
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
    await userEvent.type(screen.getByLabelText('Phone number (optional)'), '+33123456789')

    await userEvent.click(screen.getByRole('button', { name: 'Load signup' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(screen.getByLabelText('Full name')).toHaveValue('Edited Name')
    expect(screen.getByLabelText('Company name')).toHaveValue('Edited company')
    expect(screen.getByLabelText('Phone number (optional)')).toHaveValue('+33123456789')
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
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    refetchUserSignUp.mockRejectedValue(new Error('Refresh failed'))
    const { userEvent } = await fillProfile()

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(refetchUserSignUp).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(navigate).not.toHaveBeenCalled()
    expect(posthog.capture).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Company name')).toHaveValue(' Acme Corp ')
    consoleError.mockRestore()
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
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    createOrganization.mockRejectedValue(new Error('Creation failed'))
    const { userEvent } = await fillProfile()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(createOrganization).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(screen.getByLabelText('Company name')).not.toHaveAttribute('readonly')
    expect(navigate).not.toHaveBeenCalled()
    expect(refreshToken).not.toHaveBeenCalled()
    expect(posthog.capture).not.toHaveBeenCalled()
    consoleError.mockRestore()
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
    expect(posthog.capture).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    finishProject({ id: 'created-project' })
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/organization/$organizationId/overview',
        params: { organizationId: 'created-org' },
      })
    )
    expect(toast).not.toHaveBeenCalled()
  })

  it('retries project creation in the same organization after a failure', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
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
    expect(toast).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('keeps the form editable and does not advance when saving fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    createUserSignUp.mockRejectedValue(new Error('Saving failed'))
    const { userEvent } = await fillProfile()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Company name')).toHaveValue(' Acme Corp ')
    expect(createOrganization).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
