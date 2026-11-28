import { renderHook } from '__tests__/utils/setup-jest'
import axios, { AxiosHeaders, type AxiosInstance } from 'axios'
import { buildLoginRedirectUrl, isAuth0SessionError, useAuthInterceptor } from './auth-interceptor'

const mockGetAccessTokenSilently = jest.fn()
const mockLogout = jest.fn()

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => {
    return {
      getAccessTokenSilently: mockGetAccessTokenSilently,
      logout: mockLogout,
    }
  },
}))

describe('UseAuthInterceptor', () => {
  beforeEach(() => {
    mockGetAccessTokenSilently.mockResolvedValue('someAuthToken')
    mockLogout.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  it('should render successfully', () => {
    const { result } = renderHook(() => useAuthInterceptor(axios, 'some-url'))

    expect(result).toBeTruthy()
  })

  it('should add the authorization to the headers of the incoming request', async () => {
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com'))

    const requestHandler = requestUse.mock.calls[0][0]
    const config = await requestHandler({ url: '/organizations', headers: new AxiosHeaders() })

    expect(config.url).toBe('https://api.qovery.com/organizations')
    expect(config.headers.get('Authorization')).toBe('Bearer someAuthToken')
  })

  it('should clear the auth0 session before redirecting to login when the session cannot be renewed', async () => {
    const authError = createAuth0Error('missing_refresh_token')
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    const navigateToLogin = jest.fn()
    mockGetAccessTokenSilently.mockRejectedValue(authError)

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com', navigateToLogin))

    const requestHandler = requestUse.mock.calls[0][0]

    await expect(requestHandler({ url: '/organizations', headers: new AxiosHeaders() })).rejects.toBe(authError)
    expect(mockLogout).toHaveBeenCalledWith({ openUrl: false })
    expect(navigateToLogin).toHaveBeenCalledTimes(1)
    expect(mockLogout.mock.invocationCallOrder[0]).toBeLessThan(navigateToLogin.mock.invocationCallOrder[0])
  })

  it('should still redirect to login when clearing the auth0 session fails', async () => {
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const navigateToLogin = jest.fn()
    mockGetAccessTokenSilently.mockRejectedValue(createAuth0Error('login_required'))
    mockLogout.mockRejectedValue(new Error('logout failed'))

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com', navigateToLogin))

    const requestHandler = requestUse.mock.calls[0][0]

    await expect(requestHandler({ url: '/organizations', headers: new AxiosHeaders() })).rejects.toThrow(
      'login_required'
    )
    expect(navigateToLogin).toHaveBeenCalledTimes(1)
    consoleErrorSpy.mockRestore()
  })

  it('should redirect to login without clearing the session when silent token renewal fails for another reason', async () => {
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    const navigateToLogin = jest.fn()
    mockGetAccessTokenSilently.mockRejectedValue(createAuth0Error('timeout'))

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com', navigateToLogin))

    const requestHandler = requestUse.mock.calls[0][0]

    await expect(requestHandler({ url: '/organizations', headers: new AxiosHeaders() })).rejects.toThrow('timeout')
    expect(mockLogout).not.toHaveBeenCalled()
    expect(navigateToLogin).toHaveBeenCalledTimes(1)
  })

  it('should use the e2e auth token without asking auth0', async () => {
    window.localStorage.setItem('qovery-e2e-auth-token', 'e2eToken')
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    const navigateToLogin = jest.fn()

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com', navigateToLogin))

    const requestHandler = requestUse.mock.calls[0][0]
    const config = await requestHandler({ url: '/organizations', headers: new AxiosHeaders() })

    expect(config.headers.get('Authorization')).toBe('Bearer e2eToken')
    expect(mockGetAccessTokenSilently).not.toHaveBeenCalled()
    expect(mockLogout).not.toHaveBeenCalled()
    expect(navigateToLogin).not.toHaveBeenCalled()
  })

  it('should redirect to login when the API returns unauthorized', async () => {
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const navigateToLogin = jest.fn()

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com', navigateToLogin))

    const responseErrorHandler = responseUse.mock.calls[0][1]

    await expect(responseErrorHandler({ response: { status: 401, data: { status: 401 } } })).rejects.toMatchObject({
      code: '401',
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error', undefined)
    expect(mockLogout).toHaveBeenCalledWith({ openUrl: false })
    expect(navigateToLogin).toHaveBeenCalledTimes(1)
    consoleErrorSpy.mockRestore()
  })

  it('should not clear the auth0 session on unauthorized when using the e2e auth token', async () => {
    window.localStorage.setItem('qovery-e2e-auth-token', 'e2eToken')
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const navigateToLogin = jest.fn()

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com', navigateToLogin))

    const responseErrorHandler = responseUse.mock.calls[0][1]

    await expect(responseErrorHandler({ response: { status: 401, data: { status: 401 } } })).rejects.toMatchObject({
      code: '401',
    })
    expect(mockLogout).not.toHaveBeenCalled()
    expect(navigateToLogin).toHaveBeenCalledTimes(1)
    consoleErrorSpy.mockRestore()
  })

  it('should build the login redirect url from the current location', () => {
    expect(buildLoginRedirectUrl('/organization/123', '?tab=clusters', '#overview')).toBe(
      '/login?redirect=%2Forganization%2F123%3Ftab%3Dclusters%23overview'
    )
  })

  it.each(['login_required', 'missing_refresh_token', 'invalid_grant', 'consent_required'])(
    'should treat %s as a session error',
    (code) => {
      expect(isAuth0SessionError(createAuth0Error(code))).toBe(true)
    }
  )

  it.each([new Error('login_required'), createAuth0Error('timeout'), undefined, 'login_required'])(
    'should not treat %p as a session error',
    (error) => {
      expect(isAuth0SessionError(error)).toBe(false)
    }
  )
})

function createAuth0Error(code: string) {
  return Object.assign(new Error(code), { error: code, error_description: code })
}

function createAxiosInstanceMock(requestUse: jest.Mock, responseUse: jest.Mock): AxiosInstance {
  return {
    interceptors: {
      request: {
        use: requestUse,
        eject: jest.fn(),
      },
      response: {
        use: responseUse,
        eject: jest.fn(),
      },
    },
  } as unknown as AxiosInstance
}
