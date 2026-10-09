import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Route } from './auth0-callback'

let mockSearch: Record<string, string | undefined> = {}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  createFileRoute: () => (options: { component: unknown }) => ({
    options,
    useSearch: () => mockSearch,
  }),
  useNavigate: () => jest.fn(),
  Navigate: ({ to, search }: { to: string; search: { redirect: string } }) => (
    <div data-testid="navigate">{`${to}?redirect=${search.redirect}`}</div>
  ),
}))
jest.mock('@auth0/auth0-react', () => ({
  ...jest.requireActual('@auth0/auth0-react'),
  Auth0Provider: ({ children }: { children: React.ReactNode }) => children,
  useAuth0: () => ({ isAuthenticated: false }),
}))
jest.mock('@qovery/domains/organizations/feature', () => ({
  useOrganizations: () => ({ data: [], isFetched: false }),
}))
jest.mock('@qovery/domains/users-sign-up/feature', () => ({
  useUserSignUp: () => ({ refetch: jest.fn() }),
}))
jest.mock('@qovery/shared/utils', () => ({
  ...jest.requireActual('@qovery/shared/utils'),
  useAuthInterceptor: jest.fn(),
}))
jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@qovery/shared/auth'),
  useAuth: () => ({ authLogin: jest.fn() }),
}))

const RouteComponent = Route.options.component as () => React.ReactNode

describe('Auth0 callback', () => {
  beforeEach(() => {
    sessionStorage.clear()
    mockSearch = { error: 'access_denied', error_description: 'User cancelled' }
  })

  it('sends the visitor back to the sign-up page with their redirect when the sign-up was cancelled', () => {
    sessionStorage.setItem('auth_entry', JSON.stringify({ screen: 'signup', redirect: '/organization/123/overview' }))

    renderWithProviders(<RouteComponent />)

    expect(screen.getByTestId('navigate')).toHaveTextContent('/signup?redirect=/organization/123/overview')
    expect(sessionStorage.getItem('auth_entry')).toBeNull()
  })

  it('sends the visitor back to the login page otherwise', () => {
    sessionStorage.setItem('auth_entry', JSON.stringify({ screen: 'login', redirect: '/' }))

    renderWithProviders(<RouteComponent />)

    expect(screen.getByTestId('navigate')).toHaveTextContent('/login?redirect=/')
  })

  it('defaults to the login page when the entry screen is unknown', () => {
    renderWithProviders(<RouteComponent />)

    expect(screen.getByTestId('navigate')).toHaveTextContent('/login?redirect=/')
  })
})
