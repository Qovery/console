import axios from 'axios'
import { act, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { BillingPaywallHost, offerPaywallFromError, useBillingPaywall, usePricingClient } from './console-paywall'
import { createPricingFetchAdapter } from './pricing-transport'
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
  const originalAdapter = axios.defaults.adapter
  const fetchMock = jest.fn()
  beforeEach(() => {
    mockFlag.mockReturnValue(true)
    fetchMock.mockReset()
    fetchMock.mockImplementation(() => gatesResponse([locked]))
    axios.defaults.adapter = createPricingFetchAdapter(fetchMock)
  })

  afterEach(() => {
    axios.defaults.adapter = originalAdapter
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

  it.each([
    ['members.seats', 'member.invite', 'Members'],
    ['observe.clusters', 'observe.enable', 'Qovery Observe'],
    ['clusters.self_managed', 'cluster.create_self_managed', 'Self-managed clusters'],
    ['sso', 'sso.enable', 'Single sign-on'],
  ])('opens the full page for %s refused by the plan', async (sku, action, title) => {
    renderWithProviders(<BillingPaywallHost organizationId="org-1" />)

    act(() => {
      offerPaywallFromError(refusal(402, { action, sku, paywall: { ...paywall, sku, title } }))
    })

    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start a 14-day trial' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Not now' })).toBeInTheDocument()
  })

  it('reads the gate and opens the full page when the 402 names only the action', async () => {
    const sso: Gate = {
      ...locked,
      action: 'sso.enable',
      sku: 'sso',
      paywall: { ...paywall, sku: 'sso', title: 'Single sign-on' },
    }
    fetchMock.mockImplementation(() => gatesResponse([sso]))
    renderWithProviders(<BillingPaywallHost organizationId="org-1" />)

    act(() => {
      offerPaywallFromError(refusal(402, { action: 'sso.enable' }))
    })

    expect(await screen.findByRole('heading', { level: 1, name: 'Single sign-on' })).toBeInTheDocument()
  })

  it('falls back to the mutation notification when the gate read cannot open a paywall', async () => {
    fetchMock.mockImplementation(() => gatesResponse([]))
    renderWithProviders(<BillingPaywallHost organizationId="org-1" />)
    const notify = jest.fn()

    act(() => {
      expect(offerPaywallFromError(refusal(402, { action: 'sso.enable' }), notify)).toBe(true)
    })

    await waitFor(() => expect(notify).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shares the client between components using the same Auth0 token getter', () => {
    const clients = new Set()
    function Probe() {
      clients.add(usePricingClient())
      return null
    }

    renderWithProviders(
      <>
        <Probe />
        <Probe />
      </>
    )
    expect(clients.size).toBe(1)
  })

  it('keeps the dialog for a feature without page content', async () => {
    const { userEvent } = renderWithProviders(<BillingPaywallHost organizationId="org-1" />)

    act(() => {
      offerPaywallFromError(
        refusal(402, {
          action: 'dns_provider.edit',
          sku: 'dns.custom_provider',
          paywall: { ...paywall, sku: 'dns.custom_provider', title: 'Custom DNS provider' },
        })
      )
    })

    expect(await screen.findByRole('heading', { name: 'Custom DNS provider' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start free trial' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('Custom DNS provider')).not.toBeInTheDocument()
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
