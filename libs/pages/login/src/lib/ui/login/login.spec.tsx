import { AuthEnum } from '@qovery/shared/auth'
import { fireEvent, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import useAuth0Error from '../../hooks/auth0-error/use-auth0-error'
import Login, { type ILoginProps } from './login'

// Mock the useAuth0Error hook
jest.mock('../../hooks/auth0-error/use-auth0-error', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    auth0Error: null,
    clearError: jest.fn(),
  })),
}))

const mockUseAuth0Error = useAuth0Error as jest.MockedFunction<typeof useAuth0Error>

function mockGlobal() {
  mockUseAuth0Error.mockReturnValue({
    auth0Error: {
      error: 'SSO Connection Error',
      error_description: 'The SSO connection failed. Please check your domain and try again.',
    },
    setAuth0Error: jest.fn(),
  })
}

describe('Login', () => {
  const mockOnClickAuthLogin = jest.fn()
  const props: ILoginProps = {
    onClickAuthLogin: mockOnClickAuthLogin,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    mockGlobal()
    const { baseElement } = renderWithProviders(<Login {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should call invitation detail if token are in the localStorage', async () => {
    mockGlobal()
    localStorage.setItem('inviteToken', 'token')
    renderWithProviders(<Login {...props} />)

    expect(screen.queryByText('Connect to Qovery')).not.toBeInTheDocument()
  })

  it('should display SSO connection error when auth0Error is present', () => {
    mockGlobal()
    renderWithProviders(<Login {...props} />)

    // Check that the error message is displayed
    expect(screen.getByText('SSO Connection Error')).toBeInTheDocument()
    expect(screen.getByText('The SSO connection failed. Please check your domain and try again.')).toBeInTheDocument()
  })

  describe('Authentication provider buttons', () => {
    beforeEach(() => {
      mockUseAuth0Error.mockReturnValue({
        auth0Error: null,
        setAuth0Error: jest.fn(),
      })
    })

    it('should call onClickAuthLogin with GITHUB when GitHub button is clicked', () => {
      renderWithProviders(<Login {...props} />)

      fireEvent.click(screen.getByText('Continue with Github'))

      expect(mockOnClickAuthLogin).toHaveBeenCalledTimes(1)
      expect(mockOnClickAuthLogin).toHaveBeenCalledWith(AuthEnum.GITHUB)
    })

    it('should call onClickAuthLogin with GOOGLE_SSO when Google button is clicked', () => {
      renderWithProviders(<Login {...props} />)

      fireEvent.click(screen.getByText('Continue with Google'))

      expect(mockOnClickAuthLogin).toHaveBeenCalledTimes(1)
      expect(mockOnClickAuthLogin).toHaveBeenCalledWith(AuthEnum.GOOGLE_SSO)
    })
  })

  describe('SSO Form', () => {
    beforeEach(() => {
      mockUseAuth0Error.mockReturnValue({
        auth0Error: null,
        setAuth0Error: jest.fn(),
      })
    })

    it('should go back from SSO form and reset form state', () => {
      renderWithProviders(<Login {...props} />)

      // First show the SSO form
      fireEvent.click(screen.getByText('Use Enterprise Single Sign-On'))

      // Enter something in the domain field
      const inputField = screen.getByPlaceholderText('Enter your domain (e.g., company.com)')
      fireEvent.change(inputField, { target: { value: 'test_1.domain' } })

      // Add an error message
      fireEvent.click(screen.getByText('Connect'))
      expect(screen.getByText('Invalid domain format')).toBeInTheDocument()

      // Click go back button
      fireEvent.click(screen.getByText('← Go back'))

      // Verify we're back to the main login view (SSO form is hidden)
      expect(screen.getByText('Use Enterprise Single Sign-On')).toBeInTheDocument()
      expect(screen.queryByText('Enterprise Single Sign-On')).not.toBeInTheDocument()

      // If we show the SSO form again, it should be reset
      fireEvent.click(screen.getByText('Use Enterprise Single Sign-On'))

      // Domain field should be empty
      const resetInputField = screen.getByPlaceholderText('Enter your domain (e.g., company.com)')
      expect(resetInputField).toHaveValue('')

      // Error message should be gone
      expect(screen.queryByText('Invalid domain format')).not.toBeInTheDocument()
    })
  })

  describe('validateAndConnect method', () => {
    beforeEach(() => {
      // Reset auth0Error mock for these tests
      mockUseAuth0Error.mockReturnValue({
        auth0Error: null,
        setAuth0Error: jest.fn(),
      })
    })

    it('should display error message for invalid domain format', async () => {
      renderWithProviders(<Login {...props} />)

      // Click to show SSO form
      fireEvent.click(screen.getByText('Use Enterprise Single Sign-On'))

      // Enter an invalid domain
      const inputField = screen.getByPlaceholderText('Enter your domain (e.g., company.com)')
      fireEvent.change(inputField, { target: { value: 'invalid..domain!' } })

      // Click connect button
      fireEvent.click(screen.getByText('Connect'))

      // Verify error message is displayed
      expect(screen.getByText('Invalid domain format')).toBeInTheDocument()

      // Verify onClickAuthLogin was not called
      expect(mockOnClickAuthLogin).not.toHaveBeenCalled()
    })

    it('should call onClickAuthLogin with processed domain for valid domain', async () => {
      renderWithProviders(<Login {...props} />)

      // Click to show SSO form
      fireEvent.click(screen.getByText('Use Enterprise Single Sign-On'))

      // Enter a valid domain
      const inputField = screen.getByPlaceholderText('Enter your domain (e.g., company.com)')
      fireEvent.change(inputField, { target: { value: 'example.com' } })

      // Click connect button
      fireEvent.click(screen.getByText('Connect'))

      // Verify onClickAuthLogin was called with the processed domain (dots removed)
      expect(mockOnClickAuthLogin).toHaveBeenCalledWith('examplecom')
    })
  })
})
