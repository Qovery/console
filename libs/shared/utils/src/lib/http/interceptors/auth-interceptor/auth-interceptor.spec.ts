import { renderHook } from '__tests__/utils/setup-jest'
import axios, { AxiosHeaders, type AxiosInstance } from 'axios'
import { buildLoginRedirectUrl, useAuthInterceptor } from './auth-interceptor'

const mockGetAccessTokenSilently = jest.fn()

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => {
    return {
      getAccessTokenSilently: mockGetAccessTokenSilently,
    }
  },
}))

describe('UseAuthInterceptor', () => {
  beforeEach(() => {
    mockGetAccessTokenSilently.mockResolvedValue('someAuthToken')
  })

  afterEach(() => {
    jest.clearAllMocks()
    window.history.pushState({}, '', '/')
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
    mockGetAccessTokenSilently.mockRejectedValue(authError)
    window.history.pushState({}, '', '/login')

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com'))

    const requestHandler = requestUse.mock.calls[0][0]

    await expect(requestHandler({ url: '/organizations', headers: new AxiosHeaders() })).rejects.toThrow(
      'login_required'
    )
  })

  it('should redirect to login when the API returns unauthorized', async () => {
    const requestUse = jest.fn().mockReturnValue(1)
    const responseUse = jest.fn().mockReturnValue(2)
    const axiosInstance = createAxiosInstanceMock(requestUse, responseUse)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    window.history.pushState({}, '', '/login')

    renderHook(() => useAuthInterceptor(axiosInstance, 'https://api.qovery.com'))

    const responseErrorHandler = responseUse.mock.calls[0][1]

    await expect(responseErrorHandler({ response: { status: 401, data: { status: 401 } } })).rejects.toMatchObject({
      code: '401',
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error', undefined)
  })

  it('should build the login redirect url from the current location', () => {
    expect(buildLoginRedirectUrl('/organization/123', '?tab=clusters', '#overview')).toBe(
      '/login?redirect=%2Forganization%2F123%3Ftab%3Dclusters%23overview'
    )
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
