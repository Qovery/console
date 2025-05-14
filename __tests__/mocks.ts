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
  // Params are implicitly `any` and needed for the tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useLocalStorage: (_: any, intialValue: any) => [intialValue, jest.fn()],
  useNetworkState: () => ({
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    online: true,
    type: 'wifi',
  }),
}))

// Mocks required for the devops-copilot feature to prevent Jest from choking on ESM modules
// Mock 'mermaid' (used in devops-copilot visual rendering)
jest.mock('mermaid', () => ({
  initialize: jest.fn(),
  render: jest.fn(() => Promise.resolve({ svg: '' })),
}))

// Mock 'react-markdown' (used to render Markdown content in devops-copilot)
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => children,
}))

// Mock 'materialDark' theme from 'react-syntax-highlighter' (used in code blocks in devops-copilot)
jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  __esModule: true,
  materialDark: {},
}))

// Mock 'remark-gfm' (used with react-markdown in devops-copilot)
jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => () => {},
}))
