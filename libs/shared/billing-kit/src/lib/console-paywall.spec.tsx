import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BillingPaywallHost, offerPaywallFromError, useBillingPaywall } from './console-paywall'
import type { Gate, PaywallInfo } from './types'

const mockFlag = jest.fn(() => true)
jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: () => mockFlag() }))

const paywall: PaywallInfo = {
  sku: 'clusters.managed',
  title: 'Qovery-managed clusters',
  message: 'Your Free plan includes 0 clusters.',
  headline: 'Let Qovery run your Kubernetes cluster',
  benefits: [],
  audience: 'billing',
  options: [{ type: 'start_trial', label: 'Try it free for 14 days', days: 14 }],
}
const locked: Gate = {
  action: 'cluster.create',
  sku: 'clusters.managed',
  name: 'Managed clusters',
  allowed: false,
  reason: 'not_in_plan',
  limit: 0,
  used: 0,
  requested: 1,
  paywall,
}
// What core answers with pricing-api's check, as axios rejects it.
const refusal = (status: number, data: unknown) => ({ message: 'refused', response: { status, data } })

function gatesResponse(gates: Gate[]) {
  return Promise.resolve({
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: () => Promise.resolve({ organization_id: 'org-1', access: 'billing', gates }),
  })
}

describe('console paywall', () => {
  const fetchMock = jest.fn()
  beforeEach(() => {
    mockFlag.mockReturnValue(true)
    fetchMock.mockReset()
    fetchMock.mockImplementation(() => gatesResponse([locked]))
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it('leaves the error to the toast when no host is mounted', () => {
    expect(offerPaywallFromError(refusal(402, { action: 'cluster.create', paywall }))).toBe(false)
  })

  it('opens the paywall for a 402 that carries it, and only for a 402', async () => {
    renderWithProviders(<BillingPaywallHost organizationId="org-1" />)

    expect(offerPaywallFromError(refusal(400, { paywall }))).toBe(false)
    expect(offerPaywallFromError(refusal(402, { message: 'no paywall here' }))).toBe(false)
    let handled = false
    act(() => {
      handled = offerPaywallFromError(refusal(402, { action: 'cluster.create', sku: 'clusters.managed', paywall }))
    })

    expect(handled).toBe(true)
    expect(await screen.findByText('Let Qovery run your Kubernetes cluster')).toBeInTheDocument()
  })

  it('does not listen when the billing-paywall flag is off', () => {
    mockFlag.mockReturnValue(false)
    renderWithProviders(<BillingPaywallHost organizationId="org-1" />)

    expect(offerPaywallFromError(refusal(402, { action: 'cluster.create', paywall }))).toBe(false)
  })

  it('reads the gates only with the flag on', async () => {
    function Probe() {
      const pw = useBillingPaywall('org-1', { actions: ['cluster.create'] })
      return <p>{pw.locked('cluster.create') ? 'locked' : 'open'}</p>
    }
    mockFlag.mockReturnValue(false)
    const { unmount } = renderWithProviders(<Probe />)
    // Long enough for a gates call to go out (the token is read first).
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)))
    expect(screen.getByText('open')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
    unmount()

    mockFlag.mockReturnValue(true)
    renderWithProviders(<Probe />)
    expect(await screen.findByText('locked')).toBeInTheDocument()
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://billing-api.qovery.com/organization/org-1/gates?actions=cluster.create'
    )
  })
})
