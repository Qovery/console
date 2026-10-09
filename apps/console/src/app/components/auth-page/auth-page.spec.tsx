import posthog from 'posthog-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AuthPage } from './auth-page'

const mockAuthLogin = jest.fn()

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  Link: ({ children, href }: { children: React.ReactNode; href?: string }) => <a href={href}>{children}</a>,
}))
jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@qovery/shared/auth'),
  useAuth: () => ({ authLogin: mockAuthLogin }),
}))

const SIGN_UP_TITLE = 'Create your account'
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
    mockAuthLogin.mockResolvedValue(undefined)
  })

  describe('display logic', () => {
    it('shows the sign-up screen on /signup', () => {
      localStorage.setItem('lastUsedLogin', 'github')

      renderWithProviders(<AuthPage page="signup" />)

      expect(screen.getByRole('heading', { name: SIGN_UP_TITLE })).toBeInTheDocument()
      expect(getCaptures('auth_page_viewed')).toEqual([{ page: 'signup', has_last_used: true }])
    })

    it('always shows the login screen on /login', () => {
      renderWithProviders(<AuthPage page="login" />)

      expect(screen.getByText(LOGIN_TITLE)).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: SIGN_UP_TITLE })).not.toBeInTheDocument()
      expect(getCaptures('auth_page_viewed')).toEqual([{ page: 'login', has_last_used: false }])
    })
  })

  describe('sign-up screen', () => {
    it('shows the header, the providers and the certifications', () => {
      renderWithProviders(<AuthPage page="signup" />)

      expect(screen.getByRole('link', { name: /Back to website/ })).toHaveAttribute('href', 'https://www.qovery.com')
      expect(screen.getByAltText('Qovery logo black')).toBeInTheDocument()
      expect(screen.getByText('Try Qovery free for 14 days, no credit card required.')).toBeInTheDocument()
      expect(screen.queryByText(/Trusted by/)).not.toBeInTheDocument()
      for (const certification of ['SOC 2', 'HIPAA', 'AWS Partner', 'DORA', 'GDPR']) {
        expect(screen.getByAltText(`${certification} logo`)).toBeInTheDocument()
      }

      expect(screen.getByRole('button', { name: 'Sign up with Google' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign up with GitHub' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign up with Bitbucket' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign up with GitLab' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign up with Microsoft' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Continue with SAML SSO/ })).toBeInTheDocument()
      expect(screen.queryByText(/demo/i)).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute(
        'href',
        'https://www.qovery.com/terms'
      )
      expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
        'href',
        'https://www.qovery.com/privacy'
      )
    })

    it('signs up with the same Auth0 connection and keeps the redirect', async () => {
      const { userEvent } = renderWithProviders(<AuthPage page="signup" redirect="/organization/123/overview" />)

      await userEvent.click(screen.getByRole('button', { name: 'Sign up with GitHub' }))

      expect(mockAuthLogin).toHaveBeenCalledWith('github', '/organization/123/overview')
      expect(localStorage.getItem('lastUsedLogin')).toBe('github')
      expect(JSON.parse(sessionStorage.getItem('auth_entry') ?? '')).toEqual({
        screen: 'signup',
        redirect: '/organization/123/overview',
      })
      expect(getCaptures('auth_provider_clicked')).toEqual([{ page: 'signup', provider: 'github' }])
    })

    it.each([
      ['Bitbucket', 'bitbucket', 'bitbucket'],
      ['GitLab', 'Gitlab', 'gitlab'],
      ['Microsoft', 'windowslive', 'microsoft'],
    ])('signs up with %s', async (name, connection, provider) => {
      const { userEvent } = renderWithProviders(<AuthPage page="signup" />)

      await userEvent.click(screen.getByRole('button', { name: `Sign up with ${name}` }))

      expect(mockAuthLogin).toHaveBeenCalledWith(connection, '/')
      expect(localStorage.getItem('lastUsedLogin')).toBe(connection)
      expect(getCaptures('auth_provider_clicked')).toEqual([{ page: 'signup', provider }])
    })

    it('opens the existing SAML flow from the Enterprise SSO link', async () => {
      const { userEvent } = renderWithProviders(<AuthPage page="signup" />)

      await userEvent.click(screen.getByRole('button', { name: /Continue with SAML SSO/ }))
      await userEvent.type(screen.getByLabelText('Company domain'), 'acme.com')
      await userEvent.click(screen.getByRole('button', { name: 'Connect' }))

      expect(mockAuthLogin).toHaveBeenCalledWith('acme', '/')
      expect(localStorage.getItem('lastUsedLogin')).toBe('saml_sso')
      expect(getCaptures('auth_provider_clicked')).toEqual([{ page: 'signup', provider: 'saml' }])
    })

    it('submits the SSO form with Enter', async () => {
      const { userEvent } = renderWithProviders(<AuthPage page="signup" />)

      await userEvent.click(screen.getByRole('button', { name: /Continue with SAML SSO/ }))
      await userEvent.type(screen.getByLabelText('Company domain'), 'acme.com{Enter}')

      expect(mockAuthLogin).toHaveBeenCalledWith('acme', '/')
    })

    it('lets the visitor retry when the redirection to Auth0 fails', async () => {
      mockAuthLogin.mockRejectedValueOnce(new Error('network'))
      const { userEvent } = renderWithProviders(<AuthPage page="signup" />)

      await userEvent.click(screen.getByRole('button', { name: 'Sign up with Google' }))
      await userEvent.click(screen.getByRole('button', { name: 'Sign up with Google' }))

      expect(mockAuthLogin).toHaveBeenCalledTimes(2)
    })

    it('goes back to the sign-up screen from the SSO form', async () => {
      const { userEvent } = renderWithProviders(<AuthPage page="signup" />)

      await userEvent.click(screen.getByRole('button', { name: /Continue with SAML SSO/ }))
      await userEvent.click(screen.getByRole('button', { name: 'Change login method' }))

      expect(screen.getByRole('button', { name: 'Sign up with Google' })).toBeInTheDocument()
    })

    it('shows the current login screen with "Log in"', async () => {
      const { userEvent } = renderWithProviders(<AuthPage page="signup" />)

      await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

      expect(screen.getByText(LOGIN_TITLE)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Continue with SAML SSO/ })).toBeInTheDocument()
      expect(getCaptures('auth_secondary_cta_clicked')).toEqual([{ page: 'signup', cta: 'log_in_instead' }])
      expect(getCaptures('auth_page_viewed')).toHaveLength(1)
    })
  })

  it('gives an accessible name to the icon-only login providers', () => {
    renderWithProviders(<AuthPage page="login" />)

    expect(screen.getByRole('button', { name: 'Continue with Bitbucket' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue with GitLab' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue with Microsoft' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Back to website/ })).toHaveAttribute('href', 'https://www.qovery.com')
  })

  it('tracks provider clicks on the login screen', async () => {
    const { userEvent } = renderWithProviders(<AuthPage page="login" />)

    await userEvent.click(screen.getByRole('button', { name: /Continue with Google/ }))

    expect(mockAuthLogin).toHaveBeenCalledWith('google-oauth2', '/')
    expect(JSON.parse(sessionStorage.getItem('auth_entry') ?? '')).toEqual({ screen: 'login', redirect: '/' })
    expect(getCaptures('auth_provider_clicked')).toEqual([{ page: 'login', provider: 'google' }])
  })
})
