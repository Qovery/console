import { renderHook } from '__tests__/utils/setup-jest'
import axios from 'axios'
import { useAuthInterceptor } from './auth-interceptor'

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => {
    return {
      getAccessTokenSilently: () => 'someAuthToken',
    }
  },
}))

describe('UseAuthInterceptor', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useAuthInterceptor(axios, 'some-url'))

    expect(result).toBeTruthy()
  })

  it('should add the authorization to the headers of the incoming request', async () => {
    renderHook(() => useAuthInterceptor(axios, 'some-url'))
  })
})
