import type {
  Availability1 as Availability,
  CreditOption,
  SignupTrial1 as SignupTrial,
} from 'qovery-pricing-typescript-axios'
import { amount, localDate, num } from './format'

/** A key per review of a plan change: a double click or a retry is applied once. */
export function newIdempotencyKey(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  if (c?.randomUUID) return c.randomUUID()
  return `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/** What a change of plan or billing period is, in a few words. */
export function changeKind(q: { direction: string; period: string; effective_at: string }, currentPeriod: string) {
  if (q.period !== currentPeriod) return q.period === 'year' ? 'Switch to yearly billing' : 'Switch to monthly billing'
  if (q.direction === 'same') return 'Keep your current plan'
  return q.direction === 'downgrade' ? 'Downgrade' : 'Upgrade'
}

/** What the kit says about one of Qovery's own organizations (an internal account, never billed). */
export const INTERNAL_NOTHING_BILLED = 'Internal organization: nothing is billed'

/**
 * The trial banner of a new organization: its title and what happens at the end, in the order
 * the customer can act on: a plan chosen, the plan kept, then the default (Free, or a pause).
 */
export function signupTrialText(t: SignupTrial, locale?: string): { title: string; body: string } {
  const left = t.days_left <= 1 ? 'ends tomorrow' : `ends in ${t.days_left} days`
  const title = `Your ${t.plan_name} trial ${left}`
  const on = localDate(t.ends_at, locale)
  if (t.chosen_plan_name) return { title, body: `On ${on} you move to ${t.chosen_plan_name}, the plan you chose.` }
  if (t.keep)
    return {
      title,
      body: `On ${on} you keep ${t.plan_name}${t.keep_amount != null ? `, ${amount(t.keep_amount, t.currency, locale)} per month` : ''}, charged to your card on file. You can change your mind until then.`,
    }
  if (t.on_end === 'free')
    return {
      title,
      body: `On ${on} your organization moves to the ${t.then_plan_name || 'Free'} plan. Nothing running is removed, but what goes beyond it can no longer be created. Choose a plan to keep what ${t.plan_name} gives you.`,
    }
  return { title, body: `On ${on} new resources pause until you choose a plan. Nothing running is stopped.` }
}

export function changeBlockedText(
  a: Availability | undefined,
  what: 'plan' | 'cancel' | 'credits' | 'reactivate'
): { title: string; body: string; contact: boolean } | null {
  if (!a || a.available) return null
  const verb = {
    plan: 'change your plan',
    cancel: 'cancel',
    credits: 'buy prepaid credits',
    reactivate: 'reactivate your subscription',
  }[what]
  switch (a.code) {
    case 'PAYMENT_ACTIONS_UNAVAILABLE':
      return {
        title: 'Billing changes are not available yet',
        body:
          what === 'plan'
            ? `You can compare plans and see the prices. To ${verb} now, contact us.`
            : `To ${verb} now, contact us.`,
        contact: true,
      }
    case 'SELF_SERVE_UNAVAILABLE':
      return {
        title:
          what === 'plan'
            ? 'Contact us to change your plan'
            : what === 'cancel'
              ? 'Contact us to cancel'
              : `Contact us to ${verb}`,
        body: "This organization's subscription is not managed from the console yet. We make the change for you.",
        contact: true,
      }
    case 'CONTRACT_MANAGED':
      return what === 'credits'
        ? {
            title: 'Prepaid usage is set by your contract',
            body: 'Your account manager adds prepaid units with you.',
            contact: true,
          }
        : {
            title: 'Your plan is set by your contract',
            body: 'Your account manager changes it with you.',
            contact: true,
          }
    case 'AWS_MARKETPLACE':
      return {
        title: 'You pay through AWS Marketplace',
        body:
          what === 'credits'
            ? 'Your account manager adds prepaid units to your private offer in AWS.'
            : `To ${verb}, your account manager updates your private offer in AWS.`,
        contact: true,
      }
    case 'CANCELLATION_SCHEDULED':
      return {
        title: 'Your subscription is set to end',
        body: 'Keep your subscription first, then change the plan.',
        contact: false,
      }
    case 'SUBSCRIPTION_ENDED':
      return {
        title: 'Your subscription has ended',
        body: 'Reactivate it from the usage page, or contact us.',
        contact: true,
      }
    case 'PAYMENT_METHOD_REQUIRED':
      return { title: 'Add a card first', body: a.detail ?? 'This is paid by card.', contact: false }
    case 'INTERNAL_ACCOUNT':
      return {
        title: INTERNAL_NOTHING_BILLED,
        body: 'Plans, payments, credits and cancellations do not apply to it.',
        contact: false,
      }
  }
  return { title: 'This change is not available', body: a.detail ?? '', contact: true }
}

/** Why a quantity of prepaid credits cannot be bought ('' when it can): the server's bounds. */
export function creditQuantityError(
  o: Pick<CreditOption, 'min' | 'max' | 'step' | 'unit' | 'annual'>,
  quantity: number,
  annual = false
): string {
  const min = annual && o.annual ? o.annual.min : o.min
  if (!Number.isInteger(quantity) || quantity <= 0) return 'Enter a whole number'
  if (quantity < min) return `At least ${num(min)} ${o.unit}${annual ? ' for a year upfront' : ''}`
  if (quantity > o.max) return `At most ${num(o.max)} ${o.unit} at once. Contact us for more`
  if (quantity % o.step !== 0) return `In steps of ${num(o.step)} ${o.unit}`
  return ''
}
