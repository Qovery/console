import { act, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import type { PricingClient } from './client'
import { OfferHost } from './offers'
import type { Offer, PlanProposal } from './types'

const offer = (id: number, title: string): Offer => ({
  id,
  surfaces: ['banner'],
  content: {
    title,
    body: '',
    cta_label: 'See Scale',
    action: { type: 'upgrade', plan: 'SCALE_2026' },
    badge: 'Q4 offer',
  },
})
const offers = [offer(2, 'Scale for the price of Growth until your renewal'), offer(1, 'Yearly billing saves 15%')]
const proposal = {
  id: 7,
  plan: { code: 'SCALE_2026', name: 'Scale', version: 1 },
  period: 'year',
  currency: 'USD',
  sender_name: 'The Qovery team',
  send_as: 'team',
  message: 'Hi team',
  headline: 'about $2,000 less a year at your current usage',
  concession: null,
  current: { plan_name: 'Growth', yearly: null },
  proposed: { plan_name: 'Scale', yearly: null },
  differences: [],
  status: 'sent',
  expires_at: '2026-12-21T23:59:59Z',
  sent_at: '2026-11-21T10:00:00Z',
  snooze_days: [3, 7, 14],
  dismiss_reasons: [],
} as unknown as PlanProposal

function client(p: PlanProposal | null) {
  return {
    offers: jest.fn(async () => ({
      user: { email: 'owner@example.com', role: 'Owner', access: 'billing' as const },
      offers,
      upgrade_requests: [],
    })),
    offerEvent: jest.fn(async () => undefined),
    proposals: jest.fn(async () => ({ proposal: p })),
    viewProposal: jest.fn(async () => undefined),
  }
}

const bar = (c: ReturnType<typeof client>) =>
  renderWithProviders(
    <OfferHost
      variant="bar"
      modal={false}
      organizationId="org-1"
      client={c as unknown as PricingClient}
      onAction={jest.fn()}
      onReviewProposal={jest.fn()}
    />
  )

describe('OfferHost top bar', () => {
  it('shows the proposal alone when a proposal and offers are open', async () => {
    const c = client(proposal)
    let resolveProposal: (value: { proposal: PlanProposal }) => void = () => undefined
    const pendingProposal = new Promise<{ proposal: PlanProposal }>((resolve) => {
      resolveProposal = resolve
    })
    c.proposals.mockReturnValue(pendingProposal)
    bar(c)
    await act(async () => {
      await c.offers.mock.results[0].value
    })
    expect(screen.queryByText(offers[0].content.title)).not.toBeInTheDocument()
    await act(async () => resolveProposal({ proposal }))

    const line = 'The Qovery team suggests Scale: about $2,000 less a year at your current usage'
    expect(await screen.findByText(line)).toBeInTheDocument()
    expect(screen.queryByText(offers[0].content.title)).not.toBeInTheDocument()
    expect(screen.queryByText(offers[1].content.title)).not.toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(c.offerEvent).not.toHaveBeenCalled()
  })

  it('shows one offer, the first, when there is no proposal', async () => {
    const c = client(null)
    bar(c)
    expect(await screen.findByText(offers[0].content.title)).toBeInTheDocument()
    expect(screen.queryByText(offers[1].content.title)).not.toBeInTheDocument()
    await waitFor(() => expect(c.offerEvent).toHaveBeenCalledWith('org-1', 2, 'shown', 'banner'))
    expect(c.offerEvent).toHaveBeenCalledTimes(1)
  })

  it('stays on one line: the text truncates, its full version in the tooltip', async () => {
    const c = client(proposal)
    bar(c)
    const line = 'The Qovery team suggests Scale: about $2,000 less a year at your current usage'
    const text = (await screen.findByText(line)).parentElement as HTMLElement
    expect(text).toHaveClass('truncate', 'whitespace-nowrap', 'min-w-0')
    const root = text.parentElement as HTMLElement
    expect(root).toHaveClass('whitespace-nowrap', 'overflow-hidden')
    expect(root).toHaveAttribute('title', line)
    // On a phone: the heading only, with Review.
    expect(screen.getByText('The Qovery team suggests Scale')).toHaveClass('sm:hidden')
  })
})
