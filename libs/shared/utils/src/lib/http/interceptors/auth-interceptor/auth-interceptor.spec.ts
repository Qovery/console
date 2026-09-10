import { renderHook } from '__tests__/utils/setup-jest'
import axios, { AxiosHeaders, type AxiosInstance } from 'axios'
import { buildLoginRedirectUrl, useAuthInterceptor } from './auth-interceptor'

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

function navigateTo(pathname: string) {
  window.history.pushState({}, '', pathname)
}

// The auth failure handler is deliberately async (it awaits the session teardown), so the
// assertions have to let the microtask queue drain before inspecting the spies.
function flushAsyncWork() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('UseAuthInterceptor', () => {
  beforeEach(() => {
    mockGetAccessTokenSilently.mockResolvedValue('someAuthToken')
    mockLogout.mockResolvedValue(undefined)
    navigateTo('/')
  })

  afterEach(() => {
    jest.clearAllMocks()
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

  it('should redirect to login when silent token renewal fails', async () => {
    const authError = new Error('login_required')
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    const navigateToLogin = jest.fn()
    mockGetAccessTokenSilently.mockRejectedValue(authError)

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com', { navigateToLogin }))

    const requestHandler = requestUse.mock.calls[0][0]

    await expect(requestHandler({ url: '/organizations', headers: new AxiosHeaders() })).rejects.toThrow(
      'login_required'
    )
    expect(navigateToLogin).toHaveBeenCalledTimes(1)
  })

  it('should clear the Auth0 session when silent token renewal fails', async () => {
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    const navigateToLogin = jest.fn()
    mockGetAccessTokenSilently.mockRejectedValue(new Error('login_required'))

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com', { navigateToLogin }))

    const requestHandler = requestUse.mock.calls[0][0]

    await expect(requestHandler({ url: '/organizations', headers: new AxiosHeaders() })).rejects.toThrow(
      'login_required'
    )
    expect(mockLogout).toHaveBeenCalledWith({ openUrl: false })
  })

  it('should clear the session before navigating away', async () => {
    let releaseLogout = () => {
      /* replaced below */
    }
    mockLogout.mockReturnValue(
      new Promise<void>((resolve) => {
        releaseLogout = resolve
      })
    )
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    const navigateToLogin = jest.fn()
    mockGetAccessTokenSilently.mockRejectedValue(new Error('login_required'))

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com', { navigateToLogin }))

    const requestHandler = requestUse.mock.calls[0][0]
    const pending = requestHandler({ url: '/organizations', headers: new AxiosHeaders() }).catch(() => undefined)

    await flushAsyncWork()
    // A reload that outruns the cache wipe restores the dead session and the loop survives
    expect(navigateToLogin).not.toHaveBeenCalled()

    releaseLogout()
    await pending

    expect(navigateToLogin).toHaveBeenCalledTimes(1)
  })

  it('should clear the session only once when several requests fail concurrently', async () => {
    const requestUseA = jest.fn().mockReturnValue(1)
    const requestUseB = jest.fn().mockReturnValue(1)
    const navigateToLogin = jest.fn()
    mockGetAccessTokenSilently.mockRejectedValue(new Error('login_required'))

    // main.tsx registers the interceptor on two axios instances, and React Query retries each
    // failed query three times, so a single dead session produces a burst of failures
    renderHook(() =>
      useAuthInterceptor(createAxiosInstanceMock(requestUseA, jest.fn().mockReturnValue(2)), 'https://api.qovery.com', {
        navigateToLogin,
      })
    )
    renderHook(() =>
      useAuthInterceptor(
        createAxiosInstanceMock(requestUseB, jest.fn().mockReturnValue(2)),
        'https://copilot.qovery.com',
        {
          navigateToLogin,
        }
      )
    )

    await Promise.allSettled([
      requestUseA.mock.calls[0][0]({ url: '/organizations', headers: new AxiosHeaders() }),
      requestUseB.mock.calls[0][0]({ url: '/messages', headers: new AxiosHeaders() }),
    ])
    await flushAsyncWork()

    expect(mockLogout).toHaveBeenCalledTimes(1)
    expect(navigateToLogin).toHaveBeenCalledTimes(1)
  })

  it('should redirect to login when the API returns unauthorized', async () => {
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const navigateToLogin = jest.fn()

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com', { navigateToLogin }))

    const responseErrorHandler = responseUse.mock.calls[0][1]

    await expect(responseErrorHandler({ response: { status: 401, data: { status: 401 } } })).rejects.toMatchObject({
      code: '401',
    })
    await flushAsyncWork()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error', undefined)
    expect(navigateToLogin).toHaveBeenCalledTimes(1)
  })

  it('should not clear the session when the API returns unauthorized', async () => {
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    jest.spyOn(console, 'error').mockImplementation()
    const navigateToLogin = jest.fn()

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com', { navigateToLogin }))

    const responseErrorHandler = responseUse.mock.calls[0][1]

    await expect(responseErrorHandler({ response: { status: 401, data: { status: 401 } } })).rejects.toMatchObject({
      code: '401',
    })
    await flushAsyncWork()

    // A single endpoint answering 401 is not proof the session is dead, so signing the user out
    // here would log out a healthy user. The session-expired reason breaks the loop instead.
    expect(mockLogout).not.toHaveBeenCalled()
    expect(navigateToLogin).toHaveBeenCalledTimes(1)
  })

  it('should not clear the session nor navigate while already on a login page', async () => {
    // getAccessTokenSilently can reject transiently while the Auth0 callback is still in flight
    navigateTo('/login/auth0-callback')
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    const navigateToLogin = jest.fn()
    mockGetAccessTokenSilently.mockRejectedValue(new Error('login_required'))

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com', { navigateToLogin }))

    const requestHandler = requestUse.mock.calls[0][0]

    await expect(requestHandler({ url: '/organizations', headers: new AxiosHeaders() })).rejects.toThrow(
      'login_required'
    )
    await flushAsyncWork()

    expect(mockLogout).not.toHaveBeenCalled()
    expect(navigateToLogin).not.toHaveBeenCalled()
  })

  it('should build the login redirect url from the current location', () => {
    expect(buildLoginRedirectUrl('/organization/123', '?tab=clusters', '#overview')).toBe(
      '/login?redirect=%2Forganization%2F123%3Ftab%3Dclusters%23overview'
    )
  })

  it('should tag the login redirect url with the reason the session ended', () => {
    expect(buildLoginRedirectUrl('/', '', '', 'session-expired')).toBe('/login?redirect=%2F&reason=session-expired')
  })
})

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
