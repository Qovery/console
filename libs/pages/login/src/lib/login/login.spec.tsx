import { AuthEnum, useAuth } from '@qovery/shared/auth'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import useAuth0Error from '../hooks/auth0-error/use-auth0-error'
import { Login } from './login'

jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@qovery/shared/auth'),
  useAuth: jest.fn(),
}))

jest.mock('../hooks/auth0-error/use-auth0-error', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseAuth0Error = useAuth0Error as jest.MockedFunction<typeof useAuth0Error>

describe('Login', () => {
  const mockAuthLogin = jest.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      authLogin: mockAuthLogin,
    } as unknown as ReturnType<typeof useAuth>)
    mockUseAuth0Error.mockReturnValue({
      auth0Error: null,
      setAuth0Error: jest.fn(),
    })
  })

  it('should render login view', () => {
    const { baseElement } = renderWithProviders(<Login />)

    expect(baseElement).toBeTruthy()
    expect(screen.getByText('Connect to your workspace')).toBeInTheDocument()
  })

  it('should call authLogin with github provider', async () => {
    const { userEvent } = renderWithProviders(<Login />)

    await userEvent.click(screen.getByText('Continue with Github'))

    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith(AuthEnum.GITHUB)
    })
  })

  it('should show SSO form and connect with processed domain', async () => {
    const { userEvent } = renderWithProviders(<Login />)

    await userEvent.click(screen.getByText('Continue with SAML SSO'))

    expect(screen.getByText('Enterprise singe sign-on')).toBeInTheDocument()

    const domainField = screen.getByLabelText('Company domain')
    await userEvent.clear(domainField)
    await userEvent.type(domainField, 'example.com')
    await userEvent.click(screen.getByText('Connect'))

    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith('examplecom')
    })
  })

  it('should display auth0 error when present', () => {
    mockUseAuth0Error.mockReturnValue({
      auth0Error: {
        error: 'SSO Connection Error',
        error_description: 'The SSO connection failed. Please check your domain and try again.',
      },
      setAuth0Error: jest.fn(),
    })

    renderWithProviders(<Login />)

    expect(screen.getByText('SSO Connection Error')).toBeInTheDocument()
    expect(screen.getByText('The SSO connection failed. Please check your domain and try again.')).toBeInTheDocument()
  })
})
