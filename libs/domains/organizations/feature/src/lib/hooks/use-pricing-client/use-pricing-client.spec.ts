import axios from 'axios'
import { billingUsageFactoryMock, createPricingFetchAdapter } from '@qovery/shared/billing-kit'
import { renderHook } from '@qovery/shared/util-tests'
import { usePricingClient } from './use-pricing-client'

const mockGetAccessTokenSilently = jest.fn()

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ getAccessTokenSilently: mockGetAccessTokenSilently }),
}))

describe('usePricingClient', () => {
  const originalAdapter = axios.defaults.adapter
  const fetchMock = jest.fn()
  const e2eTokenKey = 'qovery-e2e-auth-token'
  const usage = billingUsageFactoryMock()

  beforeEach(() => {
    mockGetAccessTokenSilently.mockResolvedValue('user-token')
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: '',
      json: () => Promise.resolve(usage),
    })
    axios.defaults.adapter = createPricingFetchAdapter(fetchMock)
  })

  afterEach(() => {
    window.localStorage.removeItem(e2eTokenKey)
    axios.defaults.adapter = originalAdapter
  })

  it('should read the billing usage from pricing-api with the signed-in user token', async () => {
    const { result } = renderHook(() => usePricingClient())

    await expect(result.current.billingUsage('org-1')).resolves.toEqual(usage)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/organization\/org-1\/billingUsage$/), {
      headers: { Authorization: 'Bearer user-token' },
    })
  })

  it('should use the E2E token and encode the organization path segment', async () => {
    window.localStorage.setItem(e2eTokenKey, 'e2e-token')
    const { result } = renderHook(() => usePricingClient())

    await result.current.billingUsage('org/name')

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/org%2Fname\/billingUsage$/), {
      headers: { Authorization: 'Bearer e2e-token' },
    })
    expect(mockGetAccessTokenSilently).not.toHaveBeenCalled()
  })

  it('should reject a malformed success response', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ plan: 'Growth' }) })
    const { result } = renderHook(() => usePricingClient())

    await expect(result.current.billingUsage('org-1')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })

  it('should keep the same client between renders', () => {
    const { result, rerender } = renderHook(() => usePricingClient())
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })
})
