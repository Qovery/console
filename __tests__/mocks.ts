jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }) => children,
  withAuthenticationRequired: (component, _) => component,
  useAuth0: () => {
    return {
      isLoading: false,
      user: { sub: 'foobar' },
      isAuthenticated: true,
      logout: jest.fn(),
      loginWithPopup: jest.fn(),
      getAccessTokenSilently: jest.fn(),
    }
  },
}))
