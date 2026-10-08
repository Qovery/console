import { act } from '@testing-library/react'
import posthog from 'posthog-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AuthPage } from './auth-page'
import { SIGNUP_PAGE_FLAG_TIMEOUT_MS } from './use-auth-page-variant'

const mockAuthLogin = jest.fn()
let mockFlagsLoaded = true

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
  getFeatureFlag: jest.fn(),
  onFeatureFlags: jest.fn(),
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  Link: ({ children, href }: { children: React.ReactNode; href?: string }) => <a href={href}>{children}</a>,
}))
jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@qovery/shared/auth'),
  useAuth: () => ({ authLogin: mockAuthLogin }),
}))

const SIGN_UP_TITLE = 'Create your free Qovery account'
const LOGIN_TITLE = 'Connect to your workspace'

function getCaptures(eventName: string) {
  return jest
    .mocked(posthog.capture)
    .mock.calls.filter(([name]) => name === eventName)
    .map(([, properties]) => properties)
}

describe('AuthPage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    mockFlagsLoaded = true
    mockAuthLogin.mockResolvedValue(undefined)
    jest.mocked(posthog.getFeatureFlag).mockReturnValue('control')
    // Called synchronously when flags are already loaded, like posthog-js does
    jest.mocked(posthog.onFeatureFlags).mockImplementation((callback) => {
      if (mockFlagsLoaded) {
        callback({}, {})
      }
      return jest.fn()
    })
  })

  describe('display logic', () => {
    it('always shows the sign-up screen on /signup without reading the flag', () => {
      localStorage.setItem('lastUsedLogin', 'github')

      renderWithProviders(<AuthPage page="signup" />)

      expect(screen.getByRole('heading', { name: SIGN_UP_TITLE })).toBeInTheDocument()
      expect(posthog.getFeatureFlag).not.toHaveBeenCalled()
      expect(getCaptures('auth_page_viewed')).toEqual([
        { variant: 'test', flag_variant: 'not_evaluated', page: 'signup', has_last_used: true },
      ])
    })

    it('shows the sign-up screen on /login to new visitors in the test group', () => {
      jest.mocked(posthog.getFeatureFlag).mockReturnValue('test')

      renderWithProviders(<AuthPage page="login" />)

      expect(screen.getByRole('heading', { name: SIGN_UP_TITLE })).toBeInTheDocument()
      expect(getCaptures('auth_page_viewed')).toEqual([
        { variant: 'test', flag_variant: 'test', page: 'login', has_last_used: false },
      ])
    })

    it('shows the login screen on /login to new visitors in the control group', () => {
      renderWithProviders(<AuthPage page="login" />)

      expect(screen.getByText(LOGIN_TITLE)).toBeInTheDocument()
      expect(getCaptures('auth_page_viewed')).toEqual([
        { variant: 'control', flag_variant: 'control', page: 'login', has_last_used: false },
      ])
    })

    it('shows the login screen to returning visitors without exposing them to the experiment', () => {
      jest.mocked(posthog.getFeatureFlag).mockReturnValue('test')
      localStorage.setItem('lastUsedLogin', 'google-oauth2')

      renderWithProviders(<AuthPage page="login" />)

      expect(screen.getByText(LOGIN_TITLE)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Continue with Google/ })).toHaveTextContent('Last used')
      expect(posthog.onFeatureFlags).not.toHaveBeenCalled()
      expect(posthog.getFeatureFlag).not.toHaveBeenCalled()
      expect(getCaptures('auth_page_viewed')).toEqual([
        { variant: 'control', flag_variant: 'not_evaluated', page: 'login', has_last_used: true },
      ])
    })

    it('falls back to control when the flag is neither control nor test', () => {
      jest.mocked(posthog.getFeatureFlag).mockReturnValue(undefined)

      renderWithProviders(<AuthPage page="login" />)

      expect(screen.getByText(LOGIN_TITLE)).toBeInTheDocument()
      expect(getCaptures('auth_page_viewed')[0]).toMatchObject({ variant: 'control', flag_variant: 'unavailable' })
    })

    it('waits for the flag with an empty card, then shows control after the timeout', () => {
      jest.useFakeTimers()
      mockFlagsLoaded = false

      renderWithProviders(<AuthPage page="login" />)

      expect(screen.getByTestId('auth-page-loading')).toBeInTheDocument()
      expect(screen.queryByText(LOGIN_TITLE)).not.toBeInTheDocument()
      expect(getCaptures('auth_page_viewed')).toEqual([])

      act(() => {
        jest.advanceTimersByTime(SIGNUP_PAGE_FLAG_TIMEOUT_MS)
      })

      expect(screen.getByText(LOGIN_TITLE)).toBeInTheDocument()
      expect(posthog.getFeatureFlag).not.toHaveBeenCalled()
      expect(getCaptures('auth_page_viewed')).toEqual([
        { variant: 'control', flag_variant: 'timeout', page: 'login', has_last_used: false },
      ])
      jest.useRealTimers()
    })
  })

  describe('sign-up screen', () => {
    it('shows the reassurance points, the providers and the secondary links', () => {
      renderWithProviders(<AuthPage page="signup" />)

      expect(screen.getByText('14 days free · no credit card')).toBeInTheDocument()
      expect(screen.getByText('Connect your AWS, GCP or Azure account in ~20 min')).toBeInTheDocument()
      expect(screen.getByText('Your first app live in ~30 min')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign up with Google' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign up with GitHub' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /SAML SSO/ })).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Book a 20-min demo' })).toHaveAttribute(
        'href',
        'https://www.qovery.com/talk-with-us'
      )
      expect(screen.getByRole('link', { name: 'Book a 20-min demo' })).toHaveAttribute('target', '_blank')
      expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument()
    })

    it('signs up with the same Auth0 connection and keeps the redirect', async () => {
      const { userEvent } = renderWithProviders(<AuthPage page="signup" redirect="/organization/123/overview" />)

      await userEvent.click(screen.getByRole('button', { name: 'Sign up with GitHub' }))

      expect(mockAuthLogin).toHaveBeenCalledWith('github', '/organization/123/overview')
      expect(localStorage.getItem('lastUsedLogin')).toBe('github')
      expect(getCaptures('auth_provider_clicked')).toEqual([
        { variant: 'test', flag_variant: 'not_evaluated', provider: 'github' },
      ])
    })

    it('opens the existing SAML flow from the Enterprise SSO link', async () => {
      const { userEvent } = renderWithProviders(<AuthPage page="signup" />)

      await userEvent.click(screen.getByRole('button', { name: 'Continue with Enterprise SSO' }))
      await userEvent.type(screen.getByLabelText('Company domain'), 'acme.com')
      await userEvent.click(screen.getByRole('button', { name: 'Connect' }))

      expect(mockAuthLogin).toHaveBeenCalledWith('acme', '/')
      expect(localStorage.getItem('lastUsedLogin')).toBe('saml_sso')
      expect(getCaptures('auth_provider_clicked')).toEqual([
        { variant: 'test', flag_variant: 'not_evaluated', provider: 'saml' },
      ])
    })

    it('goes back to the sign-up screen from the SSO form', async () => {
      const { userEvent } = renderWithProviders(<AuthPage page="signup" />)

      await userEvent.click(screen.getByRole('button', { name: 'Continue with Enterprise SSO' }))
      await userEvent.click(screen.getByRole('button', { name: 'Change login method' }))

      expect(await screen.findByRole('button', { name: 'Sign up with Google' })).toBeInTheDocument()
    })

    it('shows the current login screen with "Log in"', async () => {
      const { userEvent } = renderWithProviders(<AuthPage page="signup" />)

      await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

      expect(screen.getByText(LOGIN_TITLE)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Continue with SAML SSO/ })).toBeInTheDocument()
      expect(getCaptures('auth_secondary_cta_clicked')).toEqual([
        { variant: 'test', flag_variant: 'not_evaluated', cta: 'log_in_instead' },
      ])
      // Not a new page view
      expect(getCaptures('auth_page_viewed')).toHaveLength(1)
    })

    it('tracks the demo link', async () => {
      const { userEvent } = renderWithProviders(<AuthPage page="signup" />)

      await userEvent.click(screen.getByRole('link', { name: 'Book a 20-min demo' }))

      expect(getCaptures('auth_secondary_cta_clicked')).toEqual([
        { variant: 'test', flag_variant: 'not_evaluated', cta: 'book_demo' },
      ])
    })
  })

  it('tracks provider clicks on the login screen with the control variant', async () => {
    const { userEvent } = renderWithProviders(<AuthPage page="login" />)

    await userEvent.click(screen.getByRole('button', { name: /Continue with Google/ }))

    expect(mockAuthLogin).toHaveBeenCalledWith('google-oauth2', '/')
    expect(getCaptures('auth_provider_clicked')).toEqual([
      { variant: 'control', flag_variant: 'control', provider: 'google' },
    ])
  })
})
