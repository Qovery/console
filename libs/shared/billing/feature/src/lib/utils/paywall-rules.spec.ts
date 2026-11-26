// The billing kit's rules for paywalls, trials, plan proposals and shared reads, and the calls the
// pricing-api client sends for them, from pricing-api's web/tests (paywall, proposals, kit-reads).
import axios, { type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import type { Gate, PaywallInfo, PlanProposal, SignupTrial1 as SignupTrial } from 'qovery-pricing-typescript-axios'
import { createPricingClient } from '@qovery/shared/billing/data-access'
import { introChip, introPageView } from './gated'
import {
  continueChoices,
  gateFor,
  gateKeyFromBody,
  isLocked,
  lockLabel,
  markIntroSeen,
  optionPrice,
  paywallFromBody,
  pendingIntro,
  trialEnds,
  trialRequest,
} from './paywall-rules'
import {
  BAR_TEXT,
  barBanner,
  barClass,
  isProposalChange,
  proposalFromSearch,
  proposalHeading,
  proposalLine,
  proposalShortLine,
  snoozeLabel,
} from './proposal-rules'
import { SHARED_READ_MS, forgetReads, sharedRead } from './reads'
import { signupTrialText } from './subscription-rules'

const paywall: PaywallInfo = {
  sku: 'clusters.managed',
  title: 'Qovery-managed clusters',
  message: 'Your Free plan includes 0 clusters.',
  headline: 'Let Qovery run your Kubernetes cluster',
  benefits: ['a', 'b'],
  audience: 'billing',
  options: [
    {
      type: 'start_trial',
      label: 'Try it free for 14 days',
      days: 14,
      includes: '1 more Qovery-managed cluster',
      recommended: true,
    },
    {
      type: 'upgrade',
      label: 'Upgrade to Starter',
      plan: 'STARTER_2026',
      plan_name: 'Starter',
      amount: 358800,
      difference: 358800,
      period: 'year',
      currency: 'USD',
    },
    {
      type: 'addon',
      label: 'Add a managed cluster',
      addon: 'additional_managed_cluster',
      addon_name: 'Managed cluster',
      amount: 0,
      period: 'year',
      currency: 'USD',
    },
  ],
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

const self: Gate = {
  action: 'cluster.create_self_managed',
  sku: 'clusters.self_managed',
  name: 'Self-managed clusters',
  allowed: true,
  reason: '',
  limit: 1,
  used: 0,
  requested: 1,
}

describe('paywall', () => {
  it('should find a gate by action or SKU, and lock only a refused gate with a paywall', () => {
    expect(gateFor([self, locked], 'cluster.create')).toBe(locked)
    expect(gateFor([self, locked], 'clusters.managed')).toBe(locked)
    expect(gateFor(undefined, 'x')).toBeUndefined()
    expect(isLocked(locked)).toBe(true)
    expect(isLocked(self)).toBe(false)
    expect(isLocked({ ...locked, paywall: undefined })).toBe(false)
    expect(isLocked(undefined)).toBe(false)
  })

  it("should read the paywall in core's 402 body, as is or wrapped", () => {
    const check = { allowed: false, http_status: 402, sku: 'clusters.managed', action: 'cluster.create', paywall }

    expect(paywallFromBody(check)?.paywall).toBe(paywall)
    expect(paywallFromBody(check)?.action).toBe('cluster.create')
    expect(paywallFromBody({ data: check })?.paywall).toBe(paywall)
    expect(paywallFromBody({ response: { data: check } })?.sku).toBe('clusters.managed')
    expect(paywallFromBody({ message: 'refused' })).toBeNull()
    expect(paywallFromBody({ paywall: { headline: 'x' } })).toBeNull()
    expect(paywallFromBody(null)).toBeNull()
    expect(gateKeyFromBody(402, { action: 'blueprint.create' })).toEqual({ action: 'blueprint.create', sku: undefined })
    expect(gateKeyFromBody(400, { action: 'blueprint.create' })).toBeNull()
  })

  it('should price options and label the inline lock', () => {
    expect(optionPrice(paywall.options[1])).toBe('$3,588 per year')
    expect(optionPrice({ ...paywall.options[1], difference: 240000 })).toBe('$3,588 per year, $2,400 more than today')
    expect(optionPrice(paywall.options[0])).toBe('')
    expect(lockLabel(locked)).toBe('Try it free for 14 days')
    expect(lockLabel({ ...locked, paywall: { ...paywall, options: paywall.options.slice(1) } })).toBe('Starter plan')
    expect(
      lockLabel({
        ...locked,
        paywall: { ...paywall, audience: 'member', options: [{ type: 'request_admin', label: 'Ask an admin' }] },
      })
    ).toBe('Ask an admin')
    expect(lockLabel(self)).toBe('')
  })

  it('should continue a trial only on a priced option, and only with consent', () => {
    const choices = continueChoices(paywall)

    expect(choices.map((o) => o.plan ?? o.addon)).toEqual(['STARTER_2026'])
    expect(trialRequest('clusters.managed', choices[0], false)).toEqual({ sku: 'clusters.managed' })
    expect(trialRequest('clusters.managed', undefined, true)).toEqual({ sku: 'clusters.managed' })
    expect(trialRequest('clusters.managed', choices[0], true)).toEqual({
      sku: 'clusters.managed',
      continue: { plan: 'STARTER_2026', period: 'year' },
      accept_auto_charge: true,
    })
  })

  it('should date the end of a trial', () => {
    expect(trialEnds(14, new Date('2026-11-01T00:00:00Z'))).toBe('2026-11-15T00:00:00.000Z')
  })
})

describe('signup trial', () => {
  const trial = (over: Partial<SignupTrial> = {}): SignupTrial => ({
    plan: 'GROWTH_2026',
    plan_name: 'Growth',
    ends_at: '2026-12-01T00:00:00Z',
    days_left: 5,
    on_end: 'free',
    keep: false,
    currency: 'USD',
    ...over,
  })

  it('should say when the trial ends and what happens then', () => {
    expect(signupTrialText(trial(), 'en-US').title).toBe('Your Growth trial ends in 5 days')
    expect(signupTrialText(trial({ days_left: 1 }), 'en-US').title).toBe('Your Growth trial ends tomorrow')
    expect(signupTrialText(trial({ chosen_plan_name: 'Scale' }), 'en-US').body).toBe(
      'On Dec 1, 2026 you move to Scale, the plan you chose.'
    )
    expect(signupTrialText(trial({ keep: true, keep_amount: 89900 }), 'en-US').body).toMatch(
      /^On Dec 1, 2026 you keep Growth, \$899\.00 per month, charged to your card on file/
    )
    expect(signupTrialText(trial({ keep: true }), 'en-US').body).toMatch(/^On Dec 1, 2026 you keep Growth, charged/)
    expect(signupTrialText(trial(), 'en-US').body).toMatch(/moves to the Free plan/)
    expect(signupTrialText(trial({ then_plan_name: 'Starter' }), 'en-US').body).toMatch(/moves to the Starter plan/)
    expect(signupTrialText(trial({ on_end: 'lock' }), 'en-US').body).toBe(
      'On Dec 1, 2026 new resources pause until you choose a plan. Nothing running is stopped.'
    )
  })
})

describe('plan proposals', () => {
  const plan = { code: 'SCALE_2026', name: 'Scale', version: 1 }

  it('should read remind me later choices as days and weeks', () => {
    expect([3, 7, 14].map(snoozeLabel)).toEqual(['3 days', '1 week', '2 weeks'])
    expect(snoozeLabel(1)).toBe('1 day')
  })

  it('should name the sender, the plan and the one line', () => {
    const p = { sender_name: 'Ada Lovelace', plan, headline: 'about $2,000 less a year at your current usage' }

    expect(proposalLine(p)).toBe(
      'Ada Lovelace from Qovery suggests Scale: about $2,000 less a year at your current usage'
    )
    expect(proposalLine({ ...p, headline: '' })).toBe('Ada Lovelace from Qovery suggests Scale')
  })

  it('should lead with the offer, then who signs', () => {
    const team = {
      sender_name: 'The Qovery team',
      send_as: 'team' as const,
      plan,
      headline: 'about $2,000 less a year at your current usage',
      offer: '10% off Scale for 6 months',
    }

    expect(proposalLine(team)).toBe('10% off Scale for 6 months · The Qovery team')
    expect(proposalLine({ ...team, sender_name: 'Ada Lovelace' })).toBe('10% off Scale for 6 months · The Qovery team')
    expect(proposalLine({ ...team, sender_name: 'Ada Lovelace', send_as: 'person' })).toBe(
      '10% off Scale for 6 months · Ada Lovelace, Qovery'
    )
    expect(proposalShortLine(team)).toBe('10% off Scale for 6 months')
    expect(proposalLine({ ...team, offer: undefined })).toBe(
      'The Qovery team suggests Scale: about $2,000 less a year at your current usage'
    )
    expect(proposalShortLine({ ...team, offer: '' })).toBe('The Qovery team suggests Scale')
  })

  it('should name no one on a proposal sent as the Qovery team', () => {
    const p = { sender_name: 'The Qovery team', send_as: 'team' as const, plan }

    expect(proposalHeading(p)).toBe('The Qovery team suggests Scale')
    expect(proposalHeading({ ...p, sender_name: 'Ada Lovelace' })).toBe('The Qovery team suggests Scale')
    expect(proposalHeading({ ...p, sender_name: 'Ada Lovelace', send_as: 'person' })).toBe(
      'Ada Lovelace from Qovery suggests Scale'
    )
    expect(proposalHeading({ sender_name: 'Ada Lovelace', plan })).toBe('Ada Lovelace from Qovery suggests Scale')
  })

  it('should show one banner in the top bar: the proposal first, else the first offer', () => {
    const proposal = { id: 1 } as PlanProposal
    const offers = [{ id: 10 }, { id: 11 }]

    expect(barBanner(proposal, offers)).toEqual({ kind: 'proposal', proposal })
    expect(barBanner(null, offers)).toEqual({ kind: 'offer', offer: offers[0] })
    expect(barBanner(undefined, [])).toBeUndefined()
  })

  it('should keep the top bar on one line, with room for the close button', () => {
    expect(BAR_TEXT.split(' ')).toEqual(expect.arrayContaining(['min-w-0', 'truncate', 'whitespace-nowrap']))
    expect(barClass(true).split(' ')).toEqual(expect.arrayContaining(['whitespace-nowrap', 'overflow-hidden', 'pr-11']))
    expect(barClass(false).split(' ')).not.toContain('pr-11')
  })

  it('should go through the proposal only on its own plan and period', () => {
    const p = { plan, period: 'year' as const }

    expect(isProposalChange(p, 'SCALE_2026', 'year')).toBe(true)
    expect(isProposalChange(p, 'SCALE_2026', 'month')).toBe(false)
    expect(isProposalChange(p, 'GROWTH_2026', 'year')).toBe(false)
    expect(isProposalChange(undefined, 'SCALE_2026', 'year')).toBe(false)
  })

  it('should open a proposal id from the email deep link, nothing else', () => {
    expect(proposalFromSearch('?proposal=12')).toBe(12)
    expect(proposalFromSearch('?tab=usage&proposal=7')).toBe(7)
    expect(proposalFromSearch(`?proposal=${Number.MAX_SAFE_INTEGER}`)).toBe(Number.MAX_SAFE_INTEGER)
    expect(proposalFromSearch('?proposal=9007199254740993')).toBeUndefined()
    for (const bad of ['', '?proposal=', '?proposal=0', '?proposal=-1', '?proposal=1e3', '?proposal=12abc']) {
      expect(proposalFromSearch(bad)).toBeUndefined()
    }
  })
})

describe('shared reads', () => {
  const counter = () => {
    let n = 0
    return {
      read: () => Promise.resolve(++n),
      calls: () => n,
    }
  }

  it('should share one read between components mounting together, a few seconds', async () => {
    const client = {}
    const c = counter()
    let t = 1_000_000
    const now = () => t

    const first = sharedRead(client, 'offers:o1', c.read, false, now)
    t += SHARED_READ_MS + 800
    const [a, b] = await Promise.all([first, sharedRead(client, 'offers:o1', c.read, false, now)])
    expect(c.calls()).toBe(1)
    expect(a).toBe(b)

    t += SHARED_READ_MS
    await sharedRead(client, 'offers:o1', c.read, false, now)
    expect(c.calls()).toBe(2)
  })

  it('should read again on a reload after an action, and after forgetReads', async () => {
    const client = {}
    const c = counter()
    const now = () => 3_000_000

    await sharedRead(client, 'offers:o1', c.read, false, now)
    expect(await sharedRead(client, 'offers:o1', c.read, true, now)).toBe(2)
    forgetReads(client, 'offers:')
    expect(await sharedRead(client, 'offers:o1', c.read, false, now)).toBe(3)
    forgetReads({}, 'offers:')
  })

  it('should not keep a failed read', async () => {
    const client = {}
    const failing = jest.fn(() => Promise.reject(new Error('down')))

    await expect(sharedRead(client, 'x', failing, false, () => 4_000_000)).rejects.toThrow('down')
    await expect(sharedRead(client, 'x', failing, false, () => 4_000_001)).rejects.toThrow('down')
    expect(failing).toHaveBeenCalledTimes(2)
  })
})

// Intros ("Show when included"), from pricing-api's web/tests/paywall-intros.test.ts.
describe('paywall intros', () => {
  const intro = {
    sku: 'service_catalog',
    title: 'Blueprints',
    headline: 'Included in your plan',
    benefits: ['One'],
    plan: { code: 'GROWTH_2026', name: 'Growth' },
    cta: 'Continue',
  }
  const allowed = {
    action: 'blueprint.create',
    sku: 'service_catalog',
    name: 'Blueprints',
    allowed: true,
    reason: '' as const,
    limit: true,
    used: 0,
    requested: 1,
    intro,
  }

  it('should show an intro on an allowed gate only, once per organization in the session', () => {
    expect(pendingIntro('org-a', { ...allowed, allowed: false })).toBeUndefined()
    expect(pendingIntro('org-a', undefined)).toBeUndefined()
    expect(pendingIntro('org-a', allowed)).toBe(intro)
    markIntroSeen('org-a', 'service_catalog')
    expect(pendingIntro('org-a', allowed)).toBeUndefined()
    expect(pendingIntro('org-b', allowed)).toBe(intro)
  })

  it('should build the intro page without any option to buy', () => {
    const v = introPageView(intro)
    expect(v.chip).toBe('Included in your Growth plan')
    expect(v.primary).toBeUndefined()
    expect(v.others).toEqual([])
    expect(introChip({})).toBe('Included in your plan')
  })

  it('should record what the person did with an intro', async () => {
    const adapter = jest.fn<ReturnType<AxiosAdapter>, [InternalAxiosRequestConfig]>(async (config) => ({
      config,
      data: null,
      status: 204,
      statusText: 'No Content',
      headers: {},
    }))
    const originalAdapter = axios.defaults.adapter
    axios.defaults.adapter = adapter
    try {
      await createPricingClient({
        pricingApiUrl: 'https://p',
        getToken: () => Promise.resolve('t'),
      }).gateIntro?.('org-1', {
        sku: 'service_catalog',
        action: 'continued',
      })
    } finally {
      axios.defaults.adapter = originalAdapter
    }
    const [config] = adapter.mock.calls[0]
    expect(axios.getUri(config)).toBe('https://p/organization/org-1/gates/intro')
    expect(config.method).toBe('post')
    expect(JSON.parse(config.data)).toEqual({ sku: 'service_catalog', action: 'continued' })
  })
})
