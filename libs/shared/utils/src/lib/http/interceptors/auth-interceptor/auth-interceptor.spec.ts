import { renderHook } from '@testing-library/react-hooks'
import { useAuthInterceptor } from './auth-interceptor'
import axios from 'axios'

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
