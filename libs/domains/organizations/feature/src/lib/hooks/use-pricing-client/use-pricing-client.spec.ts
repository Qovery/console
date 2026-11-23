import { renderHook } from '@qovery/shared/util-tests'
import { usePricingClient } from './use-pricing-client'

const mockGetAccessTokenSilently = jest.fn()

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ getAccessTokenSilently: mockGetAccessTokenSilently }),
}))

describe('usePricingClient', () => {
  const originalFetch = global.fetch
  const fetchMock = jest.fn()

  beforeEach(() => {
    mockGetAccessTokenSilently.mockResolvedValue('user-token')
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: '',
      json: () => Promise.resolve({ plan: 'growth' }),
    })
    global.fetch = fetchMock as unknown as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('should read the billing usage from pricing-api with the signed-in user token', async () => {
    const { result } = renderHook(() => usePricingClient())

    await expect(result.current.billingUsage('org-1')).resolves.toEqual({ plan: 'growth' })
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/organization\/org-1\/billingUsage$/), {
      headers: { Authorization: 'Bearer user-token' },
    })
  })

  it('should keep the same client between renders', () => {
    const { result, rerender } = renderHook(() => usePricingClient())
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })
})
