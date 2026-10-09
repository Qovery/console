import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Route } from './index'

const mockAuthLogin = jest.fn()

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))

jest.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: { component: unknown }) => ({
    options,
    useSearch: () => ({}),
  }),
  redirect: jest.fn(),
  Link: ({ children, href }: { children: React.ReactNode; href?: string }) => <a href={href}>{children}</a>,
}))
jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@qovery/shared/auth'),
  useAuth: () => ({ authLogin: mockAuthLogin }),
}))

const RouteComponent = Route.options.component as () => React.ReactNode

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    mockAuthLogin.mockReset()
    mockAuthLogin.mockResolvedValue(undefined)
  })

  it('opens the SSO form pre-filled with the last used domain', async () => {
    localStorage.setItem('lastUsedLogin', 'saml_sso')
    localStorage.setItem('lastUsedSsoDomain', 'acme.com')

    renderWithProviders(<RouteComponent />)

    expect(screen.getByText('Enterprise single sign-on')).toBeInTheDocument()
    expect(screen.getByLabelText('Company domain')).toHaveValue('acme.com')
    expect(screen.getByRole('button', { name: 'Connect' })).toBeEnabled()
  })

  it('shows the providers with the SAML badge when no domain was stored', () => {
    localStorage.setItem('lastUsedLogin', 'saml_sso')

    renderWithProviders(<RouteComponent />)

    expect(screen.getByText('Connect to your workspace')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue with SAML SSO/ })).toHaveTextContent('Last used')
  })

  it('does not mark SAML as last used when only opening the SSO form', async () => {
    const { userEvent } = renderWithProviders(<RouteComponent />)

    await userEvent.click(screen.getByRole('button', { name: /Continue with SAML SSO/ }))

    expect(screen.getByText('Enterprise single sign-on')).toBeInTheDocument()
    expect(localStorage.getItem('lastUsedLogin')).toBeNull()
  })

  it('stores the login method and domain on connect', async () => {
    const { userEvent } = renderWithProviders(<RouteComponent />)

    await userEvent.click(screen.getByRole('button', { name: /Continue with SAML SSO/ }))
    await userEvent.type(screen.getByLabelText('Company domain'), 'acme.com')
    await userEvent.click(screen.getByRole('button', { name: 'Connect' }))

    expect(mockAuthLogin).toHaveBeenCalledWith('acme', '/')
    expect(localStorage.getItem('lastUsedLogin')).toBe('saml_sso')
    expect(localStorage.getItem('lastUsedSsoDomain')).toBe('acme.com')
  })

  it('goes back to the providers with "Change login method" and keeps the domain when reopening SSO', async () => {
    localStorage.setItem('lastUsedLogin', 'saml_sso')
    localStorage.setItem('lastUsedSsoDomain', 'acme.com')
    const { userEvent } = renderWithProviders(<RouteComponent />)

    await userEvent.click(screen.getByRole('button', { name: 'Change login method' }))
    expect(await screen.findByText('Connect to your workspace')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Continue with SAML SSO/ }))
    expect(await screen.findByLabelText('Company domain')).toHaveValue('acme.com')
    expect(screen.getByRole('button', { name: 'Connect' })).toBeEnabled()
  })

  it('keeps the domain pre-filled after a login error but forgets it for the next visit', () => {
    localStorage.setItem('lastUsedLogin', 'saml_sso')
    localStorage.setItem('lastUsedSsoDomain', 'typo.com')
    sessionStorage.setItem('auth0_error', 'access_denied')
    sessionStorage.setItem('auth0_error_description', 'User is not allowed to access this application')

    renderWithProviders(<RouteComponent />)

    expect(screen.getByLabelText('Company domain')).toHaveValue('typo.com')
    expect(screen.getByText('access_denied')).toBeInTheDocument()
    expect(localStorage.getItem('lastUsedSsoDomain')).toBeNull()
  })
})
