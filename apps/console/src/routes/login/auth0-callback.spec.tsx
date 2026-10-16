import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Route } from './auth0-callback'

let mockSearch: Record<string, string | undefined> = {}
let mockIsAuthenticated = false
let mockOrganizations: { id: string }[] = []
let mockIsFetchedOrganizations = false
const mockNavigate = jest.fn()
const mockConsumePendingReturnTo = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  createFileRoute: () => (options: { component: unknown }) => ({
    options,
    useSearch: () => mockSearch,
  }),
  useNavigate: () => mockNavigate,
  Navigate: ({ to, search }: { to: string; search: { redirect: string } }) => (
    <div data-testid="navigate">{`${to}?redirect=${search.redirect}`}</div>
  ),
}))
jest.mock('@auth0/auth0-react', () => ({
  ...jest.requireActual('@auth0/auth0-react'),
  Auth0Provider: ({ children }: { children: React.ReactNode }) => children,
  useAuth0: () => ({ isAuthenticated: mockIsAuthenticated }),
}))
jest.mock('@qovery/domains/organizations/feature', () => ({
  useOrganizations: () => ({ data: mockOrganizations, isFetched: mockIsFetchedOrganizations }),
}))
jest.mock('../../auth/auth0', () => ({
  ...jest.requireActual('../../auth/auth0'),
  consumePendingReturnTo: () => mockConsumePendingReturnTo(),
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
    mockIsAuthenticated = false
    mockOrganizations = []
    mockIsFetchedOrganizations = false
    mockNavigate.mockClear()
    mockConsumePendingReturnTo.mockReset()
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

  it('opens profile setup as soon as organizations are loaded for a new user', () => {
    mockSearch = {}
    mockIsAuthenticated = true
    mockIsFetchedOrganizations = true

    renderWithProviders(<RouteComponent />)

    expect(mockNavigate).toHaveBeenCalledWith({ href: '/onboarding/personalize' })
  })

  it('waits for organizations before selecting a destination', () => {
    mockSearch = {}
    mockIsAuthenticated = true

    renderWithProviders(<RouteComponent />)

    expect(mockNavigate).not.toHaveBeenCalled()
    expect(mockConsumePendingReturnTo).not.toHaveBeenCalled()
  })

  it('preserves invitation links for users without organizations', () => {
    mockSearch = {}
    mockIsAuthenticated = true
    mockIsFetchedOrganizations = true
    mockConsumePendingReturnTo.mockReturnValue('/accept-invitation?invitation=123')

    renderWithProviders(<RouteComponent />)

    expect(mockNavigate).toHaveBeenCalledWith({ href: '/accept-invitation?invitation=123' })
  })

  it('preserves the requested destination for users with an organization', () => {
    mockSearch = {}
    mockIsAuthenticated = true
    mockIsFetchedOrganizations = true
    mockOrganizations = [{ id: 'organization-123' }]
    mockConsumePendingReturnTo.mockReturnValue('/organization/organization-123/projects')

    renderWithProviders(<RouteComponent />)

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/organization/organization-123/projects' })
  })
})
