import axios, { type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { billingUsageFactoryMock } from '@qovery/shared/factories'
import { renderHook } from '@qovery/shared/util-tests'
import { usePricingClient } from './use-pricing-client'

const mockGetAccessTokenSilently = jest.fn()
let mockSubject: string | undefined

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ getAccessTokenSilently: mockGetAccessTokenSilently, user: { sub: mockSubject } }),
}))

describe('usePricingClient', () => {
  const originalAdapter = axios.defaults.adapter
  const adapter = jest.fn<ReturnType<AxiosAdapter>, [InternalAxiosRequestConfig]>()
  const e2eTokenKey = 'qovery-e2e-auth-token'
  const usage = billingUsageFactoryMock()

  beforeEach(() => {
    mockSubject = undefined
    mockGetAccessTokenSilently.mockResolvedValue('user-token')
    adapter.mockImplementation(async (config) => ({ config, data: usage, status: 200, statusText: 'OK', headers: {} }))
    axios.defaults.adapter = adapter
  })

  afterEach(() => {
    window.localStorage.removeItem(e2eTokenKey)
    axios.defaults.adapter = originalAdapter
  })

  it('should read the billing usage from pricing-api with the signed-in user token', async () => {
    const { result } = renderHook(() => usePricingClient())

    await expect(result.current.billingUsage('org-1')).resolves.toEqual(usage)
    const [config] = adapter.mock.calls[0]
    expect(axios.getUri(config)).toMatch(/\/organization\/org-1\/billingUsage$/)
    expect(config.headers.get('Authorization')).toBe('Bearer user-token')
  })

  it('should use the E2E token and encode the organization path segment', async () => {
    window.localStorage.setItem(e2eTokenKey, 'e2e-token')
    const { result } = renderHook(() => usePricingClient())

    await result.current.billingUsage('org/name')

    const [config] = adapter.mock.calls[0]
    expect(axios.getUri(config)).toMatch(/org%2Fname\/billingUsage$/)
    expect(config.headers.get('Authorization')).toBe('Bearer e2e-token')
    expect(mockGetAccessTokenSilently).not.toHaveBeenCalled()
  })

  it('should reject a malformed success response', async () => {
    adapter.mockImplementationOnce(async (config) => ({
      config,
      data: { plan: 'Growth' },
      status: 200,
      statusText: 'OK',
      headers: {},
    }))
    const { result } = renderHook(() => usePricingClient())

    await expect(result.current.billingUsage('org-1')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })

  it('should retain the empty service filter for unattributed build usage', async () => {
    const { result } = renderHook(() => usePricingClient())

    await result.current.buildUsage?.('org-1', {
      from: '2026-11-01',
      to: '2026-11-30',
      granularity: 'day',
      service: '',
    })

    const [config] = adapter.mock.calls[0]
    const url = new URL(axios.getUri(config))
    expect(url.pathname).toBe('/organization/org-1/buildUsage')
    expect(url.searchParams.get('service')).toBe('')
  })

  it('uses a different client after the authenticated subject changes', () => {
    mockSubject = 'auth0|first'
    const { result, rerender } = renderHook(() => usePricingClient())
    const firstClient = result.current

    mockSubject = 'auth0|second'
    rerender()

    expect(result.current).not.toBe(firstClient)
  })

  it('should keep the same client between renders', () => {
    const { result, rerender } = renderHook(() => usePricingClient())
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })
})
