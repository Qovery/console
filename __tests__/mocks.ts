import { Auth0ProviderOptions } from '@auth0/auth0-react'
import { ComponentType } from 'react'

jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: Auth0ProviderOptions) => children,
  withAuthenticationRequired: (component: ComponentType) => component,
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

jest.mock('@uidotdev/usehooks', () => ({
  useDocumentTitle: jest.fn(),
  useClickAway: jest.fn(),
  useCopyToClipboard: () => [jest.fn(), jest.fn()],
  useDebounce: () => [jest.fn(), jest.fn()],
  useLocalStorage: (_, intialValue) => [intialValue, jest.fn()],
}))
